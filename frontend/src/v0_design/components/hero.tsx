"use client"
import React from "react"
import { Sparkles } from "lucide-react"

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[600px] flex items-center justify-center px-4 py-20 overflow-hidden"
    >
      {/* Background gradient and tech pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />

        {/* Glowing circuit pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(0, 150, 136)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="rgb(0, 150, 136)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M 100 100 L 500 50 L 900 100 L 800 500 L 900 900 L 500 950 L 100 900 L 200 500 Z"
            stroke="url(#circuitGradient)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="250" cy="250" r="8" fill="rgb(0, 150, 136)" opacity="0.6" />
          <circle cx="750" cy="250" r="8" fill="rgb(0, 150, 136)" opacity="0.6" />
          <circle cx="500" cy="500" r="10" fill="rgb(0, 150, 136)" opacity="0.8" />
          <circle cx="250" cy="750" r="8" fill="rgb(0, 150, 136)" opacity="0.6" />
          <circle cx="750" cy="750" r="8" fill="rgb(0, 150, 136)" opacity="0.6" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
          <Sparkles size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            Powered by Advanced AI
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-balance">
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            AI Ecosystem
          </span>
          <span className="block text-foreground mt-2">
            A Unified AI Platform
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-foreground/70 mb-8 text-balance max-w-2xl mx-auto">
          Access multiple intelligent AI tools in one unified platform. From conversations to translations,
          summarization to image generation.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
  {/* PRIMARY CTA */}
  <button
    onClick={() =>
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
    }
    className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
  >
    Explore Tools
  </button>

  {/* SECONDARY CTA */}
  <button
    onClick={() =>
      document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
    }
    className="px-8 py-3 rounded-lg border border-primary/30 text-primary font-semibold hover:bg-primary/10 transition-all duration-300"
  >
    Learn More
  </button>
</div>

      </div>
    </section>
  )
}
