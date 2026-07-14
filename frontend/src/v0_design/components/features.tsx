"use client"

import { MessageCircle, Globe, ImageIcon, Mic, FileText, Wand2, Network, BarChart3,Globe2 } from "lucide-react"
import FeatureTile from "../components/feature-tile";

const features = [
  {
    id: 1,
    icon: MessageCircle,
    title: "Chatbot",
    description: "Intelligent conversational AI that understands context and provides helpful responses.",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: 2,
    icon: Globe,
    title: "Text Translator",
    description: "Seamlessly translate text between multiple languages with high accuracy.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 3,
    icon: ImageIcon,
    title: "Image Translator",
    description: "Extract and translate text from images in real-time.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: 4,
    icon: Mic,
    title: "Voice Translator",
    description: "Convert and translate speech across different languages instantly.",
    color: "from-purple-500 to-pink-500",
  },
  {
  id: 5,
  icon: Network,
  title: "Real-Time Chat",
  description: "Engage in instant conversations powered by real-time AI and socket integration.",
  color: "from-pink-500 to-rose-500",
  },

  {
    id: 6,
    icon: FileText,
    title: "Text Summarizer",
    description: "Generate concise summaries from lengthy documents and articles.",
    color:  "from-rose-500 to-orange-500",
  },
  {
    id: 7,
    icon: Wand2,
    title: "AI Image Generator",
    description: "Create stunning images from text descriptions using advanced AI.",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: 8,
    icon: Network,
    title: "Concept Mapper",
    description: "Visualize complex ideas and relationships with intelligent mapping.",
    color:"from-amber-500 to-yellow-500",
  },
  {
    id: 9,
    icon: BarChart3,
    title: "Data Intelligence Hub",
    description: "Analyze and visualize data with intelligent insights and analytics.",
    color: "from-green-500 to-emerald-500",
  },
  {
  id: 10,
  icon: ImageIcon,  // or use Laugh icon if you have, but ImageIcon matches your style
  title: "AI Meme Generator",
  description: "Create hilarious memes with auto captions, customization, and AI smart humor.",
  color: "from-emerald-500 to-teal-500",
},

]

export default function Features() {
  return (
    <section id="tools" className="py-20 px-4 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance text-foreground">
            Powerful AI Tools at Your Fingertips
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            Explore our comprehensive suite of AI-powered applications designed to enhance productivity and creativity.
          </p>
        </div>

        {/* Features grid - 2x4 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureTile key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
