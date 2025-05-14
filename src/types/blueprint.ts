export type BlueprintDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type BlueprintCategory = 
  | 'chatbot' 
  | 'recommendation-system' 
  | 'content-generation' 
  | 'image-recognition' 
  | 'data-analysis' 
  | 'nlp' 
  | 'voice-ai' 
  | 'other';

export type ProgrammingLanguage = 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'java' 
  | 'csharp' 
  | 'rust' 
  | 'go' 
  | 'ruby' 
  | 'php';

export type ResourceType = 
  | 'documentation' 
  | 'video' 
  | 'article' 
  | 'github' 
  | 'api' 
  | 'tool';

export interface BlueprintResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  description: string;
}

export interface BlueprintStep {
  id: string;
  order: number;
  title: string;
  description: string;
  codeBlock?: {
    language: string;
    code: string;
  };
  images?: string[];
}

export interface BlueprintPrerequisite {
  id: string;
  title: string;
  description: string;
}

export interface JapaneseContext {
  culturalConsiderations: string;
  regulatoryNotes: string;
  localMarketAdaptation: string;
  successExamples: string;
}

export interface ImplementationBlueprint {
  id: string;
  title: string;
  description: string;
  difficulty: BlueprintDifficulty;
  category: BlueprintCategory;
  programmingLanguages: ProgrammingLanguage[];
  estimatedTime: number; // in hours
  prerequisites: BlueprintPrerequisite[];
  steps: BlueprintStep[];
  resources: BlueprintResource[];
  japaneseContext: JapaneseContext;
  author: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  rating: number;
  ratingCount: number;
  viewCount: number;
  published: boolean;
}

export interface BlueprintRating {
  id: string;
  blueprintId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
} 