

# Lucy Lounge Emergency Fix Plan

## Summary
The application is crashing on startup due to two critical issues that must be fixed in sequence:
1. **Supabase client cannot initialize** - using wrong environment variable name
2. **TypeScript build errors** - type mismatches blocking compilation

---

## Root Cause Analysis

### Issue 1: Supabase Client Failure
The Supabase client file was modified to use `VITE_SUPABASE_ANON_KEY`, but the Lovable Cloud secrets only have `VITE_SUPABASE_PUBLISHABLE_KEY` configured. When the environment variable is missing, the code falls back to an empty string, causing `createClient()` to crash.

### Issue 2: TypeScript Type Errors
Several components pass `string` values where TypeScript expects specific union types (like `'sdxl' | 'sdxlTurbo' | ...`), causing build failures.

---

## Fix Plan

### Step 1: Restore Supabase Client (Critical)
Restore the client to use the correct environment variable that is actually configured:

```text
File: src/integrations/supabase/client.ts

Change line 9 from:
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

To:
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

This ensures:
- Uses the key that IS configured in Lovable Cloud (`VITE_SUPABASE_PUBLISHABLE_KEY`)
- Falls back to `VITE_SUPABASE_ANON_KEY` for compatibility
- The URL fallback already points to the production project

### Step 2: Fix TypeScript Errors in AIGenerationModal
Add type assertions to ensure state values match expected types:

```text
File: src/components/chat/AIGenerationModal.tsx

Line 120: Cast imageModel to the expected type
Line 139: Cast videoModel to the expected type  
Line 157: Cast musicStyle to the expected type
Line 190: Fix the generatePDF call signature
```

### Step 3: Fix TypeScript Errors in ChatMessage
The `MultimodalOutput` component's `type` prop expects `AIIntent`, but `MultimodalData.type` includes `'audio'` which is not in `AIIntent`.

Solution: Add type assertion with validation.

### Step 4: Fix TypeScript Errors in MultimodalOutput
Lines 274 and 286 have `unknown` type being used where `ReactNode` is expected.

Solution: Add proper type casting for metadata display.

### Step 5: Remove Deno Warning (Optional)
Remove `allowJs` from `supabase/functions/deno.json` as it's not supported.

---

## Technical Details

### Files Modified
1. `src/integrations/supabase/client.ts` - Fix environment variable usage
2. `src/components/chat/AIGenerationModal.tsx` - Add type assertions
3. `src/components/chat/ChatMessage.tsx` - Add type mapping
4. `src/components/chat/MultimodalOutput.tsx` - Fix metadata display types
5. `supabase/functions/deno.json` - Remove unsupported option

### Safety Guarantees
- No routes deleted
- No components removed
- No architectural changes
- No provider ordering changes
- All existing features preserved

### Verification Checklist
After fix, confirm:
- `/` renders the Landing page
- `/auth` renders the Auth page
- `/chat` renders the Chat interface
- `/studios` renders correctly
- `/studios/audio` renders correctly
- No console errors
- Auth flow works (login/logout)
- Chat messages display correctly

---

## Expected Outcome
The application will:
1. Initialize Supabase client successfully
2. Build without TypeScript errors
3. Render all pages correctly
4. Maintain all existing functionality

