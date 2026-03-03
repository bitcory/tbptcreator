import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

class VideoEngine {
  private ffmpeg: FFmpeg | null = null
  private loaded = false
  private loading = false

  async load(onProgress?: (progress: number) => void): Promise<void> {
    if (this.loaded) return
    if (this.loading) {
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return
    }

    this.loading = true

    try {
      this.ffmpeg = new FFmpeg()

      this.ffmpeg.on('progress', ({ progress }) => {
        onProgress?.(progress * 100)
      })

      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm'

      const loadPromise = (async () => {
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
        await this.ffmpeg!.load({ coreURL, wasmURL })
      })()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('FFmpeg 로딩 시간 초과 (30초)')), 30000)
      )

      await Promise.race([loadPromise, timeoutPromise])

      this.loaded = true
    } catch (error) {
      console.error('FFmpeg 로딩 실패:', error)
      this.ffmpeg = null
      throw new Error('FFmpeg를 로드할 수 없습니다: ' + (error instanceof Error ? error.message : '네트워크 연결을 확인해주세요.'))
    } finally {
      this.loading = false
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  async extractAudioFromFile(file: File): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error('FFmpeg가 로드되지 않았습니다')
    }

    await this.ffmpeg.writeFile('input.mp4', await fetchFile(file))

    await this.ffmpeg.exec([
      '-i', 'input.mp4',
      '-vn', '-acodec', 'pcm_s16le',
      '-ar', '44100', '-ac', '2',
      'output.wav'
    ])

    const data = await this.ffmpeg.readFile('output.wav')
    return new Blob([data], { type: 'audio/wav' })
  }
}

export const videoEngine = new VideoEngine()
