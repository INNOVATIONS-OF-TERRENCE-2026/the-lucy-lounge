/**
 * THE LUCY LOUNGE - PDF Generator
 * 
 * Generates structured PDFs from markdown or text content.
 * Supports contracts, reports, invoices, documents.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFRequest {
  content: string;
  title?: string;
  type?: 'document' | 'contract' | 'report' | 'invoice';
  options?: {
    fontSize?: number;
    margins?: number;
    header?: string;
    footer?: string;
    includeDate?: boolean;
    includePageNumbers?: boolean;
  };
  userId?: string;
}

// Simple PDF builder using raw PDF commands
function buildPDF(content: string, title: string, options: PDFRequest['options'] = {}): Uint8Array {
  const {
    fontSize = 12,
    margins = 50,
    header,
    footer,
    includeDate = true,
    includePageNumbers = true,
  } = options;

  const pageWidth = 612;  // US Letter width in points
  const pageHeight = 792; // US Letter height in points
  const contentWidth = pageWidth - (margins * 2);
  
  // Parse content into lines
  const lines = content.split('\n');
  const lineHeight = fontSize * 1.5;
  const linesPerPage = Math.floor((pageHeight - margins * 2 - 60) / lineHeight);

  // Build PDF structure
  const objects: string[] = [];
  let objectCount = 0;

  // Helper to add PDF object
  const addObject = (content: string): number => {
    objectCount++;
    objects.push(content);
    return objectCount;
  };

  // Catalog
  const catalogRef = addObject(`<< /Type /Catalog /Pages 2 0 R >>`);

  // Pages placeholder (will be updated)
  const pagesRef = addObject(`PAGES_PLACEHOLDER`);

  // Font
  const fontRef = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
  const fontBoldRef = addObject(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

  // Generate pages
  const pageRefs: number[] = [];
  const contentRefs: number[] = [];

  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    chunks.push(lines.slice(i, i + linesPerPage));
  }

  if (chunks.length === 0) chunks.push(['']);

  chunks.forEach((pageLines, pageIndex) => {
    // Page content stream
    let stream = `BT\n`;
    stream += `/F1 ${fontSize} Tf\n`;

    // Title on first page
    if (pageIndex === 0 && title) {
      stream += `${margins} ${pageHeight - margins - 20} Td\n`;
      stream += `/F2 16 Tf\n`;
      stream += `(${escapeString(title)}) Tj\n`;
      stream += `0 -30 Td\n`;
      stream += `/F1 ${fontSize} Tf\n`;
      
      if (includeDate) {
        const date = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric' 
        });
        stream += `(${date}) Tj\n`;
        stream += `0 -${lineHeight * 1.5} Td\n`;
      }
    } else {
      stream += `${margins} ${pageHeight - margins} Td\n`;
    }

    // Content lines
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) stream += `0 -${lineHeight} Td\n`;
      
      // Handle headers (lines starting with #)
      if (line.startsWith('# ')) {
        stream += `/F2 14 Tf\n`;
        stream += `(${escapeString(line.substring(2))}) Tj\n`;
        stream += `/F1 ${fontSize} Tf\n`;
      } else if (line.startsWith('## ')) {
        stream += `/F2 12 Tf\n`;
        stream += `(${escapeString(line.substring(3))}) Tj\n`;
        stream += `/F1 ${fontSize} Tf\n`;
      } else {
        stream += `(${escapeString(line)}) Tj\n`;
      }
    });

    // Page number
    if (includePageNumbers) {
      stream += `0 -${lineHeight * 2} Td\n`;
      stream += `(Page ${pageIndex + 1} of ${chunks.length}) Tj\n`;
    }

    stream += `ET`;

    const contentRef = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    contentRefs.push(contentRef);

    const pageRef = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> ` +
      `/Contents ${contentRef} 0 R >>`
    );
    pageRefs.push(pageRef);
  });

  // Update pages object
  const pageKids = pageRefs.map(r => `${r} 0 R`).join(' ');
  objects[1] = `<< /Type /Pages /Kids [${pageKids}] /Count ${pageRefs.length} >>`;

  // Build PDF file
  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [];

  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  // Cross-reference table
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  offsets.forEach(offset => {
    pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });

  // Trailer
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function escapeString(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Replace non-ASCII with space
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const body: PDFRequest = await req.json();
    const { content, title = 'Document', type = 'document', options, userId } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[pdf-generator] Generating ${type} PDF: ${title}`);

    // Generate PDF
    const pdfBytes = buildPDF(content, title, options);

    // Generate filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    const filename = `${safeTitle}_${timestamp}_${randomId}.pdf`;

    let pdfUrl: string;
    let storedPath: string | null = null;

    // Store in Supabase
    if (SUPABASE_URL && SUPABASE_KEY && userId) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        const storagePath = `${userId}/documents/${filename}`;

        const { error: uploadError } = await supabase.storage
          .from('ai-outputs')
          .upload(storagePath, pdfBytes, {
            contentType: 'application/pdf',
            upsert: false,
          });

        if (!uploadError) {
          const { data: signedData } = await supabase.storage
            .from('ai-outputs')
            .createSignedUrl(storagePath, 3600);

          if (signedData?.signedUrl) {
            pdfUrl = signedData.signedUrl;
            storedPath = storagePath;

            await supabase.from('user_ai_outputs').insert({
              user_id: userId,
              output_type: 'document',
              model_used: 'internal-pdf-generator',
              prompt: title,
              storage_path: storagePath,
              metadata: { type, contentLength: content.length },
            });
          }
        }
      } catch (storageError) {
        console.error('[pdf-generator] Storage error:', storageError);
      }
    }

    // Fallback to base64
    if (!pdfUrl!) {
      const base64 = btoa(String.fromCharCode(...pdfBytes));
      pdfUrl = `data:application/pdf;base64,${base64}`;
    }

    return new Response(JSON.stringify({
      success: true,
      pdfUrl,
      storagePath: storedPath,
      filename,
      title,
      type,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[pdf-generator] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'PDF generation failed',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
