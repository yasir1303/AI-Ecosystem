"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import * as htmlToImage from "html-to-image"
import download from "downloadjs"
import { ChevronLeft, Download, Trash2 } from "lucide-react"

export default function AIConceptMapper() {
  const [topic, setTopic] = useState("")
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [graphData, setGraphData] = useState(null)
  const [graphStack, setGraphStack] = useState([])
  const isRestoringRef = useRef(false)
  const [selectedNode, setSelectedNode] = useState(null)
  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const urlTopic = params.get("topic")

  if (urlTopic) {
    setTopic(decodeURIComponent(urlTopic))
    handleGenerateFromURL(decodeURIComponent(urlTopic))
  }
}, [])

  const [recentTopics, setRecentTopics] = useState(() => {
    const saved = sessionStorage.getItem("conceptHistory")
    return saved ? JSON.parse(saved) : ["Artificial Intelligence", "Climate Change", "Quantum Computing"]
  })
  useEffect(() => {
    // Load saved maP
    const savedMap = sessionStorage.getItem("lastConceptMap")
    const savedTopic = sessionStorage.getItem("lastConceptTopic")

    if (savedMap) setGraphData(JSON.parse(savedMap))
    if (savedTopic) setTopic(savedTopic)
  }, [])
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    text: "",
  })
  useEffect(() => {
  const onPopState = () => {
    if (graphStack.length > 0) {
      const lastGraph = graphStack[graphStack.length - 1]

      setGraphStack(prev => prev.slice(0, -1))
      setGraphData(lastGraph)
      setSelectedNode(null)
      setTooltip({ visible: false, x: 0, y: 0, title: "", text: "", color: "" })
    }
  }

  window.addEventListener("popstate", onPopState)

  return () => {
    window.removeEventListener("popstate", onPopState)
  }
}, [graphStack])

  const descriptionCache = useRef(JSON.parse(sessionStorage.getItem("conceptDescCache") || "{}"))
  // ✅ Clear description cache ONLY when app/tab is closed
  useEffect(() => {
    return () => {
      sessionStorage.removeItem("conceptDescCache")
    }
  }, [])

  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const graphWrapperRef = useRef(null)

  // simple progress animation while generating
  useEffect(() => {
    let timer
    if (generating) {
      setProgress(0)
      timer = setInterval(() => {
        setProgress((p) => Math.min(95, p + Math.random() * 6))
      }, 200)
    } else {
      setProgress(100)
      const t = setTimeout(() => setProgress(0), 800)
      return () => clearTimeout(t)
    }
    return () => clearInterval(timer)
  }, [generating])

  // Save recentTopics to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("conceptHistory", JSON.stringify(recentTopics))
  }, [recentTopics])

  // fetch description for hover - debounced to avoid spam
  const fetchDescription = async (subtopic) => {
    if (!subtopic) return "No description."

    // ✅ RETURN IMMEDIATELY IF ALREADY FETCHED
    if (descriptionCache.current[subtopic]) {
      return descriptionCache.current[subtopic]
    }

    try {
      const res = await axios.post("http://127.0.0.1:5000/generate_concept_description", { subtopic })

      const desc = res.data.description || "No description available."

      // ✅ STORE DESCRIPTION IN CACHE
      descriptionCache.current[subtopic] = desc
      sessionStorage.setItem("conceptDescCache", JSON.stringify(descriptionCache.current))

      return desc
    } catch (err) {
      console.error("Description fetch error", err)
      return "Error fetching description."
    }
  }
  const handleGenerateFromURL = async (t) => {
  setGenerating(true)
  setGraphData(null)

  try {
    const res = await axios.post("http://127.0.0.1:5000/generate_concept_map", {
      topic: t,
    })
    setGraphData(res.data)
  } catch (err) {
    console.error("Auto-generate error", err)
  } finally {
    setGenerating(false)
  }
}

  // Generate concept map from backend
  const handleGenerate = async () => {
    if (!topic.trim()) return alert("Please enter a topic")
    setGenerating(true)
    setGraphData(null)

    try {
      const res = await axios.post("http://127.0.0.1:5000/generate_concept_map", { topic })
      if (res.data.error) throw new Error(res.data.error)
      setGraphData(res.data)

      // add to recent topics
      setRecentTopics((prev) => {
        const filtered = prev.filter((t) => t.toLowerCase() !== topic.toLowerCase())
        return [topic, ...filtered].slice(0, 8)
      })
    } catch (err) {
      console.error("Generate map error", err)
      alert("Error generating map. Check Flask / Ollama.")
    } finally {
      setGenerating(false)
    }
  }

  // load a topic from history (re-generate)
  const handleLoadTopic = async (t) => {
    setTopic(t)
    setGenerating(true)
    setGraphData(null)
    try {
      const res = await axios.post("http://127.0.0.1:5000/generate_concept_map", { topic: t })
      setGraphData(res.data)
      sessionStorage.setItem("lastConceptMap", JSON.stringify(res.data))
      sessionStorage.setItem("lastConceptTopic", topic)
    } catch (err) {
      console.error("history load error", err)
      alert("Failed to load topic.")
    } finally {
      setGenerating(false)
    }
  }

  const clearHistory = () => {
    if (window.confirm("Clear all topic history?")) {
      setRecentTopics([])
      sessionStorage.removeItem("conceptHistory")
    }
  }

  // download the entire card as PNG
  const handleDownload = () => {
    const node = containerRef.current
    if (!node) return
    htmlToImage
      .toPng(node)
      .then((dataUrl) => {
        download(dataUrl, `${topic || "concept_map"}.png`)
      })
      .catch((err) => {
        console.error("Download error", err)
        alert("Failed to download image.")
      })
  }

  // Static block diagram layout
  useEffect(() => {
    if (!graphData) {
      if (svgRef.current) svgRef.current.innerHTML = ""
      return
    }

    const svgEl = svgRef.current
    const width = graphWrapperRef.current.clientWidth
    const height = graphWrapperRef.current.clientHeight

    // Clear previous
    svgEl.innerHTML = ""

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet")
    svg.style.width = "100%"
    svg.style.height = "100%"

    const nodesRaw = graphData.nodes || []
    const edgesRaw = graphData.edges || []

    // Find central node
    const centralNode = nodesRaw.find((n) => n.group === "core")
    const subtopics = nodesRaw.filter((n) => n.group !== "core").slice(0, 10) // Ensure exactly 10 subtopics

    if (!centralNode) return

    // Center position
    const cx = width / 2
    const cy = height / 2

    // Color palette for subtopics (5 colors, each used twice)
    const colors = [
      "#0d9488", // teal
      "#06b6d4", // cyan
      "#fb923c", // soft orange
      "#f472b6", // muted pink
      "#a78bfa", // soft purple
    ]

    const horizontalSpacing = width * 0.30
    const verticalSpacing = height * 0.34

    const positions = [
      // 3 above
      { x: cx - horizontalSpacing, y: cy - verticalSpacing },
      { x: cx, y: cy - verticalSpacing },
      { x: cx + horizontalSpacing, y: cy - verticalSpacing },
      // 2 right
      { x: cx + horizontalSpacing * 1.3, y: cy - verticalSpacing * 0.5 },
      { x: cx + horizontalSpacing * 1.3, y: cy + verticalSpacing * 0.5 },
      // 3 below
      { x: cx + horizontalSpacing, y: cy + verticalSpacing },
      { x: cx, y: cy + verticalSpacing },
      { x: cx - horizontalSpacing, y: cy + verticalSpacing },
      // 2 left
      { x: cx - horizontalSpacing * 1.3, y: cy + verticalSpacing * 0.5 },
      { x: cx - horizontalSpacing * 1.3, y: cy - verticalSpacing * 0.5 },
    ]

    subtopics.forEach((node, i) => {
      if (i < positions.length) {
        node.x = positions[i].x
        node.y = positions[i].y
        node.color = colors[i % colors.length]
      }
    })

    // Draw simple direct arrows from central node to each subtopic
    subtopics.forEach((node) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")

      // Calculate edge points of center and subtopic blocks
      const centralWidth = Math.max(180, centralNode.id.length * 10 + 40)
      const centralHeight = 70
      const nodeWidth = Math.max(140, node.id.length * 8 + 32)
      const nodeHeight = 55

      // Calculate angle from center to subtopic
      const dx = node.x - cx
      const dy = node.y - cy
      const angle = Math.atan2(dy, dx)

      // Start point at edge of center block
      const startX = cx + Math.cos(angle) * (centralWidth / 2)
      const startY = cy + Math.sin(angle) * (centralHeight / 2)

      // End point at edge of subtopic block
      const endX = node.x - Math.cos(angle) * (nodeWidth / 2)
      const endY = node.y - Math.sin(angle) * (nodeHeight / 2)

      // Create gentle curve for visual appeal
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2
      const offsetX = -dy * 0.12
      const offsetY = dx * 0.12
      const controlX = midX + offsetX
      const controlY = midY + offsetY

      // Draw curved path with arrowhead
      path.setAttribute("d", `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`)
      path.setAttribute("stroke", node.color)
      path.setAttribute("color", node.color)   // match subtopic color
path.setAttribute("stroke-width", "2")    // slightly thicker, clean
path.setAttribute("fill", "none")
path.setAttribute(
  "opacity",
  selectedNode && selectedNode.id !== node.id ? "0.15" : "0.6"
)
       // subtle, premium look
// 🔺 unique arrowhead per node (REQUIRED)
const markerId = `arrowhead-${node.id.replace(/\s+/g, "")}`

const defs = svg.querySelector("defs") || document.createElementNS("http://www.w3.org/2000/svg", "defs")
if (!defs.parentNode) svg.insertBefore(defs, svg.firstChild)

const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker")
marker.setAttribute("id", markerId)
marker.setAttribute("viewBox", "0 0 10 10")
marker.setAttribute("refX", "10")
marker.setAttribute("refY", "5")
marker.setAttribute("markerWidth", "8")
marker.setAttribute("markerHeight", "8")
marker.setAttribute("orient", "auto")

const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon")
polygon.setAttribute("points", "0 0, 10 5, 0 10")
polygon.setAttribute("fill", node.color)
polygon.setAttribute("opacity", "0.8")

marker.appendChild(polygon)
defs.appendChild(marker)

path.setAttribute("marker-end", `url(#${markerId})`)
      svg.appendChild(path)
    })


    // Draw central node
    const centralRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    const centralWidth = Math.max(180, centralNode.id.length * 10 + 40)
    const centralHeight = 70
    centralRect.setAttribute("x", String(cx - centralWidth / 2))
    centralRect.setAttribute("y", String(cy - centralHeight / 2))
    centralRect.setAttribute("width", String(centralWidth))
    centralRect.setAttribute("height", String(centralHeight))
    centralRect.setAttribute("rx", "12")
    centralRect.setAttribute("ry", "12")
    centralRect.setAttribute("fill", "#0B2C4D")
    centralRect.setAttribute("filter", "drop-shadow(0px 8px 16px rgba(11, 44, 77, 0.25))")
    svg.appendChild(centralRect)

    const centralText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    centralText.setAttribute("x", String(cx))
    centralText.setAttribute("y", String(cy))
    centralText.setAttribute("text-anchor", "middle")
    centralText.setAttribute("dominant-baseline", "middle")
    centralText.setAttribute("fill", "#ffffff")
    centralText.setAttribute("font-size", "18")
    centralText.setAttribute("font-weight", "700")
    centralText.textContent = centralNode.id
    svg.appendChild(centralText)

    const centralGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
centralGroup.style.cursor = "pointer"

centralGroup.appendChild(centralRect)
centralGroup.appendChild(centralText)

centralGroup.addEventListener("click", async (event) => {
  event.stopPropagation()

  const desc = await fetchDescription(centralNode.id)
  setSelectedNode({ id: centralNode.id, color: "#0B2C4D" })
  setTooltip({
    visible: true,
    x: event.clientX + 16,
    y: event.clientY + 16,
    title: centralNode.id,
    text: desc,
    color: "#0B2C4D",
  })
})
centralGroup.addEventListener("dblclick", (event) => {
  event.stopPropagation()

  // ✅ SAVE CURRENT GRAPH BEFORE NAVIGATION
  setGraphStack(prev => [...prev, graphData])

  const newTopic = encodeURIComponent(centralNode.id)
  window.history.pushState({}, "", `?topic=${newTopic}&limit=5`)
handleGenerateFromURL(decodeURIComponent(newTopic))

})

svg.appendChild(centralGroup)


    // Draw subtopic nodes
    subtopics.forEach((node, i) => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
      g.style.cursor = "pointer"

      const nodeWidth = Math.max(140, node.id.length * 8 + 32)
      const nodeHeight = 55

      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      rect.setAttribute("x", String(node.x - nodeWidth / 2))
      rect.setAttribute("y", String(node.y - nodeHeight / 2))
      rect.setAttribute("width", String(nodeWidth))
      rect.setAttribute("height", String(nodeHeight))
      rect.setAttribute("rx", "10")
      rect.setAttribute("ry", "10")
      rect.setAttribute("fill", node.color)
      rect.setAttribute(
  "opacity",
  selectedNode && selectedNode.id !== node.id ? "0.25" : "1"
)

      rect.setAttribute("filter", "drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.12))")
      rect.setAttribute("transform", "scale(1)")

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
      text.setAttribute("x", String(node.x))
      text.setAttribute("y", String(node.y))
      text.setAttribute("text-anchor", "middle")
      text.setAttribute("dominant-baseline", "middle")
      text.setAttribute("fill", "#ffffff")
      text.setAttribute("font-size", "14")
      text.setAttribute("font-weight", "600")
      text.setAttribute(
  "opacity",
  selectedNode && selectedNode.id !== node.id ? "0.25" : "1"
)

      text.textContent = node.id

      g.appendChild(rect)
      g.appendChild(text)

      let isDoubleClick = false

g.addEventListener("click", async (event) => {
  event.stopPropagation()

  // ⛔ Ignore click if it was part of dblclick
  if (isDoubleClick) {
    isDoubleClick = false
    return
  }

  const desc = await fetchDescription(node.id)
  setSelectedNode({ id: node.id, color: node.color })
  setTooltip({
    visible: true,
    x: event.clientX + 16,
    y: event.clientY + 16,
    title: node.id,
    text: desc,
    color: node.color,
  })
})

g.addEventListener("dblclick", (event) => {
  event.stopPropagation()
  isDoubleClick = true

  setGraphStack(prev => [...prev, graphData])

  const newTopic = encodeURIComponent(node.id)
  window.history.pushState({}, "", `?topic=${newTopic}&limit=5`)
})



      svg.appendChild(g)
    })
    svgEl.appendChild(svg)
  }, [graphData, selectedNode])

  // small UI rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dffeff] via-[#d4f5ff] to-[#cafff8] p-6">
      <div className="w-full mx-auto" ref={containerRef}>
        {/* Back */}
        <button
  onClick={() => {
    if (graphStack.length > 0) {
      window.history.back()
    }
  }}

          className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#FCE7C8] to-[#F9D188] shadow-lg hover:scale-110 transition-transform duration-300"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 text-amber-900" />
        </button>

        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🌐</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#00b5b5] via-[#009090] to-[#008080] bg-clip-text text-transparent">
              AI Concept Mapper
            </h1>
          </div>
          <p className="text-[#00a8a8] font-medium">Generate interactive concept maps with AI-powered extraction</p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 rounded-3xl p-6 shadow-2xl mb-6 animate-fade-in border-2 border-white/40">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Enter any topic (e.g. Artificial Intelligence)"
              className="flex-1 rounded-3xl border-2 border-[#00e0d8] bg-white/80 px-6 py-4 text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#00e0d8] focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || generating}
              className="px-8 py-4 rounded-3xl bg-gradient-to-r from-[#00e0d8] via-[#00b5b5] to-[#009e9e] text-white font-bold text-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-300 whitespace-nowrap"
            >
              ⚡ Generate Map
            </button>
          </div>

          {generating && (
            <div className="mb-6">
              <div className="relative w-full h-3 rounded-full border-2 border-[#00e0d8] bg-white/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00e0d8, #00b5b5)" }}
                />
              </div>
              <p className="text-center mt-3 text-[#00a8a8] font-semibold">Generating... {Math.round(progress)}%</p>
            </div>
          )}

          {/* Concept Map Visualization */}
          <div className="backdrop-blur-lg bg-white/60 rounded-2xl border-2 border-[#00e0d8] p-4 shadow-lg mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Concept Graph</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FCE7C8] to-[#F9D188] text-amber-900 font-semibold hover:scale-105 active:scale-95 transition-transform duration-300 shadow-lg"
                >
                  <Download className="w-4 h-4" /> Download Map
                </button>
              </div>
            </div>

            <div
  ref={graphWrapperRef}
  onClick={() => {
    setSelectedNode(null)
    setTooltip({ visible: false, x: 0, y: 0, title: "", text: "", color: "" })
  }}
  style={{ height: "100vh" }}
  className="w-full bg-gradient-to-br from-white/50 to-white/30 rounded-lg border border-[#00e0d8]/30 overflow-hidden"
>
  <svg ref={svgRef} className="w-full h-full" />
</div>

          </div>
          {/* ✅ Selected Node Description Panel */}
          {tooltip.visible && (
  <div
    onClick={(e) => e.stopPropagation()}
    style={{
      position: "fixed",
      left: tooltip.x,
      top: tooltip.y,
      maxWidth: 320,
      zIndex: 9999,
      pointerEvents: "auto",


      // 🎨 dynamic color styling
      backgroundColor: tooltip.color + "E6", // translucent
      border: `2px solid ${tooltip.color}`,
      color: "#ffffff",
    }}
    className="backdrop-blur-lg rounded-xl shadow-xl p-4 animate-fade-in"
  >
    <h4 className="font-bold mb-1">{tooltip.title}</h4>
    <p className="text-sm leading-relaxed">{tooltip.text}</p>
  </div>
)}


          {/* Recent Topics */}
          <div className="backdrop-blur-lg bg-white/60 rounded-xl border border-[#00e0d8]/30 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">🕓 Recent Topics</h3>
              {recentTopics.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-200/60 hover:bg-red-300/80 border border-red-200/40 text-red-700 text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Clear
                </button>
              )}
            </div>

            {recentTopics.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {recentTopics.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleLoadTopic(t)}
                    className="px-5 py-2 rounded-full border-2 border-[#00e0d8] text-[#00a8a8] font-semibold hover:bg-[#00e0d8]/20 hover:scale-110 transition-all duration-300"
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">No recent topics yet</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn .6s ease-out; }
      `}</style>
    </div>
  )
}
