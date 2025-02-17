'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Github, ExternalLink } from 'lucide-react'
import { useTranslation } from '@/contexts/LanguageContext'

interface Project {
  title: string
  description: string
  image: string
  technologies: string[]
  demoUrl: string
  githubUrl: string
}

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { translate } = useTranslation();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-black border-2 border-green-400 rounded-lg overflow-hidden max-w-3xl w-full"
    >
      <div className="relative h-48 sm:h-64">
        <Image
          src={project.image}
          alt={project.title}
          width={800}
          height={400}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="text-xl sm:text-2xl font-bold mb-2">{project.title}</h3>
        <p className="text-green-300 text-sm sm:text-base mb-4">{project.description}</p>

        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-400 text-black rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-400 text-black rounded-lg hover:bg-green-300 transition-colors text-sm sm:text-base"
          >
            <ExternalLink size={16} />
            {translate('portfolio.visitSite')}
          </motion.a>
          {project.githubUrl && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-green-400 rounded-lg hover:bg-green-400 hover:text-black transition-colors text-sm sm:text-base"
            >
              <Github size={16} />
              {translate('portfolio.viewCode')}
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard