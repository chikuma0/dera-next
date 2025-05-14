import { createClient } from '@supabase/supabase-js';
import { 
  ImplementationBlueprint, 
  BlueprintCategory, 
  BlueprintDifficulty, 
  ProgrammingLanguage 
} from '@/types/blueprint';

interface GetPublishedBlueprintsParams {
  category?: BlueprintCategory;
  difficulty?: BlueprintDifficulty;
  programmingLanguage?: ProgrammingLanguage;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

interface GetPublishedBlueprintsResult {
  data: ImplementationBlueprint[];
  count: number;
}

export default class BlueprintService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  async getPublishedBlueprints({
    category,
    difficulty,
    programmingLanguage,
    searchTerm,
    page = 1,
    limit = 9
  }: GetPublishedBlueprintsParams): Promise<GetPublishedBlueprintsResult> {
    let query = this.supabase
      .from('blueprints')
      .select('*', { count: 'exact' })
      .eq('published', true);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (programmingLanguage) {
      query = query.contains('programmingLanguages', [programmingLanguage]);
    }
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Apply pagination
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return {
      data: data as ImplementationBlueprint[],
      count: count || 0
    };
  }

  async getBlueprintById(id: string): Promise<ImplementationBlueprint | null> {
    const { data, error } = await this.supabase
      .from('blueprints')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data as ImplementationBlueprint;
  }

  async recordView(blueprintId: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_view_count', {
      blueprint_id: blueprintId
    });

    if (error) {
      throw error;
    }
  }
} 