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
  Film
} from 'lucide-react';

// --- Types based on PRD Schema v2.0 ---

interface MetaData {
  template_name: string;
  template_id: string;
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

interface Attribute {
  attr_id: string;
  label: string;
  label_ko?: string;
  type: string;
  value: any;
  value_ko?: string;
  options?: string[] | { value: string; label: string; label_ko?: string }[];
  is_active: boolean;
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
  color_palette?: any;
}

interface ScenePrompt {
  id: number;
  scene_title: string;
  prompt: string;
  ko_description: string;
}

type Stage = 'stage1' | 'stage2';
type Stage2SubPage = 'image' | 'video';

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
      className="glass-btn px-2 py-1 flex items-center gap-1.5 rounded-lg"
      title="값 복사"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-emerald-400 font-medium">복사됨</span>
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
      className="glass-btn glass-btn-pink px-2 py-1 flex items-center gap-1.5 rounded-lg"
      title="클립보드 붙여넣기"
    >
      <ClipboardPaste className="w-3.5 h-3.5" />
      <span className="text-[10px]">붙여넣기</span>
    </button>
  );
};

// Aurora Decorative Orbs
const AuroraOrbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div
      className="aurora-orb w-[500px] h-[500px] top-[-10%] left-[10%]"
      style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)', animationDelay: '0s', animationDuration: '10s' }}
    />
    <div
      className="aurora-orb w-[400px] h-[400px] top-[20%] right-[-5%]"
      style={{ background: 'radial-gradient(circle, rgba(0,212,170,0.25) 0%, transparent 70%)', animationDelay: '2s', animationDuration: '12s' }}
    />
    <div
      className="aurora-orb w-[350px] h-[350px] bottom-[5%] left-[30%]"
      style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.2) 0%, transparent 70%)', animationDelay: '4s', animationDuration: '14s' }}
    />
    <div
      className="aurora-orb w-[300px] h-[300px] bottom-[20%] right-[20%]"
      style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)', animationDelay: '1s', animationDuration: '11s' }}
    />
  </div>
);


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
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center glass-card">
            <IconComp className="w-10 h-10 text-white/50" />
          </div>
          <p className="text-lg font-medium text-white/70 mb-2">{label} 프롬프트가 없습니다</p>
          <p className="text-sm text-white/50 mb-5">JSON 데이터를 업로드하여 씬 프롬프트를 확인하세요.</p>
          <button
            onClick={onUpload}
            className="glass-btn glass-btn-teal px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto text-sm font-medium"
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
      <div className="shrink-0 glass-card rounded-xl p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComp className="w-5 h-5 text-purple-400" />
            <h3 className="text-base md:text-lg font-medium text-white">{label} 프롬프트</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,212,170,0.15)', color: '#a7f3d0' }}>
              {prompts.length}개 씬
            </span>
          </div>
          <button
            onClick={() => copyText(allPromptsText)}
            className="glass-btn text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-lg"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAll ? '복사됨' : '전체 복사'}
          </button>
        </div>
      </div>

      {/* Scene Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4">
        {prompts.map((scene) => (
          <div key={scene.id} className="glass-card rounded-xl overflow-hidden">
            {/* Card Header */}
            <div className="px-3 md:px-4 py-2.5 md:py-3 border-b border-white/10 flex items-center justify-between" style={{ background: 'rgba(139,92,246,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(139,92,246,0.25)', color: '#e9e0ff' }}>
                  #{scene.id}
                </span>
                <span className="text-sm md:text-base font-medium text-white">{scene.scene_title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => pasteToPrompt(scene.id)}
                  className="glass-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  붙여넣기
                </button>
                <button
                  onClick={() => copyText(scene.prompt, scene.id)}
                  className="glass-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                >
                  {copiedId === scene.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === scene.id ? '복사됨' : '복사'}
                </button>
              </div>
            </div>

            {/* Card Body - Split View */}
            <div className="flex flex-col md:flex-row">
              {/* Left: Korean Description */}
              <div className="w-full md:w-1/2 p-3 md:p-4 md:border-r border-b md:border-b-0 border-white/10">
                <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">한국어 설명</div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{scene.ko_description}</p>
              </div>

              {/* Right: English Prompt */}
              <div className="w-full md:w-1/2 p-3 md:p-4" style={{ background: 'rgba(0,0,0,0.15)' }}>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">English Prompt</div>
                <textarea
                  value={scene.prompt}
                  onChange={(e) => updatePrompt(scene.id, e.target.value)}
                  className="w-full text-sm text-emerald-200/90 leading-relaxed font-mono whitespace-pre-wrap bg-transparent border border-white/10 rounded-lg p-2 resize-y min-h-[60px] focus:outline-none focus:border-purple-500/50 transition-colors"
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

  // Tab accent colors for glass theme
  const tabColors = [
    { bg: 'rgba(0,212,170,0.10)', border: 'rgba(0,212,170,0.3)', dot: '#00d4aa', text: '#a7f3d0' },
    { bg: 'rgba(244,114,182,0.10)', border: 'rgba(244,114,182,0.3)', dot: '#f472b6', text: '#fce7f3' },
    { bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.3)', dot: '#8b5cf6', text: '#e9e0ff' },
    { bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.3)', dot: '#60a5fa', text: '#dbeafe' },
  ];

  return (
    <div className="flex flex-col h-full aurora-bg text-white overflow-hidden relative">
      <AuroraOrbs />

      {/* Header */}
      <header className="glass-header h-14 md:h-16 flex items-center justify-between px-3 md:px-6 z-20 shrink-0 relative">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden glass-btn p-2 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </button>
          <a
            href="/"
            className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          >
            <img src="/logo.png" alt="TB Logo" className="w-7 h-7 md:w-8 md:h-8 rounded-lg border border-white/20" />
            <h1 className="text-base md:text-xl font-semibold text-white tracking-tight glow-teal">
              TB PROMPT CREATOR
            </h1>
          </a>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {currentStage === 'stage1' && (
           <button
             onClick={() => setIsUploadModalOpen(true)}
             className="glass-btn glass-btn-pink flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             title="JSON 템플릿 업로드"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">템플릿</span> 업로드
           </button>
          )}
          {currentStage === 'stage2' && stage2SubPage === 'image' && (
           <button
             onClick={() => {
               setStage2UploadTarget('image');
               setStage2UploadError(null);
               setStage2UploadInput('');
               setIsStage2UploadOpen(true);
             }}
             className="glass-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             style={{ background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)', color: '#93c5fd' }}
             title="이미지 JSON 업로드"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">템플릿업로드(이미지)</span>
           </button>
          )}
          {currentStage === 'stage2' && stage2SubPage === 'video' && (
           <button
             onClick={() => {
               setStage2UploadTarget('video');
               setStage2UploadError(null);
               setStage2UploadInput('');
               setIsStage2UploadOpen(true);
             }}
             className="glass-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             style={{ background: 'rgba(244,114,182,0.15)', border: '1px solid rgba(244,114,182,0.3)', color: '#f9a8d4' }}
             title="영상 JSON 업로드"
           >
             <Upload className="w-4 h-4" />
             <span className="hidden sm:inline">템플릿업로드(영상)</span>
           </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT PANEL: Structure Tree */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-72 md:w-80 glass-sidebar flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-14 md:top-0 h-[calc(100vh-3.5rem)] md:h-auto
        `}>
          {/* 프롬프트 만들기 버튼 */}
          <div className="p-3 md:p-4 border-b border-white/10 flex gap-2">
            <a
              href="https://gemini.google.com/gem/13HOLZGAzOKloWSBnxejnMvWDOJHNvdyu?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-2 flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 glass-btn-teal glass-btn"
            >
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
              <span className="text-sm">1단계</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <a
              href="https://gemini.google.com/gem/1IX4r2QFHFYEb7YkAtv-UcsRxVioJqIXr?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-2 flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 glass-btn-purple glass-btn"
            >
              <Film className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm">2단계</span>
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          </div>

          {/* Stage Tabs */}
          <div className="p-2 md:p-3 border-b border-white/10 flex gap-1.5">
            <button
              onClick={() => setCurrentStage('stage1')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                currentStage === 'stage1'
                  ? 'glass-btn-teal text-emerald-200'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
              style={currentStage === 'stage1' ? { background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)' } : {}}
            >
              1단계 편집
            </button>
            <button
              onClick={() => setCurrentStage('stage2')}
              className={`flex-1 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                currentStage === 'stage2'
                  ? 'text-purple-200'
                  : 'text-white/50 hover:text-white/70 hover:bg-white/5'
              }`}
              style={currentStage === 'stage2' ? { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' } : {}}
            >
              2단계 뷰어
            </button>
          </div>

          {/* Stage 1 Sidebar Content */}
          {currentStage === 'stage1' && (
            <>
              <div className="p-3 md:p-4 border-b border-white/10">
                <h2 className="font-medium text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  구조 (Structure)
                  <div className="w-2 h-2 rounded-full bg-emerald-400 ml-auto" />
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
                {(template.prompt_sections || []).map((section, idx) => (
                  <div key={section.section_id} className="glass-card rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(prev => prev === section.section_id ? null : section.section_id)}
                      className="w-full px-3 py-2.5 flex items-center gap-2 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                      style={{ background: tabColors[idx % 4].bg }}
                    >
                      {expandedSection === section.section_id ? <ChevronDown className="w-4 h-4 text-white/70" /> : <ChevronRight className="w-4 h-4 text-white/70" />}
                      <span className="truncate flex-1 text-left">{section.section_label_ko || section.section_label || section.section_id}</span>
                      {(section.is_active !== false) && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />}
                    </button>
                    {expandedSection === section.section_id && (
                      <div className="p-2 space-y-1 bg-black/20">
                        {(section.components || []).map((comp) => (
                          <div
                            key={comp.component_id}
                            onClick={() => {
                              setActiveTab(idx);
                              setTimeout(() => {
                                const el = document.getElementById(`comp-${comp.component_id}`);
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  el.classList.add('ring-2', 'ring-purple-400/50');
                                  setTimeout(() => el.classList.remove('ring-2', 'ring-purple-400/50'), 2000);
                                }
                              }, 50);
                              setIsSidebarOpen(false);
                            }}
                            className="pl-2 flex items-center gap-2 text-sm text-white/70 py-1.5 md:py-1 hover:bg-white/5 hover:text-white rounded-lg cursor-pointer transition-colors font-normal"
                          >
                            <Box className="w-3 h-3 text-purple-400/70" />
                            <span className="truncate">{comp.component_label_ko || comp.component_label || comp.component_id}</span>
                            {(comp.is_active !== false) && <Check className="w-3 h-3 text-emerald-400/70 ml-auto mr-1" />}
                          </div>
                        ))}
                        {(!section.components || section.components.length === 0) && (
                           <div className="pl-2 text-xs text-white/50 italic py-1">하위 요소 없음</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {(!template.prompt_sections || template.prompt_sections.length === 0) && (
                  <div className="text-center py-10 px-4 text-white/60 text-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center glass-card">
                      <FileJson className="w-8 h-8 text-white/60" />
                    </div>
                    <p className="font-medium">로드된 템플릿이 없습니다.</p>
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(true);
                      }}
                      className="mt-3 glass-btn glass-btn-teal px-4 py-2 rounded-lg flex items-center justify-center gap-1 mx-auto text-sm"
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
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  stage2SubPage === 'image' ? 'text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
                style={stage2SubPage === 'image' ? { background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)' } : {}}
              >
                <ImageIcon className="w-5 h-5 text-blue-400" />
                <span className="flex-1 text-left">이미지 프롬프트</span>
                {imagePrompts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(96,165,250,0.25)', color: '#93c5fd' }}>
                    {imagePrompts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setStage2SubPage('video')}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  stage2SubPage === 'video' ? 'text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
                style={stage2SubPage === 'video' ? { background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.3)' } : {}}
              >
                <Film className="w-5 h-5 text-pink-400" />
                <span className="flex-1 text-left">영상 프롬프트</span>
                {videoPrompts.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'rgba(244,114,182,0.25)', color: '#f9a8d4' }}>
                    {videoPrompts.length}
                  </span>
                )}
              </button>

            </div>
          )}

          {/* SIDEBAR FOOTER: External Tools */}
          <div className="p-3 md:p-4 border-t border-white/10">
            <a
              href="https://translate.google.co.kr/"
              target="_blank"
              rel="noreferrer"
              className="glass-btn glass-btn-purple flex items-center justify-center gap-2 w-full px-4 py-3.5 text-base font-medium rounded-lg"
              title="새 탭에서 구글 번역기 열기"
            >
              <ExternalLink className="w-4 h-4" />
              Google 번역기 열기
            </a>
          </div>
        </aside>

        {/* RIGHT PANEL: Editor & Output */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {currentStage === 'stage1' ? (
          /* Stage 1: Prompt Editor */
          <div className="flex-1 p-3 md:p-6 flex flex-col min-h-0 relative gap-4">
            {/* 최종 프롬프트 영역 */}
            <div className="shrink-0 glass-card rounded-xl p-3 md:p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  최종 프롬프트
                </h3>
                <button
                  onClick={() => copyToClipboard(promptString)}
                  className="glass-btn text-sm font-medium flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5" /> 복사
                </button>
              </div>
              <textarea
                value={promptString}
                readOnly
                className="w-full h-28 md:h-36 p-3 md:p-4 bg-black/40 font-mono text-xs md:text-sm text-white resize-none outline-none leading-relaxed border border-white/15 rounded-xl overflow-hidden"
                spellCheck={false}
                placeholder="생성된 프롬프트가 없습니다..."
              />
            </div>

            {/* 시각적 편집 영역 - 탭 UI */}
            <div className="flex-1 glass-card rounded-xl overflow-hidden min-h-0 flex flex-col">
              {/* 탭 바 */}
              <div className="shrink-0 flex gap-1.5 md:gap-2 p-2 md:p-3 bg-black/20 border-b border-white/10 overflow-x-auto">
                {(template.prompt_sections || []).map((section, sectionIdx) => {
                  const tc = tabColors[sectionIdx % 4];
                  const isActive = activeTab === sectionIdx;
                  const tabCount = (template.prompt_sections || []).length;
                  return (
                    <button
                      key={section.section_id}
                      onClick={() => setActiveTab(sectionIdx)}
                      className={`relative px-2.5 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-2 rounded-lg shrink-0 ${
                        tabCount <= 5 ? 'flex-1' : ''
                      }`}
                      style={{
                        background: isActive ? tc.bg : 'transparent',
                        borderWidth: '1px',
                        borderColor: isActive ? tc.border : 'rgba(255,255,255,0.06)',
                        color: isActive ? tc.text : 'rgba(255,255,255,0.6)',
                        boxShadow: isActive ? `0 0 16px ${tc.bg}` : 'none',
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
                             <div className="text-xs font-medium text-white/80 flex items-center gap-2 px-1">
                                <Box className="w-3 h-3 text-purple-400/70" />
                                {comp.component_label_ko || comp.component_label}
                             </div>

                             <div className="grid grid-cols-1 gap-3 md:gap-4">
                               {(comp.attributes || []).map((attr) => (
                                 <div key={attr.attr_id} className="glass-card p-3 md:p-4 rounded-xl flex flex-col gap-2 md:gap-3">
                                   {/* Attribute Header */}
                                   <div className="flex items-center justify-between gap-2">
                                     <div className="flex items-center gap-2">
                                       <label className="text-sm md:text-base font-medium text-white flex items-center gap-2 truncate">
                                         <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tc.dot }} />
                                         {attr.label_ko || attr.label}
                                         {(attr.is_active === false) && <span className="text-[10px] text-pink-400 font-medium">(Inactive)</span>}
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
                                         className="text-sm md:text-base text-white break-words leading-relaxed p-3 rounded-lg font-normal h-full"
                                         style={{ background: tc.bg, border: `1px solid ${tc.border}` }}
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
                                         className="glass-input w-full h-full text-sm md:text-base p-3 rounded-lg font-normal"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="glass-card bg-[#0d0d24]/90 rounded-2xl max-w-2xl w-full flex flex-col h-[90vh] md:h-[80vh] border border-white/15">
            <div className="p-3 md:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                <FileJson className="w-5 h-5 text-purple-400" />
                JSON 템플릿 불러오기
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="glass-btn glass-btn-pink p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
              {uploadError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm shrink-0"
                  style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.3)' }}
                >
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-pink-300">오류 발생</p>
                    <p className="text-white/80">{uploadError}</p>
                  </div>
                </div>
              )}

              <textarea
                value={uploadInput}
                onChange={(e) => setUploadInput(e.target.value)}
                placeholder='{"meta_data": ..., "prompt_sections": ...}'
                className="glass-input flex-1 w-full p-3 md:p-4 font-mono text-xs rounded-xl resize-none"
              />
            </div>

            <div className="p-3 md:p-5 border-t border-white/10 flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="glass-btn px-3 md:px-4 py-2 text-sm font-medium rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadInput.trim() || isUploadLoading}
                className="glass-btn glass-btn-teal px-4 md:px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-30"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="glass-card bg-[#0d0d24]/90 rounded-2xl max-w-2xl w-full flex flex-col h-[90vh] md:h-[80vh] border border-white/15">
            <div className="p-3 md:p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                {stage2UploadTarget === 'image' ? <ImageIcon className="w-5 h-5 text-blue-400" /> : <Film className="w-5 h-5 text-pink-400" />}
                {stage2UploadTarget === 'image' ? '이미지' : '영상'} 프롬프트 JSON 불러오기
              </h3>
              <button
                onClick={() => setIsStage2UploadOpen(false)}
                className="glass-btn glass-btn-pink p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
              {stage2UploadError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 rounded-xl flex items-start gap-2 md:gap-3 text-xs md:text-sm shrink-0"
                  style={{ background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.3)' }}
                >
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-pink-300">오류 발생</p>
                    <p className="text-white/80">{stage2UploadError}</p>
                  </div>
                </div>
              )}

              <div className="mb-3 p-2.5 rounded-lg text-xs text-white/60 shrink-0" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                JSON 배열 형식: [{"{"} "id": 1, "scene_title": "...", "prompt": "...", "ko_description": "..." {"}"}]
              </div>

              <textarea
                value={stage2UploadInput}
                onChange={(e) => setStage2UploadInput(e.target.value)}
                placeholder='[{"id": 1, "scene_title": "...", "prompt": "...", "ko_description": "..."}]'
                className="glass-input flex-1 w-full p-3 md:p-4 font-mono text-xs rounded-xl resize-none"
              />
            </div>

            <div className="p-3 md:p-5 border-t border-white/10 flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsStage2UploadOpen(false)}
                className="glass-btn px-3 md:px-4 py-2 text-sm font-medium rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleStage2Upload}
                disabled={!stage2UploadInput.trim()}
                className="glass-btn glass-btn-teal px-4 md:px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-30"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-4">
          <div className="glass-card bg-[#0d0d24]/90 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/15">
            <div className="p-3 md:p-5 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0d0d24]/95 backdrop-blur-xl z-10 rounded-t-2xl">
              <h3 className="text-base md:text-lg font-medium text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                API 연결 정보
              </h3>
              <button
                onClick={() => setIsApiInfoOpen(false)}
                className="glass-btn p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm text-white/70 font-medium">현재 사용 중인 모델:</p>
                <div className="flex items-center gap-2 font-mono text-sm px-3 py-2 rounded-xl glass-card" style={{ background: 'rgba(0,212,170,0.08)', borderColor: 'rgba(0,212,170,0.25)' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">gemini-2.5-flash</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/10">
                <p className="text-xs md:text-sm text-white/70 font-medium">기능별 사용:</p>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(0,212,170,0.06)' }}>
                    <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-white">AI 퀵 번역기</span>
                      <p className="text-xs text-white/60 mt-0.5">한글↔영문 텍스트 즉시 번역</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.06)' }}>
                    <ShieldCheck className="w-4 h-4 text-white/50 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-white/80">템플릿 업로드 (Parse Only)</span>
                      <p className="text-xs text-white/60 mt-0.5">API 미사용, JSON 파싱만 수행</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* API Key Input Section */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                 <label className="text-xs md:text-sm font-medium text-white/90 flex items-center gap-2">
                   <KeyRound className="w-4 h-4 text-pink-400" />
                   Custom API Key
                 </label>
                 <div className="relative">
                   <input
                     type="password"
                     value={userApiKey}
                     onChange={(e) => setUserApiKey(e.target.value)}
                     placeholder="Gemini API Key 입력..."
                     className="glass-input w-full p-2.5 rounded-lg text-sm font-mono"
                   />
                 </div>
                 <p className="text-xs text-white/60">
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
