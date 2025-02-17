'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bot, Workflow, Cpu, BarChart, Network, Brain } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

const solutions = [
  {
    icon: Bot,
    title: 'Custom AI Agents',
    description: '24/7/365 autonomous AI agents tailored to your business needs.',
    features: [
      'Always-on Business Operations',
      'Automated Customer Support',
      'Task-specific AI Assistants',
      'Multi-agent Coordination'
    ]
  },
  {
    icon: Workflow,
    title: 'AI Integration',
    description: 'Seamlessly blend AI capabilities into your existing business workflow.',
    features: [
      'Business Process Automation',
      'API Integration',
      'Legacy System Enhancement',
      'Workflow Optimization'
    ]
  },
  {
    icon: Cpu,
    title: 'Industry-Specific AI',
    description: 'Goal-driven AI solutions designed for your specific business objectives.',
    features: [
      'Tailored AI Models',
      'Business-specific Training',
      'Performance Metrics',
      'Scalable Architecture'
    ]
  },
  {
    icon: BarChart,
    title: 'AI Analytics',
    description: 'Transform your data into actionable insights with AI-powered analytics.',
    features: [
      'Data Pattern Recognition',
      'Predictive Analysis',
      'Real-time Monitoring',
      'Custom Reporting'
    ]
  },
  {
    icon: Network,
    title: 'AI Infrastructure',
    description: 'Optimize your AI deployment for maximum efficiency and performance.',
    features: [
      'Cloud Architecture Design',
      'Resource Optimization',
      'Scaling Solutions',
      'Performance Monitoring'
    ]
  },
  {
    icon: Brain,
    title: 'AI Strategy Consulting',
    description: 'Navigate the AI landscape with expert guidance and planning.',
    features: [
      'AI Readiness Assessment',
      'Implementation Roadmap',
      'Cost-Benefit Analysis',
      'Risk Management'
    ]
  }
];

export default function SolutionsPage() {
  const { translate } = useTranslation();
  const router = useRouter();

  return (
    <div className="relative min-h-screen text-green-400">
      <div className="relative z-10 pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              {translate('hero.phrases')[0]}
            </h1>
            <p className="text-lg sm:text-xl text-green-300 max-w-3xl mx-auto px-4">
              {translate('solutions.description')}
            </p>
          </motion.div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/50 border border-green-400/20 rounded-lg p-4 sm:p-6 hover:border-green-400/40 transition-colors"
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <solution.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  <h3 className="text-lg sm:text-xl font-semibold">{solution.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-green-300/80 mb-4">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs sm:text-sm text-green-400/60">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 sm:mt-16 text-center bg-green-400/5 rounded-lg p-6 sm:p-8 border border-green-400/20"
          >
            <div className="max-w-3xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{translate('solutions.cta.title')}</h2>
              <p className="text-sm sm:text-base text-green-300 mb-6 sm:mb-8">
                {translate('solutions.cta.description')}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/contact')}
                className="bg-green-400 text-black px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors text-sm sm:text-base"
              >
                {translate('solutions.cta.action')}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}