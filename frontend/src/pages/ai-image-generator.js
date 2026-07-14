'use client'

import { useState, useEffect, useRef } from 'react'

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isHires, setIsHires] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [history, setHistory] = useState([])

  const progressInterval = useRef(null)
  // Load saved values
// Load saved values ONCE
useEffect(() => {
  const saved = sessionStorage.getItem("imageHistory");
  const savedImage = sessionStorage.getItem("latestImage");
  const savedPrompt = sessionStorage.getItem("latestPrompt");

  if (saved) setHistory(JSON.parse(saved));
  if (savedImage) setGeneratedImage(savedImage);
  if (savedPrompt) setPrompt(savedPrompt);
}, []);   // <-- runs only once when page opens


  // Fetch Stable Diffusion progress
  const fetchProgress = async () => {
    try {
      const res = await fetch('http://127.0.0.1:7860/sdapi/v1/progress')
      const data = await res.json()
      const pct = Math.floor((data.progress || 0) * 100)
      setProgress(pct)
    } catch (err) {
      console.log('Progress error:', err)
    }
  }

  // Generate image (real Flask + SD)
  const handleGenerate = async () => {
    if (!prompt.trim()) return alert('Enter a prompt first!')

    setLoading(true)
    setGeneratedImage(null)
    setProgress(0)

    progressInterval.current = setInterval(fetchProgress, 1000)

    try {
      const response = await fetch('http://127.0.0.1:5000/generate_image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          use_hires: isHires,
        }),
      })

      const data = await response.json()
      clearInterval(progressInterval.current)
      setProgress(100)

      const finalImageUrl = `http://127.0.0.1:5000${data.image_path}`
      setGeneratedImage(finalImageUrl)
      sessionStorage.setItem("latestImage", finalImageUrl);
sessionStorage.setItem("latestPrompt", prompt);


      const newHistory = [
        {
          id: Date.now(),
          imageUrl: finalImageUrl,
          prompt,
          mode: data.mode,
          time: new Date().toLocaleTimeString(),
        },
        ...history,
      ]

      setHistory(newHistory)
      sessionStorage.setItem('imageHistory', JSON.stringify(newHistory))
    } catch (err) {
      console.error('Generation error:', err)
      alert('Image generation failed.')
    } finally {
      clearInterval(progressInterval.current)
      setLoading(false)
    }
  }

  // Load session history
  useEffect(() => {
    const saved = sessionStorage.getItem('imageHistory')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  // Clear History
  const clearHistory = () => {
    if (window.confirm('Clear all image history?')) {
      setHistory([])
      sessionStorage.removeItem('imageHistory')
    }
  }

  return (
    <div className="min-h-screen w-full overflow-hidden">
      {/* Background gradient */}
      <style>{`
        body {
          background: linear-gradient(135deg, #dffeff 0%, #d4f5ff 50%, #cafff8 100%);
        }
      `}</style>

      <div className="flex items-center justify-start min-h-screen p-4 pt-12">
        <div className="w-full max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="mb-6 p-3 rounded-full bg-gradient-to-r from-amber-200/60 to-yellow-200/60
              hover:from-amber-300/80 hover:to-yellow-300/80 backdrop-blur-sm border border-amber-200/40 
              shadow-lg transition-all duration-300 transform hover:scale-110"
          >
            ←
          </button>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/90 rounded-3xl border border-white/40 shadow-2xl p-8 md:p-10 animate-fade-in">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-2 inline-block bg-gradient-to-r 
                from-[#00b5b5] via-[#009090] to-[#008080] bg-clip-text text-transparent">
                🪄 AI Image Generator
              </h1>
              <p className="text-lg text-[#00a8a8] font-medium">
                Enter a creative prompt and generate stunning visuals instantly.
              </p>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Creative Prompt</label>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Describe the image you want... be detailed"
                className="w-full h-40 p-4 rounded-3xl border-2 border-[#00e0d8] bg-white/80 text-gray-900 
                  placeholder-gray-400 font-medium focus:outline-none focus:ring-4 
                  focus:ring-[#00e0d8]/40 transition-all resize-none shadow-sm"
              />
            </div>

            {/* Hires Toggle */}
            <div className="mb-6 flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border border-[#00e0d8] 
                shadow-lg backdrop-blur-sm cursor-pointer hover:bg-white/60 transition-all">
                <input
                  type="checkbox"
                  checked={isHires}
                  onChange={e => setIsHires(e.target.checked)}
                  className="w-4 h-4 accent-[#00e0d8]"
                />
                <span className="text-sm font-medium text-gray-700">🔍 High-Resolution (Hires Fix)</span>
              </label>
            </div>

            {/* Generate Button */}
            <div className="mb-6">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="w-full py-4 px-6 rounded-full font-bold text-white text-lg transition-all transform 
                  hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg"
                style={{
                  background: loading
                    ? 'linear-gradient(135deg, #00b5b5 0%, #009090 100%)'
                    : 'linear-gradient(135deg, #00e0d8 0%, #00b5b5 50%, #009e9e 100%)',
                }}
              >
                {loading ? '⚡ Generating...' : `Generate ${isHires ? 'HD' : 'Fast'} Image`}
              </button>
            </div>

            {/* Progress Bar */}
            {loading && (
              <div className="mb-6 rounded-full bg-white/50 border-2 border-[#00e0d8] p-1 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #00e0d8, #00b5b5, #009e9e)',
                  }}
                />
                <p className="text-xs text-gray-600 font-medium mt-2 text-center">{progress}% Complete</p>
              </div>
            )}

            {/* Image Output */}
            {generatedImage && (
              <div className="mb-6 rounded-3xl border-2 border-[#00e0d8] bg-white/70 p-4 shadow-lg">
                <img
  src={generatedImage}
  alt="Generated"
  className="rounded-2xl object-contain mx-auto max-w-2xl w-full shadow"
  style={{ maxHeight: "500px" }}
/>

              </div>
            )}

            {/* History Section */}
            {history.length > 0 && (
              <div className="rounded-3xl border border-white/40 bg-white/30 p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#00b5b5] flex items-center gap-2">📜 Generated History</h3>
                  <button
                    onClick={clearHistory}
                    className="px-3 py-1 rounded-full bg-red-200/60 hover:bg-red-300/80 border border-red-200/40 text-red-700 font-semibold text-xs"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex gap-3 max-h-64 overflow-x-auto pb-2">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-32 rounded-xl overflow-hidden border border-[#00e0d8]/30 bg-white/50"
                    >
                      <img src={item.imageUrl} className="w-full h-24 object-cover" />
                      <div className="p-2">
                        <p className="text-xs text-gray-600">{item.mode}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                        <p className="text-xs text-gray-700 font-medium">{item.prompt.slice(0, 30)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn .6s ease-out;
        }
      `}</style>
    </div>
  )
}
