// scripts/add-sample-impact-data.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Adding sample impact data for technologies...');
  
  try {
    // Get Supabase credentials
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get all technologies
    const { data: allTechnologies, error: techError } = await supabase
      .from('ai_technologies')
      .select('id, name, slug, maturity_level');
    
    if (techError || !allTechnologies) {
      console.error('Error fetching technologies:', techError);
      return;
    }
    
    console.log(`Found ${allTechnologies.length} technologies in total`);
    
    // Get all industries
    const { data: allIndustries, error: industryError } = await supabase
      .from('industries')
      .select('id, name, slug');
    
    if (industryError || !allIndustries) {
      console.error('Error fetching industries:', industryError);
      return;
    }
    
    console.log(`Found ${allIndustries.length} industries in total`);
    
    // Get all business use cases
    const { data: allUseCases, error: useCaseError } = await supabase
      .from('business_use_cases')
      .select('id, name, slug');
    
    if (useCaseError || !allUseCases) {
      console.error('Error fetching business use cases:', useCaseError);
      return;
    }
    
    console.log(`Found ${allUseCases.length} business use cases in total`);
    
    // For each technology, add sample impact data
    for (const tech of allTechnologies) {
      console.log(`Adding sample impact data for ${tech.name} (ID: ${tech.id})...`);
      
      // Add industry impacts
      const industryImpacts = [];
      
      // Different impact patterns based on maturity level
      let relevantIndustryCount, maxImpactLevel;
      
      switch (tech.maturity_level) {
        case 'established':
          relevantIndustryCount = Math.min(allIndustries.length, 8);
          maxImpactLevel = 10;
          break;
        case 'growing':
          relevantIndustryCount = Math.min(allIndustries.length, 5);
          maxImpactLevel = 8;
          break;
        case 'emerging':
        default:
          relevantIndustryCount = Math.min(allIndustries.length, 3);
          maxImpactLevel = 6;
          break;
      }
      
      // Shuffle industries to get random ones
      const shuffledIndustries = [...allIndustries].sort(() => 0.5 - Math.random());
      const relevantIndustries = shuffledIndustries.slice(0, relevantIndustryCount);
      
      for (const industry of relevantIndustries) {
        // Generate random impact level based on technology maturity
        const randomVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        const impactLevel = Math.min(10, Math.round(maxImpactLevel * randomVariation));
        
        // Determine time horizon based on impact level
        let timeHorizon;
        if (impactLevel >= 8) {
          timeHorizon = 'immediate';
        } else if (impactLevel >= 6) {
          timeHorizon = 'short-term';
        } else if (impactLevel >= 4) {
          timeHorizon = 'medium-term';
        } else {
          timeHorizon = 'long-term';
        }
        
        // Generate potential outcomes
        const potentialOutcomes = [
          `Improved ${industry.name.toLowerCase()} processes`,
          `Enhanced customer experiences in ${industry.name.toLowerCase()}`,
          `Cost reduction for ${industry.name.toLowerCase()} operations`,
          `New business models in ${industry.name.toLowerCase()}`
        ];
        
        industryImpacts.push({
          technology_id: tech.id,
          industry_id: industry.id,
          impact_level: impactLevel,
          time_horizon: timeHorizon,
          description: `${tech.name} is transforming ${industry.name} through advanced capabilities and innovative applications.`,
          potential_outcomes: potentialOutcomes
        });
      }
      
      // Check if technology already has industry impacts
      const { data: existingImpacts, error: impactCheckError } = await supabase
        .from('technology_industry_impacts')
        .select('id')
        .eq('technology_id', tech.id)
        .limit(1);
      
      if (impactCheckError) {
        console.error(`Error checking existing impacts for ${tech.name}:`, impactCheckError);
        continue;
      }
      
      if (!existingImpacts || existingImpacts.length === 0) {
        // Insert industry impacts
        const { error: insertImpactError } = await supabase
          .from('technology_industry_impacts')
          .upsert(industryImpacts);
        
        if (insertImpactError) {
          console.error(`Error inserting industry impacts for ${tech.name}:`, insertImpactError);
          continue;
        }
        
        console.log(`Added ${industryImpacts.length} industry impacts for ${tech.name}`);
      } else {
        console.log(`${tech.name} already has industry impacts, skipping...`);
      }
      
      // Add business use cases
      const useCases = [];
      
      // Different use case patterns based on maturity level
      let relevantUseCaseCount, maxRelevanceScore;
      
      switch (tech.maturity_level) {
        case 'established':
          relevantUseCaseCount = Math.min(allUseCases.length, 7);
          maxRelevanceScore = 0.95;
          break;
        case 'growing':
          relevantUseCaseCount = Math.min(allUseCases.length, 5);
          maxRelevanceScore = 0.85;
          break;
        case 'emerging':
        default:
          relevantUseCaseCount = Math.min(allUseCases.length, 3);
          maxRelevanceScore = 0.75;
          break;
      }
      
      // Shuffle use cases to get random ones
      const shuffledUseCases = [...allUseCases].sort(() => 0.5 - Math.random());
      const relevantUseCases = shuffledUseCases.slice(0, relevantUseCaseCount);
      
      for (const useCase of relevantUseCases) {
        // Generate random relevance score based on technology maturity
        const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const relevanceScore = Math.min(1, maxRelevanceScore * randomVariation);
        
        // Determine maturity level based on relevance score
        let maturityLevel;
        if (relevanceScore >= 0.9) {
          maturityLevel = 'established';
        } else if (relevanceScore >= 0.7) {
          maturityLevel = 'emerging';
        } else if (relevanceScore >= 0.5) {
          maturityLevel = 'experimental';
        } else {
          maturityLevel = 'conceptual';
        }
        
        useCases.push({
          technology_id: tech.id,
          use_case_id: useCase.id,
          relevance_score: relevanceScore,
          maturity_level: maturityLevel,
          description: `${tech.name} enables ${useCase.name.toLowerCase()} through its advanced capabilities.`
        });
      }
      
      // Check if technology already has use cases
      const { data: existingUseCases, error: useCaseCheckError } = await supabase
        .from('technology_use_cases')
        .select('id')
        .eq('technology_id', tech.id)
        .limit(1);
      
      if (useCaseCheckError) {
        console.error(`Error checking existing use cases for ${tech.name}:`, useCaseCheckError);
        continue;
      }
      
      if (!existingUseCases || existingUseCases.length === 0) {
        // Insert use cases
        const { error: insertUseCaseError } = await supabase
          .from('technology_use_cases')
          .upsert(useCases);
        
        if (insertUseCaseError) {
          console.error(`Error inserting use cases for ${tech.name}:`, insertUseCaseError);
          continue;
        }
        
        console.log(`Added ${useCases.length} use cases for ${tech.name}`);
      } else {
        console.log(`${tech.name} already has use cases, skipping...`);
      }
    }
    
    // Generate impact insights
    console.log('Generating impact insights...');
    
    // Get technologies with high impact
    const { data: highImpactTechs, error: highImpactError } = await supabase
      .from('technology_industry_impacts')
      .select(`
        technology_id,
        impact_level,
        ai_technologies(id, name, slug)
      `)
      .gte('impact_level', 8)
      .order('impact_level', { ascending: false });
    
    if (highImpactError || !highImpactTechs) {
      console.error('Error fetching high impact technologies:', highImpactError);
      return;
    }
    
    // Group by technology
    const techImpacts = {};
    
    for (const impact of highImpactTechs) {
      const techId = impact.technology_id;
      if (!techImpacts[techId]) {
        techImpacts[techId] = {
          id: techId,
          name: impact.ai_technologies?.name || 'Unknown Technology',
          impacts: []
        };
      }
      
      techImpacts[techId].impacts.push(impact);
    }
    
    // Generate insights for top technologies
    const insights = [];
    const insightTypes = ['disruption', 'transformation', 'opportunity', 'efficiency'];
    
    for (const [techId, techData] of Object.entries(techImpacts)) {
      if (techData.impacts.length < 2) continue;
      
      // Get impacted industries
      const { data: impactedIndustries, error: industriesError } = await supabase
        .from('technology_industry_impacts')
        .select(`
          industry_id,
          impact_level,
          industries(id, name)
        `)
        .eq('technology_id', techId)
        .order('impact_level', { ascending: false })
        .limit(5);
      
      if (industriesError || !impactedIndustries) {
        console.error(`Error fetching impacted industries for ${techData.name}:`, industriesError);
        continue;
      }
      
      // Get related use cases
      const { data: relatedUseCases, error: useCasesError } = await supabase
        .from('technology_use_cases')
        .select(`
          use_case_id,
          relevance_score,
          business_use_cases(id, name)
        `)
        .eq('technology_id', techId)
        .order('relevance_score', { ascending: false })
        .limit(5);
      
      if (useCasesError || !relatedUseCases) {
        console.error(`Error fetching related use cases for ${techData.name}:`, useCasesError);
        continue;
      }
      
      // Format industry names
      const industryNames = impactedIndustries.map(i => i.industries?.name || 'Unknown Industry');
      
      // Format use case names
      const useCaseNames = relatedUseCases.map(uc => uc.business_use_cases?.name || 'Unknown Use Case');
      
      // Generate insight
      const insightType = insightTypes[Math.floor(Math.random() * insightTypes.length)];
      const title = `${techData.name} Transforming ${industryNames.slice(0, 3).join(', ')}`;
      
      const summary = `${techData.name} is showing significant impact across ${industryNames.length} industries, particularly in ${industryNames.slice(0, 3).join(', ')}. This technology is enabling ${useCaseNames.length > 0 ? useCaseNames.slice(0, 3).join(', ') : 'various business applications'}.`;
      
      const detailedAnalysis = `
${techData.name} is demonstrating transformative potential across multiple industries, with particularly strong impact in ${industryNames.slice(0, 3).join(', ')}.

Key business applications include:
${useCaseNames.slice(0, 5).map(uc => `- ${uc}`).join('\n')}

Organizations implementing ${techData.name} are reporting significant improvements in operational efficiency, customer experience, and competitive advantage. The technology's ability to ${useCaseNames[0]?.toLowerCase() || 'improve business processes'} is particularly valuable in today's rapidly evolving business landscape.

Based on current adoption trends, we expect ${techData.name} to become a standard component of business technology stacks within the next 12-24 months, with early adopters already realizing substantial benefits.
      `.trim();
      
      // Check if insight already exists
      const { data: existingInsight, error: insightCheckError } = await supabase
        .from('impact_insights')
        .select('id')
        .eq('technology_id', techId)
        .limit(1);
      
      if (insightCheckError) {
        console.error(`Error checking existing insights for ${techData.name}:`, insightCheckError);
        continue;
      }
      
      if (!existingInsight || existingInsight.length === 0) {
        // Create insight
        const { error: createInsightError } = await supabase
          .from('impact_insights')
          .insert({
            technology_id: parseInt(techId),
            title,
            summary,
            detailed_analysis: detailedAnalysis,
            source_articles: [],
            related_industries: impactedIndustries.map(i => i.industry_id),
            related_use_cases: relatedUseCases.map(uc => uc.use_case_id),
            insight_type: insightType
          });
        
        if (createInsightError) {
          console.error(`Error creating insight for ${techData.name}:`, createInsightError);
          continue;
        }
        
        insights.push(title);
      } else {
        console.log(`${techData.name} already has insights, skipping...`);
      }
    }
    
    console.log(`Generated ${insights.length} insights`);
    console.log('Sample insights:');
    insights.slice(0, 3).forEach(insight => console.log(`- ${insight}`));
    
    console.log('Finished adding sample impact data');
    
  } catch (error) {
    console.error('Error adding sample impact data:', error);
    process.exit(1);
  }
}

main();