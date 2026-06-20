// Comparison repository — persists the AI Compare results a user saves.

import { supabase } from '../config/supabase.js';
import { ApiError } from '../utils/apiError.js';

export interface SavedComparison {
  id: string;
  propertyIds: string[];
  result: unknown; // the full ComparisonResult (candidates, ranking, verdict)
  createdAt: string;
}

interface ComparisonRow {
  id: string;
  property_ids: string[];
  result: unknown;
  created_at: string;
}

const toSaved = (r: ComparisonRow): SavedComparison => ({
  id: r.id,
  propertyIds: r.property_ids,
  result: r.result,
  createdAt: r.created_at,
});

export const comparisonRepository = {
  async create(userId: string, propertyIds: string[], result: unknown): Promise<SavedComparison> {
    const { data, error } = await supabase
      .from('comparisons')
      .insert({ user_id: userId, property_ids: propertyIds, result })
      .select('*')
      .single();
    if (error) throw new ApiError(500, 'COMPARISON_SAVE_FAILED', error.message);
    return toSaved(data as ComparisonRow);
  },

  async listForUser(userId: string): Promise<SavedComparison[]> {
    const { data, error } = await supabase
      .from('comparisons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new ApiError(500, 'COMPARISON_LIST_FAILED', error.message);
    return (data as ComparisonRow[]).map(toSaved);
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('comparisons')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new ApiError(500, 'COMPARISON_DELETE_FAILED', error.message);
  },
};
