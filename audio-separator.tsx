import React, { useState, useRef, useCallback, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Music, Upload, Download, Play, Pause,
  Loader2, AlertCircle, RefreshCw,
} from 'lucide-react'
import { stemSeparator, type StemProgress } from './src/audio/StemSeparator'

type AppState = 'idle' | 'loading-model' | 'separating' | 'done' | 'error'

const ACCEPT = '.mp3,.wav,.flac,.ogg,.m4a,audio/*'

function formatFileName(name: string) {
  const base = name.replace(/\.[^.]+$/, '')
  return base.length > 30 ? base.slice(0, 27) + '...' : base
}

function AudioPlayer({ label, blob, color }: { label: string; blob: Blob; color: string }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [url, setUrl] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${label}.wav`
    a.click()
  }

  return (
    <div className={`border-3 border-foreground rounded-xl p-4 shadow-neo-md bg-content1`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <span className="font-bold text-sm">{label}</span>
      </div>

      {url && (
        <audio
          key={url}
          ref={audioRef}
          src={url}
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setProgress(0) }}
          onTimeUpdate={(e) => {
            const a = e.currentTarget
            if (a.duration) setProgress((a.currentTime / a.duration) * 100)
          }}
        />
      )}

      <div className="w-full bg-content3 rounded-full h-2 mb-3 cursor-pointer"
        onClick={(e) => {
          const audio = audioRef.current
          if (!audio || !audio.duration) return
          const rect = e.currentTarget.getBoundingClientRect()
          const pct = (e.clientX - rect.left) / rect.width
          audio.currentTime = pct * audio.duration
        }}
      >
        <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggle}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-sm border-3 border-foreground shadow-neo-sm hover:shadow-neo-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-content2"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? '일시정지' : '재생'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-sm border-3 border-foreground shadow-neo-sm hover:shadow-neo-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all bg-primary text-primary-foreground"
        >
          <Download className="w-4 h-4" />
          다운로드
        </button>
      </div>
    </div>
  )
}

function App() {
  const [state, setState] = useState<AppState>('idle')
  const [fileName, setFileName] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState('')
  const [vocals, setVocals] = useState<Blob | null>(null)
  const [instrumental, setInstrumental] = useState<Blob | null>(null)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const computeOverallProgress = useCallback((p: StemProgress) => {
    let overall = 0
    switch (p.stage) {
      case 'download':
        overall = p.progress * 0.3
        break
      case 'extract':
        overall = 30 + p.progress * 0.05
        break
      case 'separate':
        overall = 35 + p.progress * 0.55
        break
      case 'encode':
        overall = 90 + p.progress * 0.1
        break
    }
    setProgressPct(Math.min(100, overall))
    setProgressMsg(p.message)
  }, [])

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setError('')
    setVocals(null)
    setInstrumental(null)

    try {
      setState('loading-model')
      setProgressPct(0)
      setProgressMsg('AI 모델 로딩 중...')

      await stemSeparator.load(computeOverallProgress)

      setState('separating')
      setProgressMsg('음원 분리 시작...')

      const result = await stemSeparator.separate(file, computeOverallProgress)

      setVocals(result.vocals)
      setInstrumental(result.instrumental)
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
      setState('error')
    }
  }, [computeOverallProgress])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const reset = () => {
    setState('idle')
    setFileName('')
    setProgressPct(0)
    setProgressMsg('')
    setError('')
    setVocals(null)
    setInstrumental(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b-3 border-foreground bg-content1 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Music className="w-6 h-6 text-secondary" />
            <h1 className="text-lg font-black">TB Studio Lab</h1>
          </a>
          <span className="text-foreground/40">|</span>
          <span className="text-sm font-bold text-foreground/70">음원분리기</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* Idle: Upload */}
          {state === 'idle' && (
            <div
              className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-foreground/30 hover:border-foreground/60 bg-content1'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
              <p className="text-lg font-bold mb-2">오디오 파일을 드래그하거나 클릭하세요</p>
              <p className="text-sm text-foreground/50">MP3, WAV, FLAC, OGG, M4A 지원</p>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Loading / Separating */}
          {(state === 'loading-model' || state === 'separating') && (
            <div className="border-3 border-foreground rounded-2xl p-8 bg-content1 shadow-neo-lg">
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                <div>
                  <p className="font-bold">{formatFileName(fileName)}</p>
                  <p className="text-sm text-foreground/60">
                    {state === 'loading-model' ? 'AI 모델 준비 중...' : '음원 분리 중...'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-content3 rounded-full h-4 mb-3 border-2 border-foreground/20 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-foreground/50">
                <span>{progressMsg}</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
            </div>
          )}

          {/* Done */}
          {state === 'done' && vocals && instrumental && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-lg font-bold">분리 완료!</p>
                <p className="text-sm text-foreground/60">{fileName}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AudioPlayer label="보컬" blob={vocals} color="bg-secondary" />
                <AudioPlayer label="반주 (MR)" blob={instrumental} color="bg-primary" />
              </div>

              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm border-3 border-foreground shadow-neo-md hover:shadow-neo-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-content2 mt-4"
              >
                <RefreshCw className="w-4 h-4" />
                새 파일 분리하기
              </button>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="border-3 border-danger rounded-2xl p-8 bg-content1 shadow-neo-lg text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-danger" />
              <p className="font-bold text-lg mb-2">오류가 발생했습니다</p>
              <p className="text-sm text-foreground/60 mb-6">{error}</p>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-3 border-foreground shadow-neo-md hover:shadow-neo-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-danger text-danger-foreground"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-xs text-foreground/30 space-y-1">
            <p>UVR-MDX-NET 기반 AI 음원분리 (보컬/반주)</p>
            <p>모든 처리는 브라우저에서 로컬로 실행됩니다</p>
          </div>
        </div>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
