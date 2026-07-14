"use client"

import type { LucideIcon } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom";

interface FeatureTileProps {
  feature: {
    id: number
    icon: LucideIcon
    title: string
    description: string
    color: string
  }
}

export default function FeatureTile({ feature }: FeatureTileProps) {
  const [isHovered, setIsHovered] = useState(false)
  const Icon = feature.icon
  const navigate = useNavigate()

  const handleClick = () => {
    const routes: any = {
      "Chatbot": "/chatbot",
      "Text Translator": "/text",
      "Image Translator": "/image",
      "Voice Translator": "/voice",
      "Text Summarizer": "/summarizer",
      "AI Image Generator": "/imagegen",
      "Concept Mapper": "/conceptmapper",
      "Real-Time Chat": "/RealTimeChat",
      "Data Intelligence Hub": "/dataintelligence",
      "AI Meme Generator": "/meme-generator",

    }

    if (routes[feature.title]) {
      navigate(routes[feature.title])
    }
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="group relative h-full cursor-pointer"
    >
      {/* Glowing background */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 -z-10`}
      />

      {/* Main tile */}
      <div
        className="h-full p-6 rounded-2xl border border-primary/30 bg-card hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden"
      >
        {/* Icon */}
        <div
          className={`mb-4 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg transition-all duration-300`}
        >
          <Icon size={24} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">
          {feature.title}
        </h3>
        <p className="text-sm text-foreground/60 leading-relaxed">
          {feature.description}
        </p>

        {/* Explore Arrow */}
        <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
          <span className="text-sm font-medium">Explore</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
