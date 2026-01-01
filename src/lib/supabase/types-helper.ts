// Helper to bypass TypeScript errors for missing table types
// This allows queries to non-existent tables to work temporarily
import { supabase as baseSupabase } from './client';

export const supabase = baseSupabase as any;
