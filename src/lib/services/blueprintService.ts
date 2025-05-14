import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { validateEnv } from '../config/env';
import { 
  ImplementationBlueprint, 
  BlueprintCategory, 
  BlueprintDifficulty, 
  BlueprintStep,
  BlueprintResource,
  JapaneseContext,
  ProgrammingLanguage,
  BlueprintPrerequisite
} from '@/types/blueprint';
import { Database } from '@/types/supabase';
import { getAllBlueprints, getBlueprintById as getSeedBlueprintById, getPublishedBlueprints as getSeedPublishedBlueprints, getTopRatedBlueprints as getSeedTopRatedBlueprints } from "@/lib/data/seedBlueprints";

type BlueprintRow = Database['public']['Tables']['blueprints']['Row'];
type BlueprintInsert = Database['public']['Tables']['blueprints']['Insert'];
type BlueprintUpdate = Database['public']['Tables']['blueprints']['Update'];
type Json = Database['public']['Tables']['blueprints']['Row']['steps'];

export class BlueprintService {
  private supabase: SupabaseClient<Database> | undefined;
  private useSeedData = true; // Set to false when ready to use real database
  
  constructor() {
    const env = validateEnv();
    if (!this.useSeedData) {
      // Initialize supabase client if not using seed data
      this.supabase = createClient<Database>(env.supabase.url, env.supabase.serviceRoleKey);
    }
  }
  
  private isSupabaseClient(client: SupabaseClient<Database> | undefined): client is SupabaseClient<Database> {
    return client !== undefined;
  }
  
  private ensureSupabaseClient(): SupabaseClient<Database> {
    if (!this.isSupabaseClient(this.supabase)) {
      throw new Error('Supabase client not initialized');
    }
    return this.supabase;
  }
  
  /**
   * Get all published blueprints with optional filtering
   */
  async getPublishedBlueprints(options?: {
    category?: BlueprintCategory;
    difficulty?: BlueprintDifficulty;
    programmingLanguage?: ProgrammingLanguage;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: ImplementationBlueprint[]; count: number }> {
    try {
      if (this.useSeedData) {
        const blueprints = getSeedPublishedBlueprints();
        return {
          data: blueprints,
          count: blueprints.length
        };
      }

      const supabase = this.ensureSupabaseClient();
      let query = supabase
        .from('blueprints')
        .select('*', { count: 'exact' })
        .eq('published', true);

      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.difficulty) {
        query = query.eq('difficulty', options.difficulty);
      }
      
      if (options?.programmingLanguage) {
        query = query.contains('programmingLanguages', [options.programmingLanguage]);
      }
      
      if (options?.searchTerm) {
        query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
      }
      
      // Apply pagination
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const startIdx = (page - 1) * limit;
      
      query = query.range(startIdx, startIdx + limit - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return {
        data: (data || []).map(row => this.mapBlueprintRowToImplementationBlueprint(row)),
        count: count || 0
      };
    } catch (error) {
      console.error('Error fetching blueprints:', error);
      throw new Error('Failed to fetch blueprints');
    }
  }
  
  /**
   * Get a specific blueprint by ID with all details
   */
  async getBlueprintById(id: string): Promise<ImplementationBlueprint | null> {
    try {
      if (this.useSeedData) {
        const blueprint = getSeedBlueprintById(id);
        return blueprint || null;
      }
      
      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return data ? this.mapBlueprintRowToImplementationBlueprint(data) : null;
    } catch (error) {
      console.error('Error fetching blueprint:', error);
      return null;
    }
  }
  
  /**
   * Record a view of a blueprint
   */
  async recordBlueprintView(blueprintId: string): Promise<void> {
    try {
      if (this.useSeedData) {
        console.log(`[SEED DATA] Recording view for blueprint ${blueprintId}`);
        return;
      }
      
      const supabase = this.ensureSupabaseClient();
      const { error } = await supabase.rpc('increment_blueprint_view_count', {
        blueprint_id: blueprintId
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error recording blueprint view:', error);
    }
  }
  
  /**
   * Rate a blueprint
   */
  async rateBlueprintById(
    blueprintId: string, 
    userId: string, 
    rating: number, 
    comment?: string
  ): Promise<boolean> {
    try {
      if (this.useSeedData) {
        console.log(`[SEED DATA] Rating blueprint ${blueprintId} with ${rating} stars by user ${userId}`);
        return true;
      }
      
      const supabase = this.ensureSupabaseClient();
      const { data: existingRating, error: checkError } = await supabase
        .from('blueprint_ratings')
        .select('*')
        .eq('blueprint_id', blueprintId)
        .eq('user_id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingRating) {
        const { error } = await supabase
          .from('blueprint_ratings')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRating.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blueprint_ratings')
          .insert({
            blueprint_id: blueprintId,
            user_id: userId,
            rating,
            comment
          });
          
        if (error) throw error;
      }
      
      await this.updateBlueprintAverageRating(blueprintId);
      
      return true;
    } catch (error) {
      console.error('Error rating blueprint:', error);
      return false;
    }
  }
  
  /**
   * Private method to update a blueprint's average rating
   */
  private async updateBlueprintAverageRating(blueprintId: string): Promise<void> {
    try {
      if (this.useSeedData) return;
      
      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprint_ratings')
        .select('rating')
        .eq('blueprint_id', blueprintId);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return;
      
      const sum = data.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0);
      const average = sum / data.length;
      
      const { error: updateError } = await supabase
        .from('blueprints')
        .update({
          rating: average,
          rating_count: data.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', blueprintId);
        
      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating blueprint average rating:', error);
    }
  }
  
  /**
   * Get top-rated blueprints
   */
  async getTopRatedBlueprints(limit: number = 5): Promise<ImplementationBlueprint[]> {
    try {
      if (this.useSeedData) {
        return getSeedTopRatedBlueprints(limit);
      }
      
      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('published', true)
        .order('rating', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return (data || []).map(row => this.mapBlueprintRowToImplementationBlueprint(row));
    } catch (error) {
      console.error('Error fetching top rated blueprints:', error);
      return [];
    }
  }
  
  /**
   * Get recently published blueprints
   */
  async getRecentBlueprints(limit: number = 5): Promise<ImplementationBlueprint[]> {
    try {
      if (this.useSeedData) {
        return getSeedPublishedBlueprints()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      }
      
      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprints')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      
      return (data || []).map(row => this.mapBlueprintRowToImplementationBlueprint(row));
    } catch (error) {
      console.error('Error fetching recent blueprints:', error);
      return [];
    }
  }

  async createBlueprint(blueprint: Omit<ImplementationBlueprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImplementationBlueprint> {
    try {
      if (this.useSeedData) {
        throw new Error('Cannot create blueprints in seed data mode');
      }

      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprints')
        .insert([this.mapImplementationBlueprintToBlueprintInsert(blueprint)])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after creation');
      return this.mapBlueprintRowToImplementationBlueprint(data);
    } catch (error) {
      console.error('Error creating blueprint:', error);
      throw new Error('Failed to create blueprint');
    }
  }

  async updateBlueprint(id: string, blueprint: Partial<ImplementationBlueprint>): Promise<ImplementationBlueprint> {
    try {
      if (this.useSeedData) {
        throw new Error('Cannot update blueprints in seed data mode');
      }

      const supabase = this.ensureSupabaseClient();
      const { data, error } = await supabase
        .from('blueprints')
        .update(this.mapImplementationBlueprintToBlueprintUpdate(blueprint))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned after update');
      return this.mapBlueprintRowToImplementationBlueprint(data);
    } catch (error) {
      console.error('Error updating blueprint:', error);
      throw new Error('Failed to update blueprint');
    }
  }

  async deleteBlueprint(id: string): Promise<void> {
    try {
      if (this.useSeedData) {
        throw new Error('Cannot delete blueprints in seed data mode');
      }

      const supabase = this.ensureSupabaseClient();
      const { error } = await supabase
        .from('blueprints')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      throw new Error('Failed to delete blueprint');
    }
  }

  async rateBlueprint(id: string, rating: number, comment?: string): Promise<void> {
    try {
      if (this.useSeedData) {
        throw new Error('Cannot rate blueprints in seed data mode');
      }

      const supabase = this.ensureSupabaseClient();
      const { error } = await supabase
        .from('blueprint_ratings')
        .insert([{ blueprintId: id, rating, comment }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error rating blueprint:', error);
      throw new Error('Failed to rate blueprint');
    }
  }

  private safeParseJson<T>(json: Json | undefined): T {
    if (!json) return {} as T;
    try {
      return json as unknown as T;
    } catch {
      return {} as T;
    }
  }

  private mapBlueprintRowToImplementationBlueprint(row: BlueprintRow): ImplementationBlueprint {
    const emptyJapaneseContext: JapaneseContext = {
      culturalConsiderations: '',
      regulatoryNotes: '',
      localMarketAdaptation: '',
      successExamples: ''
    };
    const emptyAuthor = { id: '', name: '' };

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty as BlueprintDifficulty,
      category: row.category as BlueprintCategory,
      programmingLanguages: (row.programmingLanguages || []) as ProgrammingLanguage[],
      estimatedTime: row.estimatedTime,
      prerequisites: this.safeParseJson<BlueprintPrerequisite[]>(row.prerequisites) || [],
      steps: this.safeParseJson<BlueprintStep[]>(row.steps) || [],
      resources: this.safeParseJson<BlueprintResource[]>(row.resources) || [],
      japaneseContext: this.safeParseJson<JapaneseContext>(row.japaneseContext) || emptyJapaneseContext,
      author: this.safeParseJson<{ id: string; name: string }>(row.author) || emptyAuthor,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      rating: row.rating,
      ratingCount: row.ratingCount,
      viewCount: row.viewCount,
      published: row.published
    };
  }

  private mapImplementationBlueprintToBlueprintInsert(blueprint: Omit<ImplementationBlueprint, 'id' | 'createdAt' | 'updatedAt'>): BlueprintInsert {
    const { title, description, difficulty, category, programmingLanguages, estimatedTime, prerequisites, steps, resources, japaneseContext, author, rating, ratingCount, viewCount, published } = blueprint;
    
    return {
      title,
      description,
      difficulty,
      category,
      programmingLanguages: programmingLanguages as string[],
      estimatedTime,
      prerequisites: prerequisites as unknown as Json,
      steps: steps as unknown as Json,
      resources: resources as unknown as Json,
      japaneseContext: japaneseContext as unknown as Json,
      author: author as unknown as Json,
      rating,
      ratingCount,
      viewCount,
      published
    };
  }

  private mapImplementationBlueprintToBlueprintUpdate(blueprint: Partial<ImplementationBlueprint>): BlueprintUpdate {
    const update: BlueprintUpdate = {};
    
    if (blueprint.title !== undefined) update.title = blueprint.title;
    if (blueprint.description !== undefined) update.description = blueprint.description;
    if (blueprint.difficulty !== undefined) update.difficulty = blueprint.difficulty;
    if (blueprint.category !== undefined) update.category = blueprint.category;
    if (blueprint.programmingLanguages !== undefined) update.programmingLanguages = blueprint.programmingLanguages as string[];
    if (blueprint.estimatedTime !== undefined) update.estimatedTime = blueprint.estimatedTime;
    if (blueprint.prerequisites !== undefined) update.prerequisites = blueprint.prerequisites as unknown as Json;
    if (blueprint.steps !== undefined) update.steps = blueprint.steps as unknown as Json;
    if (blueprint.resources !== undefined) update.resources = blueprint.resources as unknown as Json;
    if (blueprint.japaneseContext !== undefined) update.japaneseContext = blueprint.japaneseContext as unknown as Json;
    if (blueprint.author !== undefined) update.author = blueprint.author as unknown as Json;
    if (blueprint.rating !== undefined) update.rating = blueprint.rating;
    if (blueprint.ratingCount !== undefined) update.ratingCount = blueprint.ratingCount;
    if (blueprint.viewCount !== undefined) update.viewCount = blueprint.viewCount;
    if (blueprint.published !== undefined) update.published = blueprint.published;
    
    return update;
  }
} 