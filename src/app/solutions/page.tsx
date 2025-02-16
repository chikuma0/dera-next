'use client';

import { motion } from 'framer-motion';
import { Bot, Workflow, Cpu, BarChart, Network, Brain, Terminal } from 'lucide-react';
import MatrixBackground from '@/components/hero/MatrixBackground';

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

const CTASection = {
  title: "Let&apos;s Enhance What Makes You Unique",
  description: "Take the first step towards amplifying your business capabilities with AI. Our team is ready to understand your needs and craft solutions that work for you.",
  primaryAction: "Start Discussion",
  layout: (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="mt-16 text-center bg-green-400/5 rounded-lg p-8 border border-green-400/20"
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Let&apos;s Enhance What Makes You Unique</h2>
        <p className="text-green-300 mb-8">
          Take the first step towards amplifying your business capabilities with AI. 
          Our team is ready to understand your needs and craft solutions that work for you.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-green-400 text-black px-8 py-3 rounded-lg font-semibold hover:bg-green-300 transition-colors"
        >
          Start Discussion
        </motion.button>
      </div>
    </motion.div>
  )
};

export default function SolutionsPage() {
  return (
    <div className="relative min-h-screen bg-black text-green-400">
      <MatrixBackground />
      
      <div className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              AI Horsepower for Distributed Era
            </h1>
            <p className="text-xl text-green-300 max-w-3xl mx-auto">
              Boutique AI studio for global business needs. We design purpose-built 
              AI solutions to keep your business moving forward.
            </p>
          </motion.div>

          {/* Solutions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/50 border border-green-400/20 rounded-lg p-6 hover:border-green-400/40 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <solution.icon className="w-8 h-8" />
                  <h3 className="text-xl font-semibold">{solution.title}</h3>
                </div>
                <p className="text-green-300/80 mb-4">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-green-400/60">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Enhanced CTA Section */}
          {CTASection.layout}
        </div>
      </div>
    </div>
  );
} 