import { useState, useEffect, useRef } from 'react'

export default function AIMemeGenerator() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState([])
  const [captionBase, setCaptionBase] = useState('')
  const [keywords, setKeywords] = useState([])
  const [history, setHistory] = useState([])
  const progressInterval = useRef(null)

  const fetchProgress = () => {
    setProgress((p) => Math.min(98, p + Math.floor(Math.random() * 7)))
  }

  useEffect(() => {
    const saved = sessionStorage.getItem("memeHistory")
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleGenerate = async () => {
    if (!file) return alert("Upload an image first!")

    setLoading(true)
    setProgress(0)
    setResults([])
    progressInterval.current = setInterval(fetchProgress, 800)

    try {
      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("http://127.0.0.1:5000/generate_meme", {
        method: "POST",
        body: fd
      })

      const data = await res.json()
      clearInterval(progressInterval.current)
      setProgress(100)

      if (data.status !== "success") {
        alert("Failed to analyze image.")
        setLoading(false)
        return
      }

      // in case backend doesn't send these
      setCaptionBase(data.caption_base || "")
      setKeywords(data.keywords || [])

      // ensure only 2 captions
      const twoResults = data.results.slice(0, 2)
      setResults(twoResults)

      // Save history (with 2 memes only)
      const newHist = [
        {
          id: Date.now(),
          time: new Date().toLocaleString(),
          results: twoResults,
          caption_base: data.caption_base || "",
          keywords: data.keywords || []
        },
        ...history
      ]

      setHistory(newHist)
      sessionStorage.setItem("memeHistory", JSON.stringify(newHist))

    } catch (err) {
      console.error(err)
      alert("Error generating meme captions.")
    }

    setLoading(false)
    setTimeout(() => setProgress(0), 400)
  }

  const clearHistory = () => {
    if (window.confirm("Clear meme history?")) {
      setHistory([])
      sessionStorage.removeItem("memeHistory")
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="flex items-center justify-start min-h-screen p-4 pt-12">
        <div className="w-full max-w-4xl mx-auto">
          
          <button
            onClick={() => window.history.back()}
            className="mb-6 p-3 rounded-full bg-gradient-to-r from-amber-200/60 to-yellow-200/60 hover:scale-110 border shadow-lg"
          >
            ←
          </button>

          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border shadow-2xl p-8 md:p-10">

            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center bg-gradient-to-r from-[#00b5b5] to-[#007a7a] bg-clip-text text-transparent">
              😹 AI Meme Generator (Pro)
            </h1>

            <p className="text-center text-[#009e9e] mb-6 font-medium">
              Upload → Auto-caption → Download Meme
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 mb-4 rounded-xl border-2 border-[#00e0d8]"
            />

            <button
              onClick={handleGenerate}
              disabled={!file || loading}
              className="w-full py-4 rounded-full font-bold text-white mb-6"
              style={{
                background: "linear-gradient(135deg, #00e0d8, #00b5b5, #009e9e)"
              }}
            >
              {loading ? "⚡ Generating..." : "Generate Captions"}
            </button>

            {loading && (
              <div className="w-full bg-white/50 border rounded-full p-1 mb-6">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #00e0d8, #00b5b5)"
                  }}
                />
                <p className="text-xs text-center mt-1">{progress}%</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#00b5b5] mb-2">
                  🎯 Best Captions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {results.map((r, i) => (
                    <div key={i} className="p-3 rounded-2xl border bg-white/40">

                      <img
                        src={`http://127.0.0.1:5000${r.preview_url}`}
                        className="w-full h-64 object-cover rounded-xl mb-2"
                      />

                      <p className="font-medium text-gray-700">{r.caption}</p>

                      <div className="flex gap-3 mt-3">
                        <a
                          href={`http://127.0.0.1:5000${r.preview_url}`}
                          download
                          className="px-4 py-2 rounded-full bg-[#00e0d8] text-white text-sm font-semibold shadow"
                        >
                          Download
                        </a>

                        <a
                          href={`http://127.0.0.1:5000${r.preview_url}`}
                          target="_blank"
                          className="px-4 py-2 rounded-full bg-white/70 border text-sm"
                        >
                          Open
                        </a>
                      </div>

                    </div>
                  ))}

                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="p-4 rounded-3xl border bg-white/30">
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-[#00b5b5]">📜 History</h3>
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 bg-red-200/60 rounded-full text-sm"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-3">
                  {history.map((h) => (
                    <div key={h.id} className="w-40 flex-shrink-0 rounded-xl bg-white/50 border">
                      <img
                        src={`http://127.0.0.1:5000${h.results[0].preview_url}`}
                        className="w-full h-24 object-cover"
                      />
                      <p className="text-xs p-2 text-gray-500">{h.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
