export type NewsItem = {
    id: string;
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    score?: number;
    comments?: number;
    by?: string;
    summary?: string;
};

export type NewsResponse = {
    items: NewsItem[];
    error?: string;
};

export type AICategory = string;
export type NewsSource = string;