"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-sm bg-background/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
              ◆
            </div>
            <span className="font-semibold text-lg hidden sm:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              AI Ecosystem
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-foreground/70 hover:text-foreground transition-colors text-sm">
              Home
            </a>
            <a href="#tools" className="text-foreground/70 hover:text-foreground transition-colors text-sm">
              Tools
            </a>
            <a href="#about" className="text-foreground/70 hover:text-foreground transition-colors text-sm">
              About
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-foreground transition-colors text-sm">
              Contact
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
  onClick={() =>
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
  }
  className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
>
  Get Started
</button>

          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2" aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a href="#home" className="block text-foreground/70 hover:text-foreground text-sm py-2">
              Home
            </a>
            <a href="#tools" className="block text-foreground/70 hover:text-foreground text-sm py-2">
              Tools
            </a>
            <a href="#about" className="block text-foreground/70 hover:text-foreground text-sm py-2">
              About
            </a>
            <a href="#contact" className="block text-foreground/70 hover:text-foreground text-sm py-2">
              Contact
            </a>
            <button
  onClick={() => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })
    setIsOpen(false)
  }}
  className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
>
  Get Started
</button>

          </div>
        )}
      </div>
    </nav>
  )
}
