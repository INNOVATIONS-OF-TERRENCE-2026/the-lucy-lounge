/**
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ THE LUCY LOUNGE — DEV STUDIO AI SERVICE                                    │
 * │                                                                             │
 * │ Prompt-to-code generation pipeline with live preview                       │
 * │ AI-powered code generation, modification, and deployment                   │
 * │                                                                             │
 * │ Lucy builds with you.                                                      │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

import { supabase } from '@/integrations/supabase/client';

// =============================================================================
// TYPES
// =============================================================================

export interface GeneratedFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface GenerationResult {
  files: GeneratedFile[];
  explanation: string;
  suggestedNextSteps: string[];
}

export interface CodeModification {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  explanation: string;
}

export interface ProjectContext {
  projectId: string;
  projectType: string;
  existingFiles: { path: string; content: string }[];
  userPrompt: string;
}

// =============================================================================
// CODE GENERATION
// =============================================================================

/**
 * Generate code from a natural language prompt
 */
export async function generateFromPrompt(
  prompt: string,
  projectType: 'react' | 'landing' | 'api' | 'blank' = 'react',
  existingContext?: { files: { path: string; content: string }[] }
): Promise<GenerationResult> {
  const systemPrompt = getSystemPromptForProjectType(projectType);
  
  const contextInfo = existingContext?.files?.length 
    ? `\n\nExisting project files:\n${existingContext.files.map(f => `${f.path}:\n\`\`\`\n${f.content.slice(0, 500)}...\n\`\`\``).join('\n\n')}`
    : '';

  try {
    const { data, error } = await supabase.functions.invoke('lucy-router', {
      body: {
        userId: 'dev-studio',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${prompt}${contextInfo}\n\nGenerate the code files needed. Format your response as JSON with this structure:\n{\n  "files": [{"path": "src/...", "name": "filename.tsx", "content": "...code...", "language": "typescript"}],\n  "explanation": "What was created",\n  "suggestedNextSteps": ["step1", "step2"]\n}` }
        ],
        context: { mode: 'code-generation', projectType },
      },
    });

    if (error) throw error;

    // Parse the response
    const responseText = data?.plan?.finalAnswer || data?.response || '';
    
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*"files"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          files: parsed.files || [],
          explanation: parsed.explanation || 'Code generated successfully',
          suggestedNextSteps: parsed.suggestedNextSteps || [],
        };
      } catch {
        // If JSON parsing fails, create a single file from the response
        return createFallbackResult(responseText, projectType);
      }
    }

    return createFallbackResult(responseText, projectType);

  } catch (err) {
    console.error('[DevStudioAI] Generation error:', err);
    throw new Error('Failed to generate code. Please try again.');
  }
}

/**
 * Modify existing code based on a prompt
 */
export async function modifyCode(
  filePath: string,
  currentContent: string,
  modificationPrompt: string
): Promise<CodeModification> {
  try {
    const { data, error } = await supabase.functions.invoke('lucy-router', {
      body: {
        userId: 'dev-studio',
        messages: [
          { 
            role: 'system', 
            content: `You are a code modification assistant. Given existing code and a modification request, output ONLY the modified code. Do not include explanations in the code output - put explanations in a separate field.`
          },
          { 
            role: 'user', 
            content: `File: ${filePath}\n\nCurrent code:\n\`\`\`\n${currentContent}\n\`\`\`\n\nModification request: ${modificationPrompt}\n\nRespond with JSON:\n{"modifiedContent": "...full modified code...", "explanation": "what was changed"}`
          }
        ],
        context: { mode: 'code-modification' },
      },
    });

    if (error) throw error;

    const responseText = data?.plan?.finalAnswer || data?.response || '';
    
    // Try to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*"modifiedContent"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          filePath,
          originalContent: currentContent,
          modifiedContent: parsed.modifiedContent || currentContent,
          explanation: parsed.explanation || 'Code modified',
        };
      } catch {
        // Extract code block if JSON fails
        const codeMatch = responseText.match(/```[\w]*\n([\s\S]*?)```/);
        return {
          filePath,
          originalContent: currentContent,
          modifiedContent: codeMatch?.[1] || responseText,
          explanation: 'Code modified based on your request',
        };
      }
    }

    return {
      filePath,
      originalContent: currentContent,
      modifiedContent: currentContent,
      explanation: 'No changes made',
    };

  } catch (err) {
    console.error('[DevStudioAI] Modification error:', err);
    throw new Error('Failed to modify code. Please try again.');
  }
}

/**
 * Explain code
 */
export async function explainCode(code: string, language: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('lucy-router', {
      body: {
        userId: 'dev-studio',
        messages: [
          { 
            role: 'system', 
            content: 'You are a code explanation assistant. Explain code clearly and concisely, highlighting key concepts and patterns.'
          },
          { 
            role: 'user', 
            content: `Explain this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        context: { mode: 'code-explanation' },
      },
    });

    if (error) throw error;

    return data?.plan?.finalAnswer || data?.response || 'Unable to explain code.';

  } catch (err) {
    console.error('[DevStudioAI] Explanation error:', err);
    return 'Failed to explain code.';
  }
}

/**
 * Fix code errors
 */
export async function fixCodeErrors(
  code: string,
  errorMessage: string,
  language: string
): Promise<{ fixedCode: string; explanation: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('lucy-router', {
      body: {
        userId: 'dev-studio',
        messages: [
          { 
            role: 'system', 
            content: 'You are a code debugging assistant. Fix the error in the code and explain what was wrong.'
          },
          { 
            role: 'user', 
            content: `Fix this ${language} code that has the following error:\n\nError: ${errorMessage}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\`\n\nRespond with JSON: {"fixedCode": "...code...", "explanation": "what was fixed"}`
          }
        ],
        context: { mode: 'code-fix' },
      },
    });

    if (error) throw error;

    const responseText = data?.plan?.finalAnswer || data?.response || '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*"fixedCode"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          fixedCode: parsed.fixedCode || code,
          explanation: parsed.explanation || 'Error fixed',
        };
      } catch {
        const codeMatch = responseText.match(/```[\w]*\n([\s\S]*?)```/);
        return {
          fixedCode: codeMatch?.[1] || code,
          explanation: 'Error fixed based on the error message',
        };
      }
    }

    return { fixedCode: code, explanation: 'Unable to fix error' };

  } catch (err) {
    console.error('[DevStudioAI] Fix error:', err);
    return { fixedCode: code, explanation: 'Failed to fix error' };
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function getSystemPromptForProjectType(projectType: string): string {
  const prompts: Record<string, string> = {
    react: `You are an expert React/TypeScript developer. Generate clean, modern React code using:
- TypeScript for type safety
- Tailwind CSS for styling
- Functional components with hooks
- Best practices for performance and accessibility
Always generate complete, working code files.`,

    landing: `You are an expert web developer specializing in landing pages. Generate:
- Clean HTML5 with semantic markup
- Modern CSS with Tailwind classes
- Responsive design (mobile-first)
- Engaging, conversion-focused layouts
Always generate complete, working code files.`,

    api: `You are an expert backend developer. Generate:
- Clean, RESTful API endpoints
- TypeScript/JavaScript code
- Proper error handling
- Input validation
- Clear documentation comments
Always generate complete, working code files.`,

    blank: `You are an expert full-stack developer. Generate clean, well-structured code following best practices for the requested technology. Always generate complete, working code files.`,
  };

  return prompts[projectType] || prompts.blank;
}

function createFallbackResult(responseText: string, projectType: string): GenerationResult {
  // Try to extract code blocks
  const codeBlocks = responseText.matchAll(/```(\w+)?\n([\s\S]*?)```/g);
  const files: GeneratedFile[] = [];
  let index = 0;

  for (const match of codeBlocks) {
    const language = match[1] || 'typescript';
    const content = match[2];
    const ext = getExtensionForLanguage(language);
    
    files.push({
      path: `src/generated-${index}.${ext}`,
      name: `generated-${index}.${ext}`,
      content,
      language,
    });
    index++;
  }

  // If no code blocks found, create a single file
  if (files.length === 0) {
    const ext = projectType === 'landing' ? 'html' : 'tsx';
    files.push({
      path: `src/App.${ext}`,
      name: `App.${ext}`,
      content: responseText,
      language: projectType === 'landing' ? 'html' : 'typescript',
    });
  }

  return {
    files,
    explanation: 'Code generated from your prompt',
    suggestedNextSteps: ['Review the generated code', 'Make any necessary adjustments', 'Test in preview'],
  };
}

function getExtensionForLanguage(language: string): string {
  const extensions: Record<string, string> = {
    typescript: 'tsx',
    javascript: 'jsx',
    html: 'html',
    css: 'css',
    json: 'json',
    python: 'py',
    sql: 'sql',
  };
  return extensions[language.toLowerCase()] || 'txt';
}

// =============================================================================
// TEMPLATES
// =============================================================================

export const PROJECT_TEMPLATES = {
  react: {
    name: 'React App',
    description: 'Modern React application with TypeScript and Tailwind',
    files: [
      {
        path: 'src/App.tsx',
        name: 'App.tsx',
        content: `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Your App
        </h1>
        <div className="flex justify-center">
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
          >
            Count: {count}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;`,
        language: 'typescript',
      },
      {
        path: 'src/index.css',
        name: 'index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
        language: 'css',
      },
    ],
  },

  landing: {
    name: 'Landing Page',
    description: 'Beautiful landing page with hero and features',
    files: [
      {
        path: 'index.html',
        name: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Product</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
  <header class="container mx-auto px-4 py-6">
    <nav class="flex justify-between items-center">
      <div class="text-2xl font-bold">Logo</div>
      <div class="space-x-6">
        <a href="#features" class="hover:text-blue-400">Features</a>
        <a href="#pricing" class="hover:text-blue-400">Pricing</a>
        <a href="#contact" class="hover:text-blue-400">Contact</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="container mx-auto px-4 py-20 text-center">
      <h1 class="text-5xl font-bold mb-6">Your Amazing Product</h1>
      <p class="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
        A brief description of what your product does and why it's amazing.
      </p>
      <button class="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-lg">
        Get Started
      </button>
    </section>
  </main>
</body>
</html>`,
        language: 'html',
      },
    ],
  },

  blank: {
    name: 'Blank Project',
    description: 'Start from scratch',
    files: [
      {
        path: 'src/index.ts',
        name: 'index.ts',
        content: `// Your code here\nconsole.log('Hello, World!');`,
        language: 'typescript',
      },
    ],
  },
};

export default {
  generateFromPrompt,
  modifyCode,
  explainCode,
  fixCodeErrors,
  PROJECT_TEMPLATES,
};
