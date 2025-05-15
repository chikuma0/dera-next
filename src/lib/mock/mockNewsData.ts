import { NewsItem } from '@/types/news';

// Define a simple category type since it's not in the main types
type NewsCategory = {
  id: string;
  name: string;
  description: string;
};

// Mock news categories
export const mockCategories: NewsCategory[] = [
  { id: '1', name: 'AI & ML', description: 'Artificial Intelligence and Machine Learning news' },
  { id: '2', name: 'Startups', description: 'AI startup news and funding' },
  { id: '3', name: 'Research', description: 'Academic AI research and papers' },
  { id: '4', name: 'Industry', description: 'Industry applications of AI' },
  { id: '5', name: 'Policy', description: 'AI regulation and policy news' }
];

// Mock news items
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-5 with Enhanced Reasoning Capabilities',
    summary: 'The latest large language model shows significant improvements in mathematical reasoning and long-context understanding.',
    source: 'AI Insider',
    source_id: '1',
    source_name: 'AI Insider',
    source_logo: 'https://example.com/ai-insider-logo.png',
    url: 'https://example.com/gpt5-announcement',
    published_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1677442135196-9466775a2c51?q=80&w=800',
    importance_score: 95,
    relevance_score: 95,
    categories: ['AI & ML', 'Research'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_at: new Date()
  },
  {
    id: '2',
    title: 'Anthropic Raises $450M in Series C Funding',
    summary: 'The AI safety startup plans to scale its constitutional AI approach to larger models.',
    source: 'VentureBeat',
    source_id: '2',
    source_name: 'VentureBeat',
    source_logo: 'https://example.com/venturebeat-logo.png',
    url: 'https://example.com/anthropic-funding',
    published_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800',
    importance_score: 88,
    relevance_score: 88,
    categories: ['Startups'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updated_at: new Date()
  },
  {
    id: '3',
    title: 'EU Proposes Stricter AI Regulations for High-Risk Applications',
    summary: 'New legislation would require transparency and risk assessments for AI systems in critical sectors.',
    source: 'Politico',
    source_id: '3',
    source_name: 'Politico',
    source_logo: 'https://example.com/politico-logo.png',
    url: 'https://example.com/eu-ai-regulations',
    published_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1508784411316-02b8cd57fef9?q=80&w=800',
    importance_score: 90,
    relevance_score: 90,
    categories: ['Policy'],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updated_at: new Date()
  },
  {
    id: '4',
    title: 'Microsoft Integrates AI Copilot Across Office 365',
    summary: 'New AI features will help users write documents, create presentations, and analyze data.',
    source: 'The Verge',
    source_id: '4',
    source_name: 'The Verge',
    source_logo: 'https://example.com/theverge-logo.png',
    url: 'https://example.com/microsoft-office-ai',
    published_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1633356122544-f134324b6cee?q=80&w=800',
    importance_score: 85,
    relevance_score: 85,
    categories: ['Industry'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updated_at: new Date()
  },
  {
    id: '5',
    title: 'Meta Releases Open-Source AI Model for Medical Imaging Analysis',
    summary: 'New model achieves state-of-the-art results in detecting abnormalities across multiple imaging modalities.',
    source: 'TechCrunch',
    source_id: '5',
    source_name: 'TechCrunch',
    source_logo: 'https://example.com/techcrunch-logo.png',
    url: 'https://example.com/meta-medical-ai',
    published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1581595219315-a187dd160949?q=80&w=800',
    importance_score: 82,
    relevance_score: 82,
    categories: ['AI & ML', 'Research'],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    updated_at: new Date()
  },
  {
    id: '6',
    title: 'AI Startup Cohere Valued at $2 Billion in New Funding Round',
    summary: 'The company plans to expand its natural language processing technology to more enterprise customers.',
    source: 'Bloomberg',
    source_id: '6',
    source_name: 'Bloomberg',
    source_logo: 'https://example.com/bloomberg-logo.png',
    url: 'https://example.com/cohere-funding',
    published_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800',
    importance_score: 80,
    relevance_score: 80,
    categories: ['Startups'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updated_at: new Date()
  },
  {
    id: '7',
    title: 'Japanese Government Announces $2B AI Investment Plan',
    summary: 'New initiative aims to accelerate AI adoption across multiple sectors including healthcare, manufacturing, and agriculture.',
    content: 'The Japanese government has announced a $2 billion investment plan to accelerate artificial intelligence adoption across multiple sectors of the economy. The initiative will focus on healthcare, manufacturing, agriculture, and public services, with special emphasis on addressing Japan\'s aging population challenges.',
    source_id: '7',
    source_name: 'Japan Economic News',
    url: 'https://example.com/japan-ai-investment',
    published_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    collected_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    image_url: 'https://images.unsplash.com/photo-1532322608303-9f4bf8eb33e6?q=80&w=800',
    relevance_score: 92,
    ai_processed: true,
    status: 'published',
    categories: ['Policy', 'Industry']
  },
  {
    id: '8',
    title: 'New AI Ethics Framework Proposed by International Coalition',
    summary: 'Framework addresses transparency, fairness, privacy, and accountability in AI development.',
    content: 'An international coalition of researchers, industry leaders, and policymakers has proposed a new ethics framework for artificial intelligence. The framework addresses key concerns including algorithmic transparency, fairness, privacy protection, and accountability in AI development and deployment.',
    source_id: '8',
    source_name: 'Tech Ethics Journal',
    url: 'https://example.com/ai-ethics-framework',
    published_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    collected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    image_url: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=800',
    relevance_score: 78,
    ai_processed: true,
    status: 'published',
    categories: ['Policy', 'Research'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updated_at: new Date()
  },
  {
    id: '9',
    title: 'Anthropic Unveils Claude 3: A Safer, More Interpretable AI Assistant',
    summary: 'New AI system focuses on transparency and reduced hallucination rates compared to competitors.',
    content: 'Anthropic has unveiled Claude 3, its latest AI assistant model designed with a focus on safety and interpretability. The company claims the new system demonstrates significantly lower hallucination rates than competitors while providing more transparent reasoning for its outputs.',
    source_id: '9',
    source_name: 'AI Review',
    url: 'https://example.com/claude-3-release',
    published_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    language: 'en',
    image_url: 'https://images.unsplash.com/photo-1511376868136-742c0de277e5?q=80&w=800',
    relevance_score: 87,
    ai_processed: true,
    status: 'published',
    categories: ['AI & ML'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updated_at: new Date()
  },
  {
    id: '10',
    title: 'AI-Powered Drug Discovery Platform Identifies Novel Antibiotics',
    summary: 'Machine learning system successfully identifies compounds effective against drug-resistant bacteria.',
    content: 'A new AI-powered drug discovery platform has successfully identified several novel antibiotic compounds effective against drug-resistant bacteria. The machine learning system, developed by a team at MIT, screened millions of chemical compounds to identify structures with potential antimicrobial properties not recognized by traditional discovery methods.',
    source_id: '10',
    source_name: 'BioTech Advances',
    url: 'https://example.com/ai-antibiotics-discovery',
    published_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    collected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    image_url: 'https://images.unsplash.com/photo-1542736667-069246bdbc6d?q=80&w=800',
    relevance_score: 89,
    ai_processed: true,
    status: 'published',
    categories: ['Research', 'Industry']
  },
  {
    id: '11',
    title: 'Revolutionary AI Chip Matches Human Brain Efficiency',
    summary: 'New neuromorphic computing architecture demonstrates power efficiency similar to biological brains.',
    content: 'Researchers have developed a revolutionary AI chip with a neuromorphic computing architecture that demonstrates power efficiency approaching that of biological brains. The chip uses novel materials and a spike-based processing approach to achieve significant improvements in energy consumption while maintaining high computational throughput.',
    source_id: '11',
    source_name: 'Computing Frontiers',
    url: 'https://example.com/neuromorphic-ai-chip',
    published_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    collected_at: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800',
    relevance_score: 94,
    ai_processed: true,
    status: 'published',
    categories: ['AI & ML', 'Research']
  },
  {
    id: '12',
    title: 'AI System Autonomously Optimizes Semiconductor Manufacturing Process',
    summary: 'Self-learning system improves yield rates by 35% in commercial implementation.',
    content: 'A new AI system has demonstrated the ability to autonomously optimize semiconductor manufacturing processes, improving yield rates by approximately 35% in commercial implementation. The self-learning system continuously adjusts manufacturing parameters based on real-time data analysis and predictive modeling.',
    source_id: '12',
    source_name: 'Semiconductor News',
    url: 'https://example.com/ai-semiconductor-optimization',
    published_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    collected_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    image_url: 'https://images.unsplash.com/photo-1544986581-efac024faf62?q=80&w=800',
    relevance_score: 86,
    ai_processed: true,
    status: 'published',
    categories: ['Industry', 'AI & ML']
  }
]; 