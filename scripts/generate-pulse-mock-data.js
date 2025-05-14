// scripts/generate-pulse-mock-data.js

const fs = require('fs');
const path = require('path');

// Define mock data structure
function generateMockData() {
  // Generate mock technologies
  const technologies = [
    {
      id: 1,
      name: 'Large Language Models',
      slug: 'large-language-models',
      maturity_level: 'established',
      technology_trend_points: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        mention_count: Math.floor(Math.random() * 15) + 10,
        importance_score: Math.random() * 5 + 5,
        growth_rate: Math.random() * 0.3
      }))
    },
    {
      id: 2,
      name: 'Computer Vision',
      slug: 'computer-vision',
      maturity_level: 'growing',
      technology_trend_points: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        mention_count: Math.floor(Math.random() * 10) + 5,
        importance_score: Math.random() * 4 + 4,
        growth_rate: Math.random() * 0.2
      }))
    },
    {
      id: 3,
      name: 'AI Agents',
      slug: 'ai-agents',
      maturity_level: 'emerging',
      technology_trend_points: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        mention_count: Math.floor(Math.random() * 8) + 3,
        importance_score: Math.random() * 3 + 3,
        growth_rate: Math.random() * 0.5
      }))
    },
    {
      id: 4,
      name: 'Generative AI',
      slug: 'generative-ai',
      maturity_level: 'established',
      technology_trend_points: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        mention_count: Math.floor(Math.random() * 12) + 8,
        importance_score: Math.random() * 4 + 6,
        growth_rate: Math.random() * 0.25
      }))
    },
    {
      id: 5,
      name: 'Multimodal AI',
      slug: 'multimodal-ai',
      maturity_level: 'growing',
      technology_trend_points: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        mention_count: Math.floor(Math.random() * 9) + 6,
        importance_score: Math.random() * 3 + 5,
        growth_rate: Math.random() * 0.35
      }))
    }
  ];

  // Generate mock tweets
    const tweets = [
      {
        id: '1',
        content: 'Just tried the new GPT-4o model and I\'m blown away by its multimodal capabilities! #AI #MachineLearning',
        authorUsername: 'airesearcher',
        authorName: 'AI Researcher',
        authorFollowersCount: 15000,
        likesCount: 342,
        retweetsCount: 87,
        repliesCount: 42,
        quoteCount: 12,
        url: 'https://twitter.com/airesearcher/status/1',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        impactScore: 342 + 87 * 2 + 42,
        isVerified: true,
        hashtags: ['AI', 'MachineLearning']
      },
      {
        id: '2',
        content: 'Our new computer vision system can detect manufacturing defects with 99.8% accuracy. This is a game-changer for quality control! #ComputerVision #AI',
        authorUsername: 'techcorp',
        authorName: 'Tech Corporation',
        authorFollowersCount: 50000,
        likesCount: 521,
        retweetsCount: 134,
        repliesCount: 67,
        quoteCount: 23,
        url: 'https://twitter.com/techcorp/status/2',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        impactScore: 521 + 134 * 2 + 67,
        isVerified: true,
        hashtags: ['ComputerVision', 'AI']
      },
      {
        id: '3',
        content: 'AI agents are revolutionizing customer service. Our chatbot handled 10,000 queries yesterday with a 95% satisfaction rate! #AIAgents #CustomerService',
        authorUsername: 'serviceai',
        authorName: 'Service AI',
        authorFollowersCount: 8500,
        likesCount: 187,
        retweetsCount: 45,
        repliesCount: 23,
        quoteCount: 8,
        url: 'https://twitter.com/serviceai/status/3',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        impactScore: 187 + 45 * 2 + 23,
        isVerified: false,
        hashtags: ['AIAgents', 'CustomerService']
      },
      {
        id: '4',
        content: 'I just used Midjourney to create concept art for my new game. Generative AI is changing how we approach creative work! #GenerativeAI #GameDev',
        authorUsername: 'gamedev',
        authorName: 'Game Developer',
        authorFollowersCount: 12000,
        likesCount: 432,
        retweetsCount: 98,
        repliesCount: 54,
        quoteCount: 17,
        url: 'https://twitter.com/gamedev/status/4',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        impactScore: 432 + 98 * 2 + 54,
        isVerified: false,
        hashtags: ['GenerativeAI', 'GameDev']
      },
      {
        id: '5',
        content: 'Our new multimodal AI system can understand text, images, and audio simultaneously. This opens up so many possibilities! #MultimodalAI #MachineLearning',
        authorUsername: 'ailab',
        authorName: 'AI Research Lab',
        authorFollowersCount: 35000,
        likesCount: 678,
        retweetsCount: 245,
        repliesCount: 89,
        quoteCount: 32,
        url: 'https://twitter.com/ailab/status/5',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        impactScore: 678 + 245 * 2 + 89,
        isVerified: true,
        hashtags: ['MultimodalAI', 'MachineLearning']
      }
    ];
  
    // Generate mock hashtags
    const hashtags = [
      {
        hashtag: 'AI',
        tweetCount: 1245,
        totalLikes: 45678,
        totalRetweets: 12345,
        totalReplies: 8765,
        impactScore: 8.7
      },
      {
        hashtag: 'MachineLearning',
        tweetCount: 876,
        totalLikes: 32456,
        totalRetweets: 8765,
        totalReplies: 5432,
        impactScore: 7.9
      },
      {
        hashtag: 'GenerativeAI',
        tweetCount: 654,
        totalLikes: 23456,
        totalRetweets: 6543,
        totalReplies: 3210,
        impactScore: 8.2
      },
      {
        hashtag: 'ComputerVision',
        tweetCount: 432,
        totalLikes: 15678,
        totalRetweets: 4321,
        totalReplies: 2345,
        impactScore: 7.5
      },
      {
        hashtag: 'AIAgents',
        tweetCount: 321,
        totalLikes: 12345,
        totalRetweets: 3210,
        totalReplies: 1876,
        impactScore: 6.8
      },
      {
        hashtag: 'MultimodalAI',
        tweetCount: 234,
        totalLikes: 9876,
        totalRetweets: 2345,
        totalReplies: 1234,
        impactScore: 7.2
      }
    ];

  // Generate mock impact data
  const industries = [
    'Healthcare', 'Finance', 'Manufacturing', 'Retail', 
    'Education', 'Transportation', 'Energy', 'Technology'
  ];

  const impactHeatmap = [];
  technologies.forEach(tech => {
    // For each technology, create impact data for 3-5 random industries
    const numIndustries = Math.floor(Math.random() * 3) + 3; // 3-5 industries
    const selectedIndustries = [...industries]
      .sort(() => 0.5 - Math.random())
      .slice(0, numIndustries);
    
    selectedIndustries.forEach(industry => {
      impactHeatmap.push({
        technologyId: tech.id,
        technologyName: tech.name,
        industryId: industries.indexOf(industry) + 1,
        industryName: industry,
        impactLevel: Math.floor(Math.random() * 5) + 3 // Random impact level between 3-8
      });
    });
  });

  // Generate mock insights
  const insightTypes = ['disruption', 'transformation', 'opportunity', 'efficiency'];
  const insights = technologies.map((tech, index) => {
    const insightType = insightTypes[index % insightTypes.length];
    const relatedIndustries = impactHeatmap
      .filter(item => item.technologyId === tech.id)
      .map(item => item.industryName)
      .slice(0, 3)
      .join(', ');
    
    return {
      id: index + 1,
      technologyId: tech.id,
      technologyName: tech.name,
      title: `${tech.name} Transforming ${relatedIndustries}`,
      summary: `${tech.name} is showing significant impact across multiple industries, particularly in ${relatedIndustries}. Organizations implementing this technology are reporting improvements in operational efficiency and competitive advantage.`,
      insightType,
      createdAt: new Date().toISOString()
    };
  });

  // Combine all data
  return {
    trendData: {
      technologies,
      socialData: {
        tweets,
        hashtags
      }
    },
    impactData: {
      topTechnologies: technologies.map(tech => ({
        id: tech.id,
        name: tech.name,
        slug: tech.slug,
        maxImpact: Math.floor(Math.random() * 3) + 7, // Random impact score between 7-10
        maturityLevel: tech.maturity_level
      })),
      impactHeatmap,
      latestInsights: insights
    }
  };
};

// Generate and save mock data
const mockData = generateMockData();
const outputPath = path.join(__dirname, '..', 'src', 'lib', 'services', 'mockPulseData.json');

fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
console.log(`Mock data generated and saved to ${outputPath}`);