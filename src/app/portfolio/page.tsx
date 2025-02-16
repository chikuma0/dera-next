'use client'

import { motion } from 'framer-motion'
import ProjectCard from '@/components/portfolio/ProjectCard'

const projects = [
  {
    title: "Digii",
    description: "AI powered business card scanner and follow up mail automation",
    image: "/images/digii-logo.png",
    technologies: ["Next.js", "AI/ML"],
    demoUrl: "https://digii.ai",
    githubUrl: ""
  }
]

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="max-w-7xl mx-auto pt-32 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold mb-12">Portfolio</h1>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}