'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, ExternalLink, ArrowUpRight } from 'lucide-react'

interface Project {
  title: string
  description: string
  image: string
  technologies: string[]
  demoUrl: string
  githubUrl: string
  features?: string[]
}

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-black/50 border border-green-400/20 rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-green-400/40 hover:shadow-lg hover:shadow-green-400/10"
    >
      <div className="relative h-56 w-full overflow-hidden group">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex gap-3">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-green-400 text-black rounded-md text-sm font-medium hover:bg-green-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Live Demo
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 border border-green-400/40 text-green-300 rounded-md text-sm font-medium hover:bg-green-400/10 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-4 h-4" />
                Code
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-500">
            {project.title}
          </h3>
        </div>
        
        <p className="text-green-200 mb-5">{project.description}</p>
        
        {project.features && project.features.length > 0 && (
          <div className="mt-auto pt-4 border-t border-green-400/10">
            <h4 className="text-sm font-medium text-green-300 mb-2">Key Features:</h4>
            <ul className="space-y-1.5">
              {project.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-green-300/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-green-400/10">
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-xs bg-green-400/10 text-green-300 rounded-full border border-green-400/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard