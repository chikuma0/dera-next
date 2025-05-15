'use client'

import { motion } from 'framer-motion'
import ProjectCard from '@/components/portfolio/ProjectCard'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

const projects = [
  {
    title: "MSK Website",
    description: "A modern, responsive website for MSK, featuring a clean design and seamless user experience. The site showcases their music, events, and artistic vision.",
    image: "/images/msk-logo.png",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    demoUrl: "https://msk.band",
    githubUrl: "",
    features: [
      "Fully responsive design",
      "Performance optimized",
      "SEO friendly",
      "Modern animations"
    ]
  },
  {
    title: "Digii",
    description: "AI powered business card scanner and follow up mail automation platform that helps professionals manage their contacts efficiently.",
    image: "/images/digii-logo.png",
    technologies: ["Next.js", "AI/ML", "Node.js", "MongoDB"],
    demoUrl: "https://digii.ai",
    githubUrl: "",
    features: [
      "AI-powered OCR for business cards",
      "Automated follow-up emails",
      "Contact management system",
      "Analytics dashboard"
    ]
  }
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
            Our Work
          </h1>
          <p className="text-xl text-green-300 max-w-3xl mx-auto">
            Explore our portfolio of successful projects and see how we&apos;ve helped businesses transform their digital presence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Have a project in mind?</h2>
          <Link 
            href="/contact" 
            className="inline-flex items-center px-8 py-3 border-2 border-green-400 text-green-400 font-medium rounded-lg hover:bg-green-400 hover:text-black transition-all duration-300"
          >
            Get in Touch
            <ExternalLink className="ml-2 w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}