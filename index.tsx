import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Upload,
  Copy,
  Wand2,
  Layers,
  Box,
  Settings,
  RefreshCw,
  FileJson,
  Check,
  AlertCircle,
  Play,
  ArrowRight,
  ArrowRightLeft,
  Loader2,
  Cpu,
  X,
  ShieldCheck,
  Languages,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ClipboardPaste,
  KeyRound,
  Circle,
  Triangle,
  Square,
  ImageIcon,
  Film,
  Lock,
  Palette,
  Scissors,
  Download,
  Eraser,
  GripVertical,
  ImagePlus,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  SlidersHorizontal,
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

// --- Types based on PRD Schema v2.0 + V5.0 Lite ---

interface MetaData {
  template_name: string;
  template_id?: string;
  version: string;
  author?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

interface GlobalSettings {
  default_platform: string;
  prompt_separator: string;
  section_separator: string;
  auto_capitalize: boolean;
  remove_duplicates: boolean;
}

interface ColorPalette {
  primary?: string;
  secondary?: string;
  accent?: string;
}

interface Attribute {
  attr_id: string;
  label: string;
  label_ko?: string;
  type: string;
  value: any;
  value_ko?: string;
  options?: string[] | { value: string; label: string; label_ko?: string }[];
  is_active: boolean;
  is_locked?: boolean;
  prefix?: string;
  weight?: { enabled: boolean; value: number };
  platform_overrides?: Record<string, any>;
  help_text?: string;
  validation?: any;
}

interface Component {
  component_id: string;
  component_label: string;
  component_label_ko?: string;
  is_active: boolean;
  is_collapsed?: boolean;
  attributes: Attribute[];
}

interface Section {
  section_id: string;
  section_label: string;
  section_label_ko?: string;
  order?: number;
  is_active: boolean;
  is_collapsed?: boolean;
  is_midjourney_params?: boolean;
  components: Component[];
}

interface Template {
  meta_data: MetaData;
  global_settings?: GlobalSettings;
  variables?: any[];
  prompt_sections: Section[];
  presets?: any[];
  platform_configs?: any;
  color_palette?: ColorPalette;
}

interface ScenePrompt {
  id: number;
  scene_title: string;
  prompt: string;
  ko_description: string;
}

type Stage = 'stage1' | 'stage2' | 'frame-extractor' | 'bg-remover';
type Stage2SubPage = 'image' | 'video';

interface ExtractedFrame {
  id: number;
  timestamp: number;
  dataUrl: string;
  filename: string;
}

// --- Sample Data from User (Pixar Skeleton) ---
const SAMPLE_TEMPLATE: Template = {
  "meta_data": {
    "template_name": "Cute Pixar Skeleton Hiker",
    "template_id": "tpl_pixar_skeleton_01",
    "version": "1.0.1",
    "category": "character",
    "tags": [
      "skeleton",
      "pixar",
      "cute",
      "hiking",
      "3d",
      "animation"
    ]
  },
  "prompt_sections": [
    {
      "section_id": "sec_subject",
      "section_label": "Main Subject",
      "section_label_ko": "주요 피사체",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_character",
          "component_label": "Character",
          "component_label_ko": "캐릭터",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "char_desc",
              "label": "Character Description",
              "label_ko": "캐릭터 묘사",
              "type": "textarea",
              "value": "cute anthropomorphic skeleton character, big expressive round eye sockets, friendly smile, smooth white bone texture, chibi proportions, adorable face",
              "value_ko": "귀여운 의인화된 해골 캐릭터, 크고 표현력 있는 둥근 눈구멍, 친근한 미소, 매끄러운 흰색 뼈 질감, 꼬마 비율, 사랑스러운 얼굴",
              "is_active": true
            }
          ]
        },
        {
          "component_id": "comp_outfit",
          "component_label": "Outfit",
          "component_label_ko": "복장",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "outfit_main",
              "label": "Hiking Gear",
              "label_ko": "등산 장비",
              "type": "textarea",
              "value": "colorful small hiking backpack, sturdy brown hiking boots, red bandana around neck, casual outdoor vest",
              "value_ko": "알록달록한 작은 등산 배낭, 튼튼한 갈색 등산화, 목에 두른 빨간 반다나, 캐주얼한 아웃도어 조끼",
              "is_active": true
            }
          ]
        },
        {
          "component_id": "comp_props",
          "component_label": "Props",
          "component_label_ko": "소품",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "prop_hand",
              "label": "Hand Props",
              "label_ko": "손 소품",
              "type": "text",
              "value": "wooden walking stick",
              "value_ko": "나무 지팡이",
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_environment",
      "section_label": "Environment",
      "section_label_ko": "환경",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_background",
          "component_label": "Background",
          "component_label_ko": "배경",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "bg_loc",
              "label": "Location",
              "label_ko": "장소",
              "type": "textarea",
              "value": "sunny mountain trail, lush green pine trees, rocky path, bright blue sky with fluffy white clouds, nature scenery",
              "value_ko": "화창한 산길, 울창한 푸른 소나무, 바위가 있는 오솔길, 솜사탕 같은 흰 구름이 떠 있는 맑고 푸른 하늘, 자연 풍경",
              "is_active": true
            }
          ]
        },
        {
          "component_id": "comp_lighting",
          "component_label": "Lighting",
          "component_label_ko": "조명",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "light_main",
              "label": "Lighting Style",
              "label_ko": "조명 스타일",
              "type": "textarea",
              "value": "bright natural sunlight, soft shadows, warm cinematic lighting, volumetric sun rays, high key lighting",
              "value_ko": "밝은 자연광, 부드러운 그림자, 따뜻한 시네마틱 조명, 볼류메트릭 선레이(빛내림), 하이키 조명",
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_camera",
      "section_label": "Camera",
      "section_label_ko": "카메라",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_camera_settings",
          "component_label": "Camera Settings",
          "component_label_ko": "카메라 설정",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "cam_shot",
              "label": "Shot Type",
              "label_ko": "샷 타입",
              "type": "text",
              "value": "medium full shot, slightly low angle to show adventure, depth of field background blur",
              "value_ko": "미디엄 풀 샷, 모험심을 보여주는 약간 낮은 앵글, 배경 흐림(피사계 심도)",
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_style",
      "section_label": "Style",
      "section_label_ko": "스타일",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_render",
          "component_label": "Render Style",
          "component_label_ko": "렌더링 스타일",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "style_main",
              "label": "Art Style",
              "label_ko": "예술 스타일",
              "type": "textarea",
              "value": "Pixar animation style, Disney aesthetic, 3D rendering, Unreal Engine 5, Octane Render, high fidelity, vibrant colors, cute aesthetic",
              "value_ko": "픽사 애니메이션 스타일, 디즈니 미적 감각, 3D 렌더링, 언리얼 엔진 5, 옥테인 렌더, 고해상도, 선명한 색감, 귀여운 분위기",
              "is_active": true
            }
          ]
        }
      ]
    }
  ]
};

// --- Default Empty Template ---

const DEFAULT_TEMPLATE: Template = {
  meta_data: {
    template_name: "새 템플릿",
    template_id: "tpl_new",
    version: "1.0.0",
    author: "User",
    description: "새로운 프롬프트 템플릿"
  },
  global_settings: {
    default_platform: "midjourney",
    "prompt_separator": ", ",
    "section_separator": ", ",
    "auto_capitalize": false,
    "remove_duplicates": true
  },
  prompt_sections: []
};

// --- Helper Functions ---

const generatePromptString = (template: Template | null, platform = 'midjourney'): string => {
  if (!template || !Array.isArray(template.prompt_sections)) return "";

  const parts: string[] = [];
  const params: string[] = [];

  const sortedSections = [...template.prompt_sections]
    .filter(s => s && (s.is_active !== false))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const section of sortedSections) {
    const sectionParts: string[] = [];
    const components = section.components || [];

    if (section.is_midjourney_params) {
      for (const comp of components) {
        if (!comp || (comp.is_active === false)) continue;
        const attributes = comp.attributes || [];
        for (const attr of attributes) {
          if (!attr || (attr.is_active === false) || !attr.value) continue;

          const prefix = attr.prefix ?? '';
          params.push(`${prefix}${attr.value}`);
        }
      }
      continue;
    }

    for (const comp of components) {
      if (!comp || (comp.is_active === false)) continue;

      const attributes = comp.attributes || [];
      for (const attr of attributes) {
        if (!attr || (attr.is_active === false) || (!attr.value && attr.value !== 0)) continue;

        let value = Array.isArray(attr.value)
          ? attr.value.join(', ')
          : String(attr.value);

        if (attr.weight?.enabled && attr.weight.value !== 1) {
          value += `::${attr.weight.value}`;
        }

        sectionParts.push(value);
      }
    }

    if (sectionParts.length > 0) {
      parts.push(sectionParts.join(template.global_settings?.prompt_separator || ', '));
    }
  }

  let prompt = parts.join(template.global_settings?.section_separator || ', ');

  if (template.global_settings?.remove_duplicates) {
    const words = prompt.split(',').map(s => s.trim()).filter(Boolean);
    prompt = [...new Set(words)].join(', ');
  }

  if (params.length > 0) {
    prompt += ' ' + params.join(' ');
  }

  return prompt;
};

const getDisplayValue = (attr: Attribute, value: any) => {
  if (attr.value_ko) return attr.value_ko;

  const valStr = Array.isArray(value) ? value.join(', ') : String(value);

  if (!attr.options) return valStr;

  const option = attr.options.find(opt => {
    if (typeof opt === 'string') return opt === valStr;
    return opt.value === valStr;
  });

  if (!option) return valStr;

  if (typeof option === 'string') return option;
  return option.label_ko || option.label || option.value;
};

const getCleanJson = (data: any): any => {
  if (Array.isArray(data)) return data.map(getCleanJson);
  if (data !== null && typeof data === 'object') {
    const newObj: any = {};
    for (const key in data) {
      if (key.endsWith('_ko')) continue;
      if (key === 'options') continue;
      newObj[key] = getCleanJson(data[key]);
    }
    return newObj;
  }
  return data;
};

// --- Sub-components ---

const CopyButton = ({ value }: { value: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.debug("Failed to copy:", err);
      });
  };

  return (
    <button
      onClick={handleCopy}
      className="neo-btn px-2 py-1 flex items-center gap-1.5 rounded-lg"
      title="값 복사"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] text-primary font-medium">복사됨</span>
        </>
      ) : (
        <>
           <Copy className="w-3.5 h-3.5" />
           <span className="text-[10px]">복사</span>
        </>
      )}
    </button>
  );
};

const PasteButton = ({ onPaste }: { onPaste: (text: string) => void }) => {
  return (
    <button
      onClick={async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) onPaste(text);
        } catch {
          // clipboard permission denied
        }
      }}
      className="neo-btn neo-btn-danger px-2 py-1 flex items-center gap-1.5 rounded-lg"
      title="클립보드 붙여넣기"
    >
      <ClipboardPaste className="w-3.5 h-3.5" />
      <span className="text-[10px]">붙여넣기</span>
    </button>
  );
};



// --- Stage2 Content Component ---

const Stage2Content = ({
  subPage,
  imagePrompts,
  videoPrompts,
  setImagePrompts,
  setVideoPrompts,
  onUpload,
}: {
  subPage: Stage2SubPage;
  imagePrompts: ScenePrompt[];
  videoPrompts: ScenePrompt[];
  setImagePrompts: React.Dispatch<React.SetStateAction<ScenePrompt[]>>;
  setVideoPrompts: React.Dispatch<React.SetStateAction<ScenePrompt[]>>;
  onUpload: () => void;
}) => {
  const prompts = subPage === 'image' ? imagePrompts : videoPrompts;
  const setPrompts = subPage === 'image' ? setImagePrompts : setVideoPrompts;
  const label = subPage === 'image' ? '이미지' : '영상';
  const IconComp = subPage === 'image' ? ImageIcon : Film;
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const updatePrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, prompt: newPrompt } : p));
  };

  const pasteToPrompt = (id: number) => {
    navigator.clipboard.readText().then(text => {
      updatePrompt(id, text);
    });
  };

  const copyText = (text: string, id?: number) => {
    navigator.clipboard.writeText(text).then(() => {
      if (id !== undefined) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    });
  };

  if (prompts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center neo-card-static">
            <IconComp className="w-10 h-10 text-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground/70 mb-2">{label} 프롬프트가 없습니다</p>
          <p className="text-sm text-foreground/50 mb-5">JSON 데이터를 업로드하여 씬 프롬프트를 확인하세요.</p>
          <button
            onClick={onUpload}
            className="neo-btn neo-btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            {label} JSON 업로드
          </button>
        </div>
      </div>
    );
  }

  const allPromptsText = prompts.map(p => p.prompt).join('\n\n');

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 md:p-6 gap-4">
      {/* Header */}
      <div className="shrink-0 neo-card-static rounded-xl p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComp className="w-5 h-5 text-secondary" />
            <h3 className="text-base md:text-lg font-black text-foreground uppercase">{label} 프롬프트</h3>
            <span className="memphis-badge text-xs">
              {prompts.length}개 씬
            </span>
          </div>
          <button
            onClick={() => copyText(allPromptsText)}
            className="neo-btn text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? '복사됨' : '전체 복사'}
          </button>
        </div>
      </div>

      {/* Scene Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4">
        {prompts.map((scene) => (
          <div key={scene.id} className="neo-card-static rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground flex items-center justify-between bg-content4">
              <div className="flex items-center gap-2.5">
                <span className="memphis-badge-secondary text-xs font-bold px-2 py-0.5 rounded-md">
                  #{scene.id}
                </span>
                <span className="text-sm md:text-base font-medium text-foreground">{scene.scene_title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => pasteToPrompt(scene.id)}
                  className="neo-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  붙여넣기
                </button>
                <button
                  onClick={() => copyText(scene.prompt, scene.id)}
                  className="neo-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                >
                  {copiedId === scene.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                  {copiedId === scene.id ? '복사됨' : '복사'}
                </button>
              </div>
            </div>

            {/* Card Body - Split View */}
            <div className="flex flex-col md:flex-row">
              {/* Left: Korean Description */}
              <div className="w-full md:w-1/2 p-3 md:p-4 md:border-r-2 border-b-2 md:border-b-0 border-foreground/20">
                <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">한국어 설명</div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{scene.ko_description}</p>
              </div>

              {/* Right: English Prompt */}
              <div className="w-full md:w-1/2 p-3 md:p-4 bg-content2">
                <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">English Prompt</div>
                <textarea
                  value={scene.prompt}
                  onChange={(e) => updatePrompt(scene.id, e.target.value)}
                  className="memphis-input w-full text-sm leading-relaxed font-mono whitespace-pre-wrap rounded-lg p-2 resize-y min-h-[60px]"
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Utility Functions ---

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatTimePrecise = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

// --- Frame Extractor Component ---

const FrameExtractorContent = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frameInterval, setFrameInterval] = useState<number>(1);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoMetadata, setVideoMetadata] = useState<{ width: number; height: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [detectedFps, setDetectedFps] = useState<number>(0);
  const [useAllFrames, setUseAllFrames] = useState(false);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<number>>(new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<ExtractedFrame | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const toggleSelectFrame = (id: number) => {
    setSelectedFrameIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFrames = () => {
    if (selectedFrameIds.size === extractedFrames.length) {
      setSelectedFrameIds(new Set());
    } else {
      setSelectedFrameIds(new Set(extractedFrames.map(f => f.id)));
    }
  };

  const downloadSelectedFrames = async () => {
    const targets = extractedFrames.filter(f => selectedFrameIds.has(f.id));
    for (let i = 0; i < targets.length; i++) {
      downloadFrame(targets[i]);
      if (i < targets.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setExtractionError('동영상 파일만 업로드할 수 있습니다.');
      return;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setExtractedFrames([]);
    setExtractionError(null);
    setExtractionProgress(0);
    setDetectedFps(0);
    setUseAllFrames(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleVideoFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVideoFile(file);
  };

  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setVideoDuration(video.duration);
    setVideoMetadata({ width: video.videoWidth, height: video.videoHeight });

    // Detect FPS using requestVideoFrameCallback
    const COMMON_FPS = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60];
    const snapToCommonFps = (raw: number): number => {
      let closest = raw;
      let minDiff = Infinity;
      for (const std of COMMON_FPS) {
        const diff = Math.abs(raw - std);
        if (diff < minDiff) { minDiff = diff; closest = std; }
      }
      // Snap if within 1.5 fps of a standard value
      return minDiff <= 1.5 ? Math.round(closest) : Math.round(raw);
    };

    if ('requestVideoFrameCallback' in video) {
      let frameCount = 0;
      let startTime = 0;
      const SAMPLE_COUNT = 30;
      const detectFps = () => {
        (video as any).requestVideoFrameCallback((_now: number, metadata: any) => {
          if (frameCount === 0) {
            startTime = metadata.mediaTime;
          }
          frameCount++;
          if (frameCount < SAMPLE_COUNT) {
            detectFps();
          } else {
            const elapsed = metadata.mediaTime - startTime;
            if (elapsed > 0) {
              const rawFps = (frameCount - 1) / elapsed;
              setDetectedFps(snapToCommonFps(rawFps));
            } else {
              setDetectedFps(30);
            }
            video.pause();
            video.currentTime = 0;
          }
        });
      };
      video.muted = true;
      video.currentTime = 0;
      video.play().then(() => detectFps()).catch(() => setDetectedFps(30));
    } else {
      setDetectedFps(30);
    }
  };

  const extractFrames = async () => {
    if (!videoUrl || !videoFile) return;

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionProgress(0);
    setExtractedFrames([]);

    try {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.preload = 'auto';

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve();
        video.onerror = () => reject(new Error('동영상을 로드할 수 없습니다.'));
      });

      const duration = video.duration;
      if (!isFinite(duration) || duration <= 0) {
        throw new Error('동영상 길이를 읽을 수 없습니다.');
      }

      // Generate timestamps
      const timestamps: number[] = [];
      const effectiveInterval = useAllFrames && detectedFps > 0
        ? 1 / detectedFps
        : frameInterval;

      for (let t = 0; t < duration; t += effectiveInterval) {
        timestamps.push(t);
      }

      // Ensure last frame is included
      const lastFrameTime = duration - 0.05;
      if (lastFrameTime > 0) {
        const lastTs = timestamps[timestamps.length - 1];
        if (lastTs === undefined || (lastFrameTime - lastTs) > (effectiveInterval * 0.5)) {
          timestamps.push(lastFrameTime);
        }
      }

      if (timestamps.length > 500) {
        const confirmed = window.confirm(
          `총 ${timestamps.length}개의 프레임이 추출됩니다. 메모리 사용량이 많을 수 있습니다. 계속하시겠습니까?`
        );
        if (!confirmed) {
          setIsExtracting(false);
          return;
        }
      }

      // Create canvas with 2x upscaling
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth * 2;
      canvas.height = video.videoHeight * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const frames: ExtractedFrame[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const timestamp = timestamps[i];

        // Seek to timestamp
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
          video.currentTime = timestamp;
        });

        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Export as PNG
        const dataUrl = canvas.toDataURL('image/png');

        const baseName = videoFile.name.replace(/\.[^.]+$/, '');
        frames.push({
          id: i + 1,
          timestamp,
          dataUrl,
          filename: `${baseName}_frame_${String(i + 1).padStart(4, '0')}_${formatTime(timestamp).replace(':', 'm')}s.png`,
        });

        setExtractionProgress(Math.round(((i + 1) / timestamps.length) * 100));
      }

      setExtractedFrames(frames);
    } catch (err: any) {
      setExtractionError(err.message || '프레임 추출 중 오류가 발생했습니다.');
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadFrame = (frame: ExtractedFrame) => {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = frame.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllFrames = async () => {
    for (let i = 0; i < extractedFrames.length; i++) {
      downloadFrame(extractedFrames[i]);
      if (i < extractedFrames.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    }
  };

  const resetAll = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setExtractedFrames([]);
    setExtractionError(null);
    setExtractionProgress(0);
    setVideoDuration(0);
    setVideoMetadata(null);
    setDetectedFps(0);
    setUseAllFrames(false);
  };

  const captureCurrentFrame = () => {
    const video = videoRef.current;
    if (!video || !videoFile || !videoMetadata) return;

    // Pause to capture the exact visible frame
    video.pause();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth * 2;
    canvas.height = video.videoHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    const timestamp = video.currentTime;
    const baseName = videoFile.name.replace(/\.[^.]+$/, '');
    const nextId = extractedFrames.length > 0 ? Math.max(...extractedFrames.map(f => f.id)) + 1 : 1;

    setExtractedFrames(prev => [...prev, {
      id: nextId,
      timestamp,
      dataUrl,
      filename: `${baseName}_frame_${String(nextId).padStart(4, '0')}_${formatTime(timestamp).replace(':', 'm')}s.png`,
    }]);
  };

  const captureEndFrame = async () => {
    const video = videoRef.current;
    if (!video || !videoFile || !videoMetadata) return;

    // Pause first so seek result stays visible
    video.pause();

    // Helper: seek and wait
    const seekTo = (time: number) => new Promise<void>((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });

    // Force seek to absolute maximum — browser clamps to last decodable frame
    await seekTo(99999);

    // If still not at visual end, double-seek: go back one frame then forward again
    if (video.currentTime < video.duration - 0.01) {
      const fps = detectedFps || 30;
      await seekTo(video.duration - (1 / fps));
      await seekTo(99999);
    }

    // Wait for the browser to paint the frame
    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 100)));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth * 2;
    canvas.height = video.videoHeight * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    const actualTime = video.currentTime;
    const baseName = videoFile.name.replace(/\.[^.]+$/, '');
    const nextId = extractedFrames.length > 0 ? Math.max(...extractedFrames.map(f => f.id)) + 1 : 1;

    setExtractedFrames(prev => [...prev, {
      id: nextId,
      timestamp: actualTime,
      dataUrl,
      filename: `${baseName}_endframe_${String(nextId).padStart(4, '0')}.png`,
    }]);
  };

  const effectiveInterval = useAllFrames && detectedFps > 0 ? 1 / detectedFps : frameInterval;
  const estimatedFrameCount = videoDuration > 0
    ? (() => {
        let count = Math.floor(videoDuration / effectiveInterval);
        const lastTs = count > 0 ? (count - 1) * effectiveInterval : 0;
        const lastFrameTime = videoDuration - 0.05;
        if (lastFrameTime > 0 && (count === 0 || (lastFrameTime - lastTs) > (effectiveInterval * 0.5))) {
          count += 1;
        }
        if (count === 0) count = 1;
        return count;
      })()
    : 0;

  // State: Upload
  if (!videoFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`frame-dropzone w-full max-w-lg p-10 rounded-2xl text-center cursor-pointer neo-card-static ${isDragOver ? 'frame-dropzone-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('frame-video-input')?.click()}
        >
          <input
            id="frame-video-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center neo-card-static">
            <Film className="w-10 h-10 text-warning" />
          </div>
          <p className="text-lg font-bold text-foreground/70 mb-2">동영상을 드래그하거나 클릭하여 업로드</p>
          <p className="text-sm text-foreground/50">MP4, WebM, MOV 등 지원</p>
        </div>
      </div>
    );
  }

  // State: Settings / Extracting / Results
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 p-3 md:p-4 gap-3">
      {/* LEFT: Video + Settings */}
      <div className="w-full md:w-1/2 shrink-0 flex flex-col gap-3 md:overflow-y-auto">
        {/* Video Preview */}
        <div className="neo-card-static rounded-xl p-3">
          <div
            className="relative"
            onDragStart={(e) => e.preventDefault()}
          >
            <video
              ref={videoRef}
              src={videoUrl!}
              controls
              draggable={false}
              className="w-full max-h-[50vh] rounded-lg border-2 border-foreground select-none object-contain bg-foreground/5"
              style={{ WebkitUserDrag: 'none' } as React.CSSProperties}
              onLoadedMetadata={handleVideoLoaded}
            />
          </div>
          {videoMetadata && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-primary text-primary-foreground border-2 border-foreground">{videoMetadata.width}x{videoMetadata.height}</span>
              <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border-2 border-foreground">{formatTime(videoDuration)}</span>
              {detectedFps > 0 && (
                <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-danger text-danger-foreground border-2 border-foreground">{detectedFps}fps</span>
              )}
              <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-warning text-warning-foreground border-2 border-foreground">출력: {videoMetadata.width * 2}x{videoMetadata.height * 2}</span>
            </div>
          )}
          <div className="flex gap-1.5 mt-2">
            <button
              onClick={captureCurrentFrame}
              disabled={isExtracting || videoDuration <= 0}
              className="neo-btn neo-btn-primary flex-1 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              현재 프레임
            </button>
            <button
              onClick={captureEndFrame}
              disabled={isExtracting || videoDuration <= 0}
              className="neo-btn neo-btn-danger flex-1 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-30"
            >
              <Film className="w-3.5 h-3.5" />
              엔드프레임
            </button>
            <button
              onClick={resetAll}
              className="neo-btn px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              새로고침
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isExtracting && (
          <div className="neo-card-static rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">진행률</span>
              <span className="text-xs font-bold text-warning">{extractionProgress}%</span>
            </div>
            <div className="w-full h-3 bg-content2 rounded-full border-2 border-foreground overflow-hidden">
              <div
                className="h-full bg-warning transition-all duration-200 ease-out"
                style={{ width: `${extractionProgress}%` }}
              />
            </div>
          </div>
        )}

        {extractionError && (
          <div className="neo-card-static rounded-xl p-2.5 flex items-start gap-1.5 text-xs bg-danger/10">
            <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" />
            <span className="text-foreground/80">{extractionError}</span>
          </div>
        )}
      </div>

      {/* RIGHT: Results */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0 min-w-0">
        {extractedFrames.length > 0 ? (
          <>
            {/* Results Header */}
            <div className="shrink-0 neo-card-static rounded-xl p-2.5 mb-3 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-black text-foreground uppercase">추출 결과</h3>
                  <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-warning text-warning-foreground border-2 border-foreground">{extractedFrames.length}개 프레임</span>
                </div>
                <button
                  onClick={() => { setExtractedFrames([]); setExtractionProgress(0); setSelectedFrameIds(new Set()); }}
                  className="neo-btn text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg"
                >
                  <RefreshCw className="w-3 h-3" />
                  초기화
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={selectAllFrames}
                  className={`text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 transition-all ${
                    selectedFrameIds.size === extractedFrames.length
                      ? 'bg-secondary text-secondary-foreground border-foreground'
                      : 'bg-content2 text-foreground/60 border-foreground/20 hover:border-foreground/40'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border-2 border-foreground flex items-center justify-center shrink-0 ${selectedFrameIds.size === extractedFrames.length ? 'bg-secondary' : 'bg-content1'}`}>
                    {selectedFrameIds.size === extractedFrames.length && <Check className="w-2.5 h-2.5 text-secondary-foreground" />}
                  </div>
                  전체 선택
                </button>
                {selectedFrameIds.size > 0 ? (
                  <button
                    onClick={downloadSelectedFrames}
                    className="neo-btn neo-btn-primary text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  >
                    <Download className="w-3 h-3" />
                    선택 다운로드 ({selectedFrameIds.size})
                  </button>
                ) : (
                  <button
                    onClick={downloadAllFrames}
                    className="neo-btn neo-btn-primary text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  >
                    <Download className="w-3 h-3" />
                    전체 다운로드
                  </button>
                )}
              </div>
            </div>

            {/* Frame Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {extractedFrames.map((frame) => {
                  const isSelected = selectedFrameIds.has(frame.id);
                  return (
                    <div
                      key={frame.id}
                      className={`neo-card-static rounded-xl overflow-hidden group cursor-pointer transition-all ${
                        isSelected ? 'ring-3 ring-secondary shadow-neo-sm' : ''
                      }`}
                      onClick={() => toggleSelectFrame(frame.id)}
                    >
                      <div className="relative">
                        <img
                          src={frame.dataUrl}
                          alt={`Frame ${frame.id}`}
                          className="w-full aspect-video object-cover"
                        />
                        {/* Selection checkbox */}
                        <div className={`absolute top-1.5 left-1.5 w-5 h-5 rounded border-2 border-foreground flex items-center justify-center transition-all ${
                          isSelected ? 'bg-secondary' : 'bg-content1/80'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-secondary-foreground" />}
                        </div>
                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewFrame(frame); }}
                            className="neo-btn neo-btn-warning p-1.5 rounded-lg"
                            title="미리보기"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadFrame(frame); }}
                            className="neo-btn neo-btn-primary p-1.5 rounded-lg"
                            title="다운로드"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="px-2 py-1 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-foreground/60">#{frame.id}</span>
                        <span className="text-[10px] font-mono text-foreground/60">{formatTimePrecise(frame.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preview Modal */}
            {previewFrame && (
              <div
                className="fixed inset-0 bg-foreground/60 z-50 flex items-center justify-center p-4"
                onClick={() => setPreviewFrame(null)}
              >
                <div
                  className="neo-card-static rounded-2xl max-w-[95vw] max-h-[95vh] flex flex-col animate-scale-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b-3 border-foreground flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-warning" />
                      <span className="text-sm font-black text-foreground">#{previewFrame.id}</span>
                      <span className="text-xs font-mono text-foreground/60">{formatTimePrecise(previewFrame.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadFrame(previewFrame)}
                        className="neo-btn neo-btn-primary px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        다운로드
                      </button>
                      <button
                        onClick={() => setPreviewFrame(null)}
                        className="neo-btn neo-btn-danger p-1.5 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden p-3 bg-foreground/5 flex items-center justify-center">
                    <img
                      src={previewFrame.dataUrl}
                      alt={`Frame ${previewFrame.id}`}
                      className="max-w-full max-h-[calc(95vh-60px)] object-contain rounded-lg border-2 border-foreground"
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center neo-card-static">
                <ImageIcon className="w-8 h-8 text-foreground/30" />
              </div>
              <p className="text-sm font-bold text-foreground/40">추출된 프레임이 여기에 표시됩니다</p>
              <p className="text-xs text-foreground/30 mt-1">간격 추출 또는 현재 프레임 캡처를 사용하세요</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Background Remover Types & Constants ---

type BgImageStatus = 'idle' | 'processing' | 'done' | 'error';
type BgBackgroundType = 'transparent' | 'color' | 'image';
type BgImageFormat = 'png' | 'webp';

interface BgBackground {
  type: BgBackgroundType;
  color: string;
  imageUrl: string | null;
}

const BG_PRESET_COLORS = ['#ffffff','#000000','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#6b7280'];
const BG_MAX_FILE_SIZE = 20 * 1024 * 1024;
const BG_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// --- Background Remover Utilities ---

const bgValidateFile = (file: File): string | null => {
  if (!BG_ACCEPTED_TYPES.includes(file.type)) {
    return 'PNG, JPEG, WEBP 형식만 지원합니다.';
  }
  if (file.size > BG_MAX_FILE_SIZE) {
    return '파일 크기는 20MB 이하여야 합니다.';
  }
  return null;
};

const bgLoadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

const bgCanvasToBlob = (canvas: HTMLCanvasElement, format: BgImageFormat = 'png', quality = 1.0): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'webp' ? 'image/webp' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      },
      mimeType,
      quality,
    );
  });
};

const bgDownloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const bgGetImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

// --- Background Remover Component ---

type BgEditMode = 'compare' | 'erase';

// --- Inline ManualEraser ---
const BG_MIN_ZOOM = 1;
const BG_MAX_ZOOM = 10;
const BG_MIN_BRUSH = 5;
const BG_MAX_BRUSH = 100;
const BG_MAX_HISTORY = 20;

const BgManualEraser = ({ imageUrl, width, height, onSave }: {
  imageUrl: string; width: number; height: number; onSave: (url: string) => void;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  const [brushSize, setBrushSize] = useState(30);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const historyRef = React.useRef<ImageData[]>([]);
  const historyIndexRef = React.useRef(-1);
  const lastPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const isDrawingRef = React.useRef(false);
  const isPanningRef = React.useRef(false);
  const panStartMouseRef = React.useRef({ x: 0, y: 0 });
  const panStartValRef = React.useRef({ x: 0, y: 0 });
  const spaceHeldRef = React.useRef(false);

  const brushSizeRef = React.useRef(brushSize);
  brushSizeRef.current = brushSize;
  const zoomRef = React.useRef(zoom);
  zoomRef.current = zoom;
  const panRef = React.useRef(pan);
  panRef.current = pan;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    bgLoadImage(imageUrl).then((img) => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveToHistory();
    });
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [imageUrl, width, height]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        spaceHeldRef.current = true;
        if (cursorRef.current) cursorRef.current.style.display = 'none';
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'none';
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const getContainedRect = React.useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { offsetX: 0, offsetY: 0, renderWidth: 1, renderHeight: 1 };
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const imageAspect = canvas.width / canvas.height;
    const containerAspect = cw / ch;
    let rw: number, rh: number, ox: number, oy: number;
    if (imageAspect > containerAspect) { rw = cw; rh = cw / imageAspect; ox = 0; oy = (ch - rh) / 2; }
    else { rh = ch; rw = ch * imageAspect; ox = (cw - rw) / 2; oy = 0; }
    return { offsetX: ox, offsetY: oy, renderWidth: rw, renderHeight: rh };
  }, []);

  const clampPan = React.useCallback((px: number, py: number, z: number) => {
    if (z <= 1) return { x: 0, y: 0 };
    const container = containerRef.current;
    if (!container) return { x: px, y: py };
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    return { x: Math.max(cw * (1 - z), Math.min(0, px)), y: Math.max(ch * (1 - z), Math.min(0, py)) };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -2 : 2;
        setBrushSize(prev => Math.max(BG_MIN_BRUSH, Math.min(BG_MAX_BRUSH, prev + delta)));
      } else {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const oldZoom = zoomRef.current;
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        let newZoom = Math.max(BG_MIN_ZOOM, Math.min(BG_MAX_ZOOM, oldZoom * factor));
        if (Math.abs(newZoom - 1) < 0.05) newZoom = 1;
        let nx = mx - (mx - panRef.current.x) * (newZoom / oldZoom);
        let ny = my - (my - panRef.current.y) * (newZoom / oldZoom);
        if (newZoom <= 1) { nx = 0; ny = 0; }
        else {
          const cw = container.clientWidth; const ch = container.clientHeight;
          nx = Math.max(cw * (1 - newZoom), Math.min(0, nx));
          ny = Math.max(ch * (1 - newZoom), Math.min(0, ny));
        }
        setZoom(newZoom);
        setPan({ x: nx, y: ny });
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const saveToHistory = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(data);
    if (historyRef.current.length > BG_MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = React.useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = React.useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const getCanvasPos = React.useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;
    const rect = container.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const lx = (cx - panRef.current.x) / zoomRef.current;
    const ly = (cy - panRef.current.y) / zoomRef.current;
    const { offsetX, offsetY, renderWidth, renderHeight } = getContainedRect();
    const scaleX = canvas.width / renderWidth;
    const scaleY = canvas.height / renderHeight;
    return { x: (lx - offsetX) * scaleX, y: (ly - offsetY) * scaleY };
  }, [getContainedRect]);

  const erase = React.useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { renderWidth } = getContainedRect();
    const baseScale = canvas.width / renderWidth;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, (brushSizeRef.current / 2) * baseScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [getContainedRect]);

  const eraseLine = React.useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { renderWidth } = getContainedRect();
    const baseScale = canvas.width / renderWidth;
    const radius = (brushSizeRef.current / 2) * baseScale;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = radius * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }, [getContainedRect]);

  const moveCursor = React.useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    const cursor = cursorRef.current;
    if (!container || !cursor) return;
    const rect = container.getBoundingClientRect();
    cursor.style.left = `${clientX - rect.left}px`;
    cursor.style.top = `${clientY - rect.top}px`;
  }, []);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
      isPanningRef.current = true;
      panStartMouseRef.current = { x: e.clientX, y: e.clientY };
      panStartValRef.current = { ...panRef.current };
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      return;
    }
    if (e.button === 0) {
      isDrawingRef.current = true;
      const pos = getCanvasPos(e.clientX, e.clientY);
      if (pos) { erase(pos.x, pos.y); lastPosRef.current = pos; }
    }
  }, [getCanvasPos, erase]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !spaceHeldRef.current) {
      moveCursor(e.clientX, e.clientY);
      if (!cursorVisible) setCursorVisible(true);
    }
    if (isPanningRef.current) {
      const dx = e.clientX - panStartMouseRef.current.x;
      const dy = e.clientY - panStartMouseRef.current.y;
      setPan(clampPan(panStartValRef.current.x + dx, panStartValRef.current.y + dy, zoomRef.current));
      return;
    }
    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e.clientX, e.clientY);
    if (pos) {
      if (lastPosRef.current) eraseLine(lastPosRef.current, pos);
      else erase(pos.x, pos.y);
      lastPosRef.current = pos;
    }
  }, [cursorVisible, getCanvasPos, erase, eraseLine, moveCursor, clampPan]);

  const handlePointerUp = React.useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) containerRef.current.style.cursor = spaceHeldRef.current ? 'grab' : 'none';
      return;
    }
    if (isDrawingRef.current) { isDrawingRef.current = false; lastPosRef.current = null; saveToHistory(); }
  }, [saveToHistory]);

  const handlePointerLeave = React.useCallback(() => {
    setCursorVisible(false);
    if (isPanningRef.current) { isPanningRef.current = false; return; }
    if (isDrawingRef.current) { isDrawingRef.current = false; lastPosRef.current = null; saveToHistory(); }
  }, [saveToHistory]);

  const zoomTo = React.useCallback((newZoom: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const oldZoom = zoomRef.current;
    const z = Math.max(BG_MIN_ZOOM, Math.min(BG_MAX_ZOOM, newZoom));
    const mx = cw / 2; const my = ch / 2;
    let nx = mx - (mx - panRef.current.x) * (z / oldZoom);
    let ny = my - (my - panRef.current.y) * (z / oldZoom);
    const clamped = z <= 1 ? { x: 0, y: 0 } : clampPan(nx, ny, z);
    setZoom(z);
    setPan(clamped);
  }, [clampPan]);

  const handleSave = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => { if (blob) onSave(URL.createObjectURL(blob)); }, 'image/png');
  }, [onSave]);

  const cursorSize = brushSize * zoom;

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden select-none checkerboard-bg"
        style={{ cursor: 'none', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <canvas ref={canvasRef} className="w-full h-full block" style={{ objectFit: 'contain' }} />
        </div>
        <div
          ref={cursorRef}
          className="absolute pointer-events-none"
          style={{
            width: cursorSize, height: cursorSize,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)', transform: 'translate(-50%, -50%)',
            display: cursorVisible ? 'block' : 'none',
          }}
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium">
          지우개 모드
        </div>
        {zoom > 1 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium tabular-nums">
            {Math.round(zoom * 100)}%
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <div className="shrink-0 rounded-full bg-foreground" style={{ width: Math.max(8, brushSize * 0.4), height: Math.max(8, brushSize * 0.4) }} />
          <input type="range" min={BG_MIN_BRUSH} max={BG_MAX_BRUSH} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="flex-1 accent-danger" />
          <span className="text-[10px] text-foreground/50 w-6 text-right tabular-nums font-bold">{brushSize}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={!canUndo} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="실행 취소"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={redo} disabled={!canRedo} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="다시 실행"><Redo2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => zoomTo(zoom / 1.3)} disabled={zoom <= BG_MIN_ZOOM} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="축소"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={() => zoomTo(1)} disabled={zoom === 1} className="neo-btn px-1.5 py-1 rounded-lg disabled:opacity-30 text-[10px] tabular-nums min-w-[2.5rem] text-center font-bold" title="초기화">{Math.round(zoom * 100)}%</button>
          <button onClick={() => zoomTo(zoom * 1.3)} disabled={zoom >= BG_MAX_ZOOM} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="확대"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>
        <button onClick={handleSave} className="neo-btn neo-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold">
          <Check className="w-3.5 h-3.5" />
          완료
        </button>
      </div>
    </div>
  );
};

// --- Background Remover Component ---

const BackgroundRemoverContent = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [removedBgUrl, setRemovedBgUrl] = useState<string | null>(null);
  const [editedBgUrl, setEditedBgUrl] = useState<string | null>(null);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<BgImageStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [background, setBackground] = useState<BgBackground>({ type: 'transparent', color: '#ffffff', imageUrl: null });
  const [downloadFormat, setDownloadFormat] = useState<BgImageFormat>('png');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [editMode, setEditMode] = useState<BgEditMode>('compare');
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const bgFileRef = React.useRef<HTMLInputElement>(null);

  // The foreground image is either the manually edited one or the raw removal result
  const fgUrl = editedBgUrl ?? removedBgUrl;

  // Handle image file
  const handleImageFile = async (file: File) => {
    const validationError = bgValidateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setRemovedBgUrl(null);
    setEditedBgUrl(null);
    setCompositeUrl(null);
    setSliderPosition(50);
    setEditMode('compare');
    setBackground({ type: 'transparent', color: '#ffffff', imageUrl: null });

    try {
      const dims = await bgGetImageDimensions(url);
      setImageWidth(dims.width);
      setImageHeight(dims.height);
    } catch {
      setImageWidth(0);
      setImageHeight(0);
    }

    // Start background removal
    setStatus('processing');
    setProgress(0);
    try {
      const blob = await removeBackground(url, {
        progress: (_key: string, current: number, total: number) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      const resultUrl = URL.createObjectURL(blob as Blob);
      setRemovedBgUrl(resultUrl);
      setStatus('done');
    } catch (err: any) {
      setError(err.message || '배경 제거 중 오류가 발생했습니다.');
      setStatus('error');
    }
  };

  // Composite background — uses editedBgUrl if available, otherwise removedBgUrl
  useEffect(() => {
    if (!fgUrl || imageWidth === 0 || imageHeight === 0) return;

    const doComposite = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        const ctx = canvas.getContext('2d')!;

        if (background.type === 'color') {
          ctx.fillStyle = background.color;
          ctx.fillRect(0, 0, imageWidth, imageHeight);
        } else if (background.type === 'image' && background.imageUrl) {
          const bgImg = await bgLoadImage(background.imageUrl);
          ctx.drawImage(bgImg, 0, 0, imageWidth, imageHeight);
        }

        const fgImg = await bgLoadImage(fgUrl);
        ctx.drawImage(fgImg, 0, 0, imageWidth, imageHeight);

        setCompositeUrl(canvas.toDataURL('image/png'));
      } catch {
        // composite failed silently
      }
    };
    doComposite();
  }, [fgUrl, background, imageWidth, imageHeight]);

  // Handle eraser save
  const handleEraserSave = (url: string) => {
    setEditedBgUrl(url);
    setEditMode('compare');
  };

  // Download
  const handleDownload = async () => {
    const sourceUrl = compositeUrl || fgUrl;
    if (!sourceUrl || !imageFile) return;

    try {
      const img = await bgLoadImage(sourceUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const blob = await bgCanvasToBlob(canvas, downloadFormat);
      const baseName = imageFile.name.replace(/\.[^.]+$/, '');
      bgDownloadBlob(blob, `${baseName}_no-bg.${downloadFormat}`);
    } catch {
      // download failed
    }
  };

  // Reset
  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (removedBgUrl) URL.revokeObjectURL(removedBgUrl);
    if (editedBgUrl) URL.revokeObjectURL(editedBgUrl);
    if (background.imageUrl) URL.revokeObjectURL(background.imageUrl);
    setImageFile(null);
    setOriginalUrl(null);
    setRemovedBgUrl(null);
    setEditedBgUrl(null);
    setCompositeUrl(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setImageWidth(0);
    setImageHeight(0);
    setBackground({ type: 'transparent', color: '#ffffff', imageUrl: null });
    setSliderPosition(50);
    setEditMode('compare');
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Slider handlers
  const updateSliderPosition = React.useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  }, []);

  const handleSliderPointerDown = React.useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleSliderPointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateSliderPosition(e.clientX);
  }, [updateSliderPosition]);

  const handleSliderPointerUp = React.useCallback(() => {
    isDragging.current = false;
  }, []);

  // Background editor handlers
  const setBgType = (type: BgBackgroundType) => {
    setBackground(prev => ({ ...prev, type }));
  };

  const setBgColor = (color: string) => {
    setBackground(prev => ({ ...prev, type: 'color', color }));
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBackground(prev => ({ ...prev, type: 'image', imageUrl: url }));
    e.target.value = '';
  };

  // Upload state (idle, no file)
  if (!imageFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`frame-dropzone w-full max-w-lg p-10 rounded-2xl text-center cursor-pointer neo-card-static ${isDragOver ? 'frame-dropzone-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('bg-image-input')?.click()}
        >
          <input
            id="bg-image-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }}
          />
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center neo-card-static">
            <Eraser className="w-10 h-10 text-danger" />
          </div>
          <p className="text-lg font-bold text-foreground/70 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
          <p className="text-sm text-foreground/50">PNG, JPEG, WEBP 지원 (최대 20MB)</p>
          {error && (
            <div className="mt-4 p-2.5 rounded-xl flex items-center gap-2 text-xs bg-danger/10 border-2 border-foreground">
              <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0" />
              <span className="text-foreground/80">{error}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Processing / Done / Error states
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 p-3 md:p-4 gap-3">
      {/* LEFT: Image Preview / Slider / Eraser */}
      <div className="w-full md:w-1/2 shrink-0 flex flex-col gap-3 md:overflow-y-auto">
        {status === 'processing' && (
          <div className="neo-card-static rounded-xl overflow-hidden">
            <div className="relative">
              <img
                src={originalUrl!}
                alt="Original"
                className="w-full max-h-[60vh] object-contain rounded-t-lg bg-foreground/5"
              />
              <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <span className="text-white font-bold text-sm">배경 제거 중... {progress}%</span>
              </div>
            </div>
            <div className="p-3">
              <div className="w-full h-3 bg-content2 rounded-full border-2 border-foreground overflow-hidden">
                <div className="h-full bg-danger transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        {status === 'done' && originalUrl && fgUrl && (
          <div className="neo-card-static rounded-xl overflow-hidden">
            {/* Mode toggle: 비교 / 지우개 */}
            <div className="px-3 py-2 border-b-2 border-foreground/20 flex items-center gap-2">
              <div className="flex rounded-lg border-2 border-foreground overflow-hidden">
                <button
                  onClick={() => setEditMode('compare')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                    editMode === 'compare'
                      ? 'bg-secondary text-secondary-foreground'
                      : 'bg-content1 text-foreground/50 hover:bg-foreground/5'
                  }`}
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  비교
                </button>
                <button
                  onClick={() => setEditMode('erase')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-colors ${
                    editMode === 'erase'
                      ? 'bg-danger text-danger-foreground'
                      : 'bg-content1 text-foreground/50 hover:bg-foreground/5'
                  }`}
                >
                  <Eraser className="w-3 h-3" />
                  지우개
                </button>
              </div>
              <div className="flex-1" />
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-primary text-primary-foreground border-2 border-foreground">{imageWidth}x{imageHeight}</span>
              </div>
              <button
                onClick={resetAll}
                className="neo-btn px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Content based on mode */}
            <div className="p-3">
              {editMode === 'compare' ? (
                <>
                  {/* Before/After Slider */}
                  <div
                    ref={sliderRef}
                    className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden select-none cursor-col-resize checkerboard-bg"
                    style={{ touchAction: 'none' }}
                    onPointerDown={handleSliderPointerDown}
                    onPointerMove={handleSliderPointerMove}
                    onPointerUp={handleSliderPointerUp}
                  >
                    <img
                      src={compositeUrl || fgUrl}
                      alt="After"
                      className="absolute inset-0 w-full h-full object-contain"
                      draggable={false}
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                    >
                      <img
                        src={originalUrl}
                        alt="Before"
                        className="absolute inset-0 w-full h-full object-contain"
                        draggable={false}
                      />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                      style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-foreground">
                        <GripVertical className="w-5 h-5 sm:w-4 sm:h-4 text-foreground/50" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium">Before</div>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium">After</div>
                  </div>
                </>
              ) : (
                <BgManualEraser
                  imageUrl={fgUrl}
                  width={imageWidth}
                  height={imageHeight}
                  onSave={handleEraserSave}
                />
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="neo-card-static rounded-xl p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center neo-card-static">
              <AlertCircle className="w-8 h-8 text-danger" />
            </div>
            <p className="text-sm font-bold text-foreground/80">{error || '배경 제거 중 오류가 발생했습니다.'}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  if (originalUrl) {
                    setStatus('processing');
                    setProgress(0);
                    setError(null);
                    removeBackground(originalUrl, {
                      progress: (_key: string, current: number, total: number) => {
                        if (total > 0) setProgress(Math.round((current / total) * 100));
                      },
                    }).then((blob) => {
                      const resultUrl = URL.createObjectURL(blob as Blob);
                      setRemovedBgUrl(resultUrl);
                      setEditedBgUrl(null);
                      setStatus('done');
                    }).catch((err: any) => {
                      setError(err.message || '배경 제거 중 오류가 발생했습니다.');
                      setStatus('error');
                    });
                  }
                }}
                className="neo-btn neo-btn-danger px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                재시도
              </button>
              <button
                onClick={resetAll}
                className="neo-btn px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <ImagePlus className="w-4 h-4" />
                새 이미지
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && originalUrl && (
          <div className="neo-card-static rounded-xl overflow-hidden">
            <img src={originalUrl} alt="Original" className="w-full max-h-[60vh] object-contain bg-foreground/5" />
          </div>
        )}
      </div>

      {/* RIGHT: Background Editor & Download */}
      <div className="w-full md:w-1/2 flex flex-col min-h-0 gap-3 md:overflow-y-auto">
        {status === 'done' && (
          <>
            {/* Background Editor */}
            <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-danger" />
                <h3 className="text-sm font-black text-foreground uppercase">배경 설정</h3>
              </div>

              <div className="flex rounded-lg border-2 border-foreground overflow-hidden">
                {([
                  { type: 'transparent' as BgBackgroundType, label: '투명' },
                  { type: 'color' as BgBackgroundType, label: '단색' },
                  { type: 'image' as BgBackgroundType, label: '이미지' },
                ]).map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => setBgType(type)}
                    className={`flex-1 text-xs py-2 font-bold transition-colors ${
                      background.type === type
                        ? 'bg-danger text-danger-foreground'
                        : 'bg-content1 text-foreground/60 hover:bg-foreground/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {background.type === 'color' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {BG_PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setBgColor(c)}
                        className={`w-8 h-8 rounded-full border-3 transition-transform hover:scale-110 active:scale-95 ${
                          background.color === c ? 'border-foreground scale-110' : 'border-foreground/30'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="color" value={background.color} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-2 border-foreground" />
                    <span className="text-xs text-foreground/50 font-mono">{background.color}</span>
                  </div>
                </div>
              )}

              {background.type === 'image' && (
                <div>
                  <button onClick={() => bgFileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg frame-dropzone text-sm text-foreground/60 font-bold">
                    <ImagePlus className="w-4 h-4" />
                    배경 이미지 선택
                  </button>
                  {background.imageUrl && (
                    <img src={background.imageUrl} alt="Background" className="mt-2 w-full h-20 object-cover rounded-lg border-2 border-foreground" />
                  )}
                  <input ref={bgFileRef} type="file" accept="image/*" className="hidden" onChange={handleBgImageUpload} />
                </div>
              )}

              {background.type === 'transparent' && (
                <p className="text-xs text-foreground/50">배경이 투명한 PNG로 저장됩니다.</p>
              )}
            </div>

            {/* Download Panel */}
            <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black text-foreground uppercase">다운로드</h3>
              </div>

              <div className="flex rounded-lg border-2 border-foreground overflow-hidden">
                {(['png', 'webp'] as BgImageFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDownloadFormat(f)}
                    className={`flex-1 text-xs py-2 font-bold uppercase transition-colors ${
                      downloadFormat === f
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-content1 text-foreground/60 hover:bg-foreground/5'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={handleDownload} className="flex-1 neo-btn neo-btn-primary flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold">
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
                <button onClick={resetAll} className="neo-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold">
                  <ImagePlus className="w-4 h-4" />
                  <span className="hidden sm:inline">새 이미지</span>
                </button>
              </div>
            </div>
          </>
        )}

        {(status === 'processing' || status === 'idle') && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center neo-card-static">
                <Eraser className="w-8 h-8 text-foreground/30" />
              </div>
              <p className="text-sm font-bold text-foreground/40">
                {status === 'processing' ? '배경을 제거하는 중입니다...' : '배경 편집 옵션이 여기에 표시됩니다'}
              </p>
              <p className="text-xs text-foreground/30 mt-1">
                {status === 'processing' ? '잠시만 기다려주세요' : '이미지를 업로드하면 자동으로 시작됩니다'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

const App = () => {
  const [template, setTemplate] = useState<Template>(SAMPLE_TEMPLATE);
  const [promptString, setPromptString] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isApiInfoOpen, setIsApiInfoOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState("");
  const [uploadInput, setUploadInput] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const str = generatePromptString(template);
    setPromptString(str);
    const maxTab = (template.prompt_sections || []).length - 1;
    if (activeTab > maxTab) setActiveTab(Math.max(0, maxTab));
  }, [template]);

  const updateAttributeValue = (sectionId: string, componentId: string, attrId: string, newValue: any) => {
    try {
      const newTemplate = JSON.parse(JSON.stringify(template));
      const s = newTemplate.prompt_sections.find((s:any) => s.section_id === sectionId);
      const c = s?.components.find((c:any) => c.component_id === componentId);
      const a = c?.attributes.find((a:any) => a.attr_id === attrId);
      if (a) {
        a.value = newValue;
        setTemplate(newTemplate);
      }
    } catch (err) { console.error("Error updating attribute:", err); }
  };

  // V5.0 Lite JSON 정규화: 간소화된 필드에 기본값 채움
  const normalizeTemplate = (json: any): any => {
    // component_id → 사람이 읽기 좋은 레이블 변환
    const compLabelMap: Record<string, { en: string; ko: string }> = {
      comp_character: { en: 'Character', ko: '캐릭터' },
      comp_landscape: { en: 'Landscape', ko: '풍경' },
      comp_object: { en: 'Object', ko: '사물' },
      comp_creature: { en: 'Creature', ko: '생물' },
      comp_env: { en: 'Environment', ko: '환경' },
      comp_camera: { en: 'Camera', ko: '카메라' },
      comp_style: { en: 'Style', ko: '스타일' },
      comp_outfit: { en: 'Outfit', ko: '복장' },
      comp_props: { en: 'Props', ko: '소품' },
      comp_background: { en: 'Background', ko: '배경' },
      comp_lighting: { en: 'Lighting', ko: '조명' },
      comp_camera_settings: { en: 'Camera Settings', ko: '카메라 설정' },
      comp_render: { en: 'Render Style', ko: '렌더링 스타일' },
    };

    const compIdToLabel = (id: string): string => {
      return compLabelMap[id]?.ko || id.replace(/^comp_/, '').replace(/_/g, ' ');
    };

    const compIdToLabelEn = (id: string): string => {
      return compLabelMap[id]?.en || id.replace(/^comp_/, '').replace(/_/g, ' ');
    };

    // meta_data 정규화
    if (json.meta_data) {
      if (!json.meta_data.template_id) {
        json.meta_data.template_id = json.meta_data.template_name
          ? 'tpl_' + json.meta_data.template_name.toLowerCase().replace(/\s+/g, '_').substring(0, 30)
          : 'tpl_uploaded';
      }
    } else {
      json.meta_data = { template_name: 'Uploaded Template', template_id: 'tpl_uploaded', version: '1.0.0' };
    }

    // prompt_sections 정규화
    if (Array.isArray(json.prompt_sections)) {
      json.prompt_sections = json.prompt_sections.map((section: any, sIdx: number) => {
        // section 기본값
        if (!section.section_label) {
          section.section_label = section.section_label_ko || section.section_id || `Section ${sIdx + 1}`;
        }
        if (section.is_active === undefined) section.is_active = true;

        // components 정규화
        if (Array.isArray(section.components)) {
          section.components = section.components.map((comp: any) => {
            if (!comp.component_label) {
              comp.component_label = compIdToLabelEn(comp.component_id || 'unknown');
            }
            if (!comp.component_label_ko) {
              comp.component_label_ko = compIdToLabel(comp.component_id || 'unknown');
            }
            if (comp.is_active === undefined) comp.is_active = true;

            // attributes 정규화
            if (Array.isArray(comp.attributes)) {
              comp.attributes = comp.attributes.map((attr: any) => {
                if (!attr.label) {
                  attr.label = attr.label_ko || attr.attr_id || 'Unknown';
                }
                if (!attr.type) attr.type = 'textarea';
                if (attr.is_active === undefined) attr.is_active = true;
                return attr;
              });
            } else {
              comp.attributes = [];
            }
            return comp;
          });
        } else {
          section.components = [];
        }
        return section;
      });
    }

    return json;
  };

  const handleUpload = () => {
    setUploadError(null);
    setIsUploadLoading(true);

    let cleanedInput = uploadInput.trim();

    cleanedInput = cleanedInput
      .replace(/^```(?:json|JSON)?\s*\n?/gm, '')
      .replace(/\n?```\s*$/gm, '')
      .trim();

    console.log('[handleUpload] Cleaned input:', cleanedInput.substring(0, 100));

    try {
      if (!cleanedInput) throw new Error("JSON 내용을 입력해주세요.");

      let json;
      try {
        json = JSON.parse(cleanedInput);
      } catch (parseErr: any) {
        console.error('[handleUpload] Parse error:', parseErr);
        throw new Error(`JSON 파싱 오류: ${parseErr.message}`);
      }

      if (!json || typeof json !== 'object') throw new Error("유효한 JSON 객체가 아닙니다.");

      if (!Array.isArray(json.prompt_sections)) {
        if (json.prompt_sections && typeof json.prompt_sections === 'object') {
           throw new Error("'prompt_sections' 형식이 올바르지 않습니다.");
        }
        json.prompt_sections = [];
      }

      // V5.0 Lite 호환: 간소화된 필드 정규화
      json = normalizeTemplate(json);

      console.log('[handleUpload] Successfully parsed template:', json.meta_data?.template_name || 'Unknown');

      setTemplate(json);

      setIsUploadModalOpen(false);
      setUploadInput("");

      setIsSidebarOpen(false);

      setExpandedSection(null);
    } catch (e: any) {
      console.error('[handleUpload] Error:', e);
      setUploadError(e.message || "JSON 파싱 오류가 발생했습니다.");
    } finally {
      setIsUploadLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleStage2Upload = () => {
    setStage2UploadError(null);

    let cleanedInput = stage2UploadInput.trim();
    cleanedInput = cleanedInput
      .replace(/^```(?:json|JSON)?\s*\n?/gm, '')
      .replace(/\n?```\s*$/gm, '')
      .trim();

    try {
      if (!cleanedInput) throw new Error('JSON 내용을 입력해주세요.');

      let json;
      try {
        json = JSON.parse(cleanedInput);
      } catch (parseErr: any) {
        throw new Error(`JSON 파싱 오류: ${parseErr.message}`);
      }

      if (!Array.isArray(json)) throw new Error('JSON 배열 형식이어야 합니다.');

      // Detect combined format (has image_prompt and video_prompt fields)
      const isCombinedFormat = json.length > 0 && ('image_prompt' in json[0] || 'video_prompt' in json[0]);

      if (isCombinedFormat) {
        // Combined format validation & splitting
        const imgPrompts: ScenePrompt[] = [];
        const vidPrompts: ScenePrompt[] = [];

        for (let i = 0; i < json.length; i++) {
          const item = json[i];
          if (typeof item.id !== 'number') throw new Error(`항목 ${i + 1}: "id" 필드가 누락되었거나 숫자가 아닙니다.`);
          if (typeof item.scene_title !== 'string') throw new Error(`항목 ${i + 1}: "scene_title" 필드가 누락되었습니다.`);

          if ('image_prompt' in item) {
            if (typeof item.image_prompt !== 'string') throw new Error(`항목 ${i + 1}: "image_prompt" 필드가 문자열이 아닙니다.`);
            imgPrompts.push({
              id: item.id,
              scene_title: item.scene_title,
              prompt: item.image_prompt,
              ko_description: typeof item.image_ko_description === 'string' ? item.image_ko_description : '',
            });
          }

          if ('video_prompt' in item) {
            if (typeof item.video_prompt !== 'string') throw new Error(`항목 ${i + 1}: "video_prompt" 필드가 문자열이 아닙니다.`);
            vidPrompts.push({
              id: item.id,
              scene_title: item.scene_title,
              prompt: item.video_prompt,
              ko_description: typeof item.video_ko_description === 'string' ? item.video_ko_description : '',
            });
          }
        }

        if (imgPrompts.length > 0) setImagePrompts(imgPrompts);
        if (vidPrompts.length > 0) setVideoPrompts(vidPrompts);
        setStage2SubPage('image');
      } else {
        // Legacy single format validation
        for (let i = 0; i < json.length; i++) {
          const item = json[i];
          if (typeof item.id !== 'number') throw new Error(`항목 ${i + 1}: "id" 필드가 누락되었거나 숫자가 아닙니다.`);
          if (typeof item.scene_title !== 'string') throw new Error(`항목 ${i + 1}: "scene_title" 필드가 누락되었습니다.`);
          if (typeof item.prompt !== 'string') throw new Error(`항목 ${i + 1}: "prompt" 필드가 누락되었습니다.`);
          if (typeof item.ko_description !== 'string') throw new Error(`항목 ${i + 1}: "ko_description" 필드가 누락되었습니다.`);
        }

        if (stage2UploadTarget === 'image') {
          setImagePrompts(json);
          setStage2SubPage('image');
        } else {
          setVideoPrompts(json);
          setStage2SubPage('video');
        }
      }

      setIsStage2UploadOpen(false);
      setStage2UploadInput('');
      setIsSidebarOpen(false);
    } catch (e: any) {
      setStage2UploadError(e.message || 'JSON 파싱 오류가 발생했습니다.');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stage 2 state
  const [currentStage, setCurrentStage] = useState<Stage>('stage1');
  const [stage2SubPage, setStage2SubPage] = useState<Stage2SubPage>('image');
  const [imagePrompts, setImagePrompts] = useState<ScenePrompt[]>([]);
  const [videoPrompts, setVideoPrompts] = useState<ScenePrompt[]>([]);
  const [isStage2UploadOpen, setIsStage2UploadOpen] = useState(false);
  const [stage2UploadTarget, setStage2UploadTarget] = useState<Stage2SubPage>('image');
  const [stage2UploadInput, setStage2UploadInput] = useState('');
  const [stage2UploadError, setStage2UploadError] = useState<string | null>(null);

  // Load Stage2 data from localStorage
  useEffect(() => {
    try {
      const img = localStorage.getItem('imagePrompts');
      if (img) setImagePrompts(JSON.parse(img));
    } catch {}
    try {
      const vid = localStorage.getItem('videoPrompts');
      if (vid) setVideoPrompts(JSON.parse(vid));
    } catch {}
  }, []);

  useEffect(() => {
    if (imagePrompts.length > 0) {
      localStorage.setItem('imagePrompts', JSON.stringify(imagePrompts));
    } else {
      localStorage.removeItem('imagePrompts');
    }
  }, [imagePrompts]);

  useEffect(() => {
    if (videoPrompts.length > 0) {
      localStorage.setItem('videoPrompts', JSON.stringify(videoPrompts));
    } else {
      localStorage.removeItem('videoPrompts');
    }
  }, [videoPrompts]);

  // Tab accent colors for neobrutalism theme
  const tabColors = [
    { bg: 'rgb(var(--content3))', border: 'rgb(var(--foreground))', dot: 'rgb(var(--primary))', text: 'rgb(var(--foreground))' },
    { bg: 'rgb(var(--content4))', border: 'rgb(var(--foreground))', dot: 'rgb(var(--secondary))', text: 'rgb(var(--foreground))' },
    { bg: 'rgb(var(--content2))', border: 'rgb(var(--foreground))', dot: 'rgb(var(--warning))', text: 'rgb(var(--foreground))' },
    { bg: 'rgb(251 220 225)', border: 'rgb(var(--foreground))', dot: 'rgb(var(--danger))', text: 'rgb(var(--foreground))' },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      {/* Header */}
      <header className="neo-header h-14 md:h-16 flex items-center justify-between px-3 md:px-6 z-20 shrink-0 relative">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden neo-btn p-2 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </button>
          <a
            href="/"
            className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          >
            <img src="/logo.png" alt="TB Logo" className="w-7 h-7 md:w-8 md:h-8 rounded-lg border-2 border-foreground" />
            <h1 className="text-base md:text-xl font-black text-foreground tracking-tight uppercase">
              TB PROMPT CREATOR
            </h1>
          </a>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {currentStage === 'stage1' && (
           <button
             onClick={() => setIsUploadModalOpen(true)}
             className="neo-btn neo-btn-danger flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             title="JSON 템플릿 업로드"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">템플릿</span> 업로드
           </button>
          )}
          {currentStage === 'stage2' && (
           <button
             onClick={() => {
               setStage2UploadTarget(stage2SubPage);
               setStage2UploadError(null);
               setStage2UploadInput('');
               setIsStage2UploadOpen(true);
             }}
             className="neo-btn neo-btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             title="프롬프트 JSON 업로드"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">템플릿</span> 업로드
           </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-foreground/40 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT PANEL: Structure Tree */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-72 md:w-80 neo-sidebar flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-14 md:top-0 h-[calc(100vh-3.5rem)] md:h-auto
        `}>
          {/* Stage Tabs */}
          <div className="p-2 md:p-3 border-b-2 border-foreground/20 flex flex-col gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={() => setCurrentStage('stage1')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  currentStage === 'stage1'
                    ? 'bg-primary text-primary-foreground border-3 border-foreground shadow-neo-sm'
                    : 'text-foreground/60 hover:bg-content2 border-3 border-transparent'
                }`}
              >
                1단계
              </button>
              <button
                onClick={() => setCurrentStage('stage2')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                  currentStage === 'stage2'
                    ? 'bg-secondary text-secondary-foreground border-3 border-foreground shadow-neo-sm'
                    : 'text-foreground/60 hover:bg-content2 border-3 border-transparent'
                }`}
              >
                2단계
              </button>
            </div>
            {currentStage !== 'frame-extractor' && currentStage !== 'bg-remover' && (
              <a
                href={currentStage === 'stage1'
                  ? "https://gemini.google.com/gem/13HOLZGAzOKloWSBnxejnMvWDOJHNvdyu?usp=sharing"
                  : "https://gemini.google.com/gem/1CdSxrlLl-Et1lUzFrBAUwVKhcwPJ4ZOl?usp=sharing"
                }
                target="_blank"
                rel="noreferrer"
                className={`neo-btn flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold ${
                  currentStage === 'stage1'
                    ? 'neo-btn-primary'
                    : 'neo-btn-secondary'
                }`}
              >
                <span>{currentStage === 'stage1' ? '1단계' : '2단계'} 젬 가이드 열기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Stage 1 Sidebar Content */}
          {currentStage === 'stage1' && (
            <>
              <div className="p-3 md:p-4 border-b-2 border-foreground/20">
                <h2 className="font-black text-base text-foreground flex items-center gap-2 uppercase">
                  <Layers className="w-5 h-5 text-secondary" />
                  구조 (Structure)
                  <div className="w-2 h-2 rounded-full bg-primary ml-auto" />
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
                {(template.prompt_sections || []).map((section, idx) => (
                  <div key={section.section_id} className="neo-card-static rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(prev => prev === section.section_id ? null : section.section_id)}
                      className="w-full px-3 py-2.5 flex items-center gap-2 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors"
                      style={{ background: tabColors[idx % 4].bg }}
                    >
                      {expandedSection === section.section_id ? <ChevronDown className="w-4 h-4 text-foreground/70" /> : <ChevronRight className="w-4 h-4 text-foreground/70" />}
                      <span className="truncate flex-1 text-left">{section.section_label_ko || section.section_label || section.section_id}</span>
                      {(section.is_active !== false) && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                    </button>
                    {expandedSection === section.section_id && (
                      <div className="p-2 space-y-1 bg-foreground/5">
                        {(section.components || []).map((comp) => (
                          <div
                            key={comp.component_id}
                            onClick={() => {
                              setActiveTab(idx);
                              setTimeout(() => {
                                const el = document.getElementById(`comp-${comp.component_id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  el.classList.add('ring-2', 'ring-primary/50');
                                  setTimeout(() => el.classList.remove('ring-2', 'ring-primary/50'), 2000);
                                }
                              }, 50);
                              setIsSidebarOpen(false);
                            }}
                            className="pl-2 flex items-center gap-2 text-sm text-foreground/70 py-1.5 md:py-1 hover:bg-foreground/5 hover:text-foreground rounded-lg cursor-pointer transition-colors font-medium"
                          >
                            <Box className="w-3 h-3 text-secondary/70" />
                            <span className="truncate">{comp.component_label_ko || comp.component_label || comp.component_id}</span>
                            {(comp.is_active !== false) && <Check className="w-3 h-3 text-primary/70 ml-auto mr-1" />}
                          </div>
                        ))}
                        {(!section.components || section.components.length === 0) && (
                           <div className="pl-2 text-xs text-foreground/50 italic py-1">하위 요소 없음</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {(!template.prompt_sections || template.prompt_sections.length === 0) && (
                  <div className="text-center py-10 px-4 text-foreground/60 text-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center neo-card-static">
                      <FileJson className="w-8 h-8 text-foreground/60" />
                    </div>
                    <p className="font-medium">로드된 템플릿이 없습니다.</p>
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(true);
                      }}
                      className="mt-3 neo-btn neo-btn-primary px-4 py-2 rounded-lg flex items-center justify-center gap-1 mx-auto text-sm"
                    >
                      <Play className="w-3 h-3" />
                      JSON 업로드 시작
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Stage 2 Sidebar Content */}
          {currentStage === 'stage2' && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
              {/* Image / Video sub-page buttons */}
              <button
                onClick={() => setStage2SubPage('image')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  stage2SubPage === 'image'
                    ? 'text-foreground bg-content4 border-3 border-foreground shadow-neo-sm'
                    : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 border-3 border-transparent'
                }`}
              >
                <ImageIcon className="w-5 h-5 text-secondary" />
                <span className="flex-1 text-left">이미지 프롬프트</span>
                {imagePrompts.length > 0 && (
                  <span className="memphis-badge-secondary text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {imagePrompts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setStage2SubPage('video')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                  stage2SubPage === 'video'
                    ? 'text-foreground bg-danger/10 border-3 border-foreground shadow-neo-sm'
                    : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 border-3 border-transparent'
                }`}
              >
                <Film className="w-5 h-5 text-danger" />
                <span className="flex-1 text-left">영상 프롬프트</span>
                {videoPrompts.length > 0 && (
                  <span className="memphis-badge-danger text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {videoPrompts.length}
                  </span>
                )}
              </button>

            </div>
          )}

          {/* Frame Extractor Sidebar Content */}
          {currentStage === 'frame-extractor' && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-warning" />
                  <h3 className="text-sm font-black text-foreground uppercase">사용 방법</h3>
                </div>
                <div className="space-y-2 text-xs text-foreground/70">
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1</span>
                    <span>동영상 파일을 드래그하거나 선택하여 업로드</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">2</span>
                    <span>추출 간격(초)을 설정</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">3</span>
                    <span>"프레임 추출 시작" 버튼 클릭</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">4</span>
                    <span>개별 또는 전체 다운로드</span>
                  </div>
                </div>
              </div>
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground/80 uppercase">특징</h4>
                <ul className="space-y-1 text-xs text-foreground/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    PNG 무손실 출력
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    기본 2배 업스케일링
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    마지막 프레임 자동 포함
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    추가 설치 없음
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Background Remover Sidebar Content */}
          {currentStage === 'bg-remover' && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Eraser className="w-5 h-5 text-danger" />
                  <h3 className="text-sm font-black text-foreground uppercase">사용 방법</h3>
                </div>
                <div className="space-y-2 text-xs text-foreground/70">
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-danger text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1</span>
                    <span>이미지를 업로드하면 AI가 자동으로 배경을 제거합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-danger text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">2</span>
                    <span>배경 색상/이미지 교체 가능</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-danger text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">3</span>
                    <span>PNG/WebP 형식으로 다운로드</span>
                  </div>
                </div>
              </div>
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground/80 uppercase">특징</h4>
                <ul className="space-y-1 text-xs text-foreground/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    AI 기반 자동 배경 제거
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    Before/After 비교 슬라이더
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    배경 교체 (투명/단색/이미지)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    추가 설치 없음 (브라우저 내 처리)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SIDEBAR FOOTER: External Tools */}
          <div className="p-3 md:p-4 border-t-2 border-foreground/20 space-y-2">
            <button
              onClick={() => setCurrentStage('frame-extractor')}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 text-base font-medium rounded-lg ${
                currentStage === 'frame-extractor'
                  ? 'neo-btn neo-btn-warning'
                  : 'neo-btn'
              }`}
            >
              <Scissors className="w-4 h-4" />
              프레임추출기
            </button>
            <button
              onClick={() => setCurrentStage('bg-remover')}
              className={`flex items-center justify-center gap-2 w-full px-4 py-3.5 text-base font-medium rounded-lg ${
                currentStage === 'bg-remover'
                  ? 'neo-btn neo-btn-danger'
                  : 'neo-btn'
              }`}
            >
              <Eraser className="w-4 h-4" />
              배경지우기
            </button>
            <a
              href="https://translate.google.co.kr/"
              target="_blank"
              rel="noreferrer"
              className="neo-btn neo-btn-secondary flex items-center justify-center gap-2 w-full px-4 py-3.5 text-base font-medium rounded-lg"
              title="새 탭에서 구글 번역기 열기"
            >
              <ExternalLink className="w-4 h-4" />
              Google 번역기 열기
            </a>
          </div>
        </aside>

        {/* RIGHT PANEL: Editor & Output */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {currentStage === 'bg-remover' ? (
          /* Background Remover */
          <BackgroundRemoverContent />
          ) : currentStage === 'frame-extractor' ? (
          /* Frame Extractor */
          <FrameExtractorContent />
          ) : currentStage === 'stage1' ? (
          /* Stage 1: Prompt Editor */
          <div className="flex-1 p-3 md:p-6 flex flex-col min-h-0 relative gap-4">
            {/* color_palette 정보 패널 */}
            {template.color_palette && (template.color_palette.primary || template.color_palette.secondary || template.color_palette.accent) && (
              <div className="shrink-0 neo-card-static rounded-xl p-3 md:p-4">
                <div className="flex flex-wrap gap-3 md:gap-4 items-start">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm bg-danger/10 border-2 border-foreground">
                    <Palette className="w-3.5 h-3.5 text-danger" />
                    <span className="text-foreground/60 font-bold">컬러 팔레트</span>
                    <div className="flex items-center gap-1.5">
                      {template.color_palette.primary && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/10 border border-foreground/20" title="Primary">
                          {template.color_palette.primary}
                        </span>
                      )}
                      {template.color_palette.secondary && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/10 border border-foreground/20" title="Secondary">
                          {template.color_palette.secondary}
                        </span>
                      )}
                      {template.color_palette.accent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-foreground/10 border border-foreground/20" title="Accent">
                          {template.color_palette.accent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 최종 프롬프트 영역 */}
            <div className="shrink-0 neo-card-static rounded-xl p-3 md:p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-foreground/20">
                <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2 uppercase">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  최종 프롬프트
                </h3>
                <button
                  onClick={() => copyToClipboard(promptString)}
                  className="neo-btn text-sm font-medium flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" /> 복사
                </button>
              </div>
              <textarea
                value={promptString}
                readOnly
                className="memphis-input w-full h-28 md:h-36 p-3 md:p-4 font-mono text-xs md:text-sm resize-none leading-relaxed rounded-xl overflow-hidden"
                spellCheck={false}
                placeholder="생성된 프롬프트가 없습니다..."
              />
            </div>

            {/* 시각적 편집 영역 - 탭 UI */}
            <div className="flex-1 neo-card-static rounded-xl overflow-hidden min-h-0 flex flex-col">
              {/* 탭 바 */}
              <div className="shrink-0 flex gap-1.5 md:gap-2 p-2 md:p-3 bg-content2 border-b-3 border-foreground overflow-x-auto">
                {(template.prompt_sections || []).map((section, sectionIdx) => {
                  const tc = tabColors[sectionIdx % 4];
                  const isActive = activeTab === sectionIdx;
                  const tabCount = (template.prompt_sections || []).length;
                  return (
                    <button
                      key={section.section_id}
                      onClick={() => setActiveTab(sectionIdx)}
                      className={`relative px-2.5 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 rounded-lg shrink-0 ${
                        tabCount <= 5 ? 'flex-1' : ''
                      } ${isActive
                        ? 'border-3 border-foreground shadow-neo-sm'
                        : 'border-3 border-transparent hover:bg-foreground/5'
                      }`}
                      style={{
                        background: isActive ? tc.bg : 'transparent',
                        color: tc.text,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0 transition-all"
                        style={{
                          backgroundColor: tc.dot,
                          opacity: isActive ? 1 : 0.3,
                        }}
                      />
                      <span>{section.section_label_ko || section.section_label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 탭 콘텐츠 */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                {(template.prompt_sections || []).map((section, sectionIdx) => {
                  if (sectionIdx !== activeTab) return null;
                  const tc = tabColors[sectionIdx % 4];
                  return (
                    <div key={section.section_id} className="space-y-3 md:space-y-4 p-3 md:p-5 rounded-xl" style={{ background: tc.bg }}>
                      <div className="flex flex-col gap-4 md:gap-6">
                        {(section.components || []).map((comp) => (
                          <div key={comp.component_id} id={`comp-${comp.component_id}`} className="space-y-2 md:space-y-3 transition-all duration-300 rounded-lg">
                             <div className="text-xs font-medium text-foreground/80 flex items-center gap-2 px-1">
                                <Box className="w-3 h-3 text-secondary/70" />
                                {comp.component_label_ko || comp.component_label}
                             </div>

                             <div className="grid grid-cols-1 gap-3 md:gap-4">
                               {(comp.attributes || []).map((attr) => (
                                 <div key={attr.attr_id} className="neo-card-static p-3 md:p-4 rounded-xl flex flex-col gap-2 md:gap-3">
                                   {/* Attribute Header */}
                                   <div className="flex items-center justify-between gap-2">
                                     <div className="flex items-center gap-2">
                                       <label className="text-sm md:text-base font-medium text-foreground flex items-center gap-2 truncate">
                                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tc.dot }} />
                                         {attr.label_ko || attr.label}
                                         {attr.is_locked && (
                                           <span className="memphis-badge-warning flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                             <Lock className="w-2.5 h-2.5" />
                                             고정
                                           </span>
                                         )}
                                         {(attr.is_active === false) && <span className="text-[10px] text-danger font-medium">(Inactive)</span>}
                                       </label>
                                       <CopyButton value={getDisplayValue(attr, attr.value)} />
                                     </div>
                                     <div className="flex items-center gap-1 shrink-0">
                                       <PasteButton onPaste={(text) => updateAttributeValue(section.section_id, comp.component_id, attr.attr_id, text)} />
                                       <CopyButton value={Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value)} />
                                     </div>
                                   </div>

                                   {/* Split Layout */}
                                   <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch">
                                     {/* Left: Current Value */}
                                     <div className="w-full md:w-[40%]">
                                       <div
                                         className="text-sm md:text-base text-foreground break-words leading-relaxed p-3 rounded-lg font-medium h-full border-2 border-foreground"
                                         style={{ background: tc.bg }}
                                         title={String(attr.value)}
                                       >
                                         {getDisplayValue(attr, attr.value)}
                                       </div>
                                     </div>

                                     {/* Right: Edit Field */}
                                     <div className="flex-1 min-w-0">
                                       <input
                                         list={attr.options ? `datalist-${attr.attr_id}` : undefined}
                                         type="text"
                                         placeholder="영문 값 입력..."
                                         className="memphis-input w-full h-full text-sm md:text-base p-3 rounded-lg font-normal"
                                         value={Array.isArray(attr.value) ? attr.value.join(', ') : attr.value}
                                         onChange={(e) => updateAttributeValue(section.section_id, comp.component_id, attr.attr_id, e.target.value)}
                                       />

                                       {attr.options && (
                                         <datalist id={`datalist-${attr.attr_id}`}>
                                            {attr.options.map((opt: any) => {
                                              const val = typeof opt === 'string' ? opt : opt.value;
                                              const label = typeof opt === 'string' ? opt : (opt.label_ko || opt.label);
                                              return <option key={val} value={val}>{label}</option>
                                            })}
                                         </datalist>
                                       )}
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
          ) : (
          /* Stage 2: Image/Video Prompt Viewer */
          <Stage2Content
            subPage={stage2SubPage}
            imagePrompts={imagePrompts}
            videoPrompts={videoPrompts}
            setImagePrompts={setImagePrompts}
            setVideoPrompts={setVideoPrompts}
            onUpload={() => {
              setStage2UploadTarget(stage2SubPage);
              setStage2UploadError(null);
              setStage2UploadInput('');
              setIsStage2UploadOpen(true);
            }}
          />
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="neo-card-static rounded-2xl max-w-2xl w-full flex flex-col h-[90vh] md:h-[80vh] animate-scale-in">
            <div className="p-3 md:p-5 border-b-3 border-foreground flex items-center justify-between shrink-0">
              <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2 uppercase">
                <FileJson className="w-5 h-5 text-secondary" />
                JSON 템플릿 불러오기
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="neo-btn neo-btn-danger p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
              {uploadError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm shrink-0 bg-danger/10 border-2 border-foreground">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-danger">오류 발생</p>
                    <p className="text-foreground/80">{uploadError}</p>
                  </div>
                </div>
              )}

              <textarea
                value={uploadInput}
                onChange={(e) => setUploadInput(e.target.value)}
                placeholder='{"meta_data": ..., "prompt_sections": ...}'
                className="memphis-input flex-1 w-full p-3 md:p-4 font-mono text-xs rounded-xl resize-none"
              />
            </div>

            <div className="p-3 md:p-5 border-t-3 border-foreground flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="neo-btn px-3 md:px-4 py-2 text-sm font-medium rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadInput.trim() || isUploadLoading}
                className="neo-btn neo-btn-primary px-4 md:px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-30"
              >
                {isUploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">템플릿</span> 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage2 Upload Modal */}
      {isStage2UploadOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="neo-card-static rounded-2xl max-w-2xl w-full flex flex-col h-[90vh] md:h-[80vh] animate-scale-in">
            <div className="p-3 md:p-5 border-b-3 border-foreground flex items-center justify-between shrink-0">
              <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2 uppercase">
                <Upload className="w-5 h-5 text-secondary" />
                프롬프트 JSON 불러오기
              </h3>
              <button
                onClick={() => setIsStage2UploadOpen(false)}
                className="neo-btn neo-btn-danger p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
              {stage2UploadError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm shrink-0 bg-danger/10 border-2 border-foreground">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-danger shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-danger">오류 발생</p>
                    <p className="text-foreground/80">{stage2UploadError}</p>
                  </div>
                </div>
              )}

              <div className="mb-3 p-2.5 rounded-lg text-xs text-foreground/60 shrink-0 bg-content4 border-2 border-foreground/20 space-y-1">
                <p className="font-bold text-foreground/80">통합 형식 (이미지+영상 동시):</p>
                <p>[{"{"} "id": 1, "scene_title": "...", "image_prompt": "...", "image_ko_description": "...", "video_prompt": "...", "video_ko_description": "..." {"}"}]</p>
                <p className="font-bold text-foreground/80 mt-1">개별 형식 ({stage2UploadTarget === 'image' ? '이미지' : '영상'} 전용):</p>
                <p>[{"{"} "id": 1, "scene_title": "...", "prompt": "...", "ko_description": "..." {"}"}]</p>
              </div>

              <textarea
                value={stage2UploadInput}
                onChange={(e) => setStage2UploadInput(e.target.value)}
                placeholder='[{"id": 1, "scene_title": "...", "image_prompt": "...", "image_ko_description": "...", "video_prompt": "...", "video_ko_description": "..."}]'
                className="memphis-input flex-1 w-full p-3 md:p-4 font-mono text-xs rounded-xl resize-none"
              />
            </div>

            <div className="p-3 md:p-5 border-t-3 border-foreground flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsStage2UploadOpen(false)}
                className="neo-btn px-3 md:px-4 py-2 text-sm font-medium rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleStage2Upload}
                disabled={!stage2UploadInput.trim()}
                className="neo-btn neo-btn-primary px-4 md:px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-30"
              >
                <Upload className="w-4 h-4" />
                적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Info Modal */}
      {isApiInfoOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="neo-card-static rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-3 md:p-5 border-b-3 border-foreground flex items-center justify-between sticky top-0 bg-content1 z-10 rounded-t-2xl">
              <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2 uppercase">
                <Cpu className="w-5 h-5 text-secondary" />
                API 연결 정보
              </h3>
              <button
                onClick={() => setIsApiInfoOpen(false)}
                className="neo-btn p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm text-foreground/70 font-medium">현재 사용 중인 모델:</p>
                <div className="flex items-center gap-2 font-mono text-sm px-3 py-2 rounded-xl bg-content3 border-2 border-foreground">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary">gemini-2.5-flash</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-2 border-foreground/20">
                <p className="text-xs md:text-sm text-foreground/70 font-medium">기능별 사용:</p>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li className="flex items-start gap-2 p-2 rounded-lg bg-content3">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground">AI 퀵 번역기</span>
                      <p className="text-xs text-foreground/60 mt-0.5">한글↔영문 텍스트 즉시 번역</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 p-2 rounded-lg bg-content4">
                    <ShieldCheck className="w-4 h-4 text-foreground/50 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-foreground/80">템플릿 업로드 (Parse Only)</span>
                      <p className="text-xs text-foreground/60 mt-0.5">API 미사용, JSON 파싱만 수행</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* API Key Input Section */}
              <div className="space-y-2 pt-4 border-t-2 border-foreground/20">
                 <label className="text-xs md:text-sm font-medium text-foreground/90 flex items-center gap-2">
                   <KeyRound className="w-4 h-4 text-danger" />
                   Custom API Key
                 </label>
                 <div className="relative">
                   <input
                     type="password"
                     value={userApiKey}
                     onChange={(e) => setUserApiKey(e.target.value)}
                     placeholder="Gemini API Key 입력..."
                     className="memphis-input w-full p-2.5 rounded-lg text-sm font-mono"
                   />
                 </div>
                 <p className="text-xs text-foreground/60">
                   미입력시 기본 키 사용
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
