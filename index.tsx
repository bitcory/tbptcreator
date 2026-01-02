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
  Eraser,
  KeyRound,
  Circle,
  Triangle,
  Square
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
      className="memphis-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-[#1A1A2E]"
      title="값 복사"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#00D4AA]" />
          <span className="text-[10px] text-[#00D4AA] font-bold">복사됨</span>
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

const ClearButton = ({ onClear }: { onClear: () => void }) => {
  return (
    <button
      onClick={onClear}
      className="memphis-btn memphis-btn-pink px-2 py-1 flex items-center gap-1.5 rounded-lg"
      title="내용 지우기"
    >
      <Eraser className="w-3.5 h-3.5" />
      <span className="text-[10px]">지우기</span>
    </button>
  );
};

// Memphis Decorative Shapes
const MemphisShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 w-8 h-8 bg-[#FF6B9D] border-3 border-[#1A1A2E] rounded-full memphis-float" style={{ animationDelay: '0s' }} />
    <div className="absolute top-20 right-20 w-6 h-6 bg-[#FFE156] border-3 border-[#1A1A2E] rotate-45" style={{ animationDelay: '0.5s' }} />
    <div className="absolute bottom-32 left-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[26px] border-b-[#4ECDC4]" />
    <div className="absolute bottom-20 right-40 w-10 h-10 bg-[#9B5DE5] border-3 border-[#1A1A2E] rounded-full" style={{ animationDelay: '1s' }} />
  </div>
);


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
  const [activeTab, setActiveTab] = useState<'prompt' | 'preview'>('preview');

  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [transInput, setTransInput] = useState("");
  const [transOutput, setTransOutput] = useState("");
  const [isTransLoading, setIsTransLoading] = useState(false);

  useEffect(() => {
    const str = generatePromptString(template);
    setPromptString(str);
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

  const handleQuickTranslation = async () => {
    if (!transInput.trim()) return;
    setIsTransLoading(true);
    setTransOutput("");

    try {
      const apiKey = userApiKey || process.env.API_KEY || '';
      if (!apiKey) {
        alert("API 키를 입력해주세요. (우측 상단 버튼 클릭)");
        setIsTransLoading(false);
        return;
      }
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text. If it's Korean, translate to English. If it's English, translate to Korean. Only output the translated text.\n\nText: ${transInput}`
      });
      setTransOutput(response.text?.trim() || "Translation failed.");
    } catch (error) {
      console.error(error);
      setTransOutput("Error occurred during translation. Check API Key.");
    } finally {
      setIsTransLoading(false);
    }
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
      setActiveTab('preview');

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen memphis-bg text-[#1A1A2E] overflow-hidden selection:bg-[#FFE156]/50 relative">
      <MemphisShapes />

      {/* Header */}
      <header className="memphis-header h-14 md:h-16 flex items-center justify-between px-3 md:px-6 z-20 shrink-0 relative">
        {/* Decorative elements */}
        <div className="absolute top-2 left-1/4 w-4 h-4 bg-[#FF6B9D] border-2 border-[#1A1A2E] rounded-full" />
        <div className="absolute bottom-2 right-1/3 w-3 h-3 bg-[#4ECDC4] border-2 border-[#1A1A2E] rotate-45" />

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden memphis-btn p-2 rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </button>
          <a
            href="/"
            className="flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform"
            onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}
          >
            <img src="/logo.png" alt="TB Logo" className="w-7 h-7 md:w-8 md:h-8 rounded-lg border-2 border-[#1A1A2E]" />
            <h1 className="text-base md:text-xl font-bold text-[#1A1A2E] tracking-tight">
              TB 프롬프트 편집기
            </h1>
          </a>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
           <button
             onClick={() => setIsUploadModalOpen(true)}
             className="memphis-btn flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
             title="JSON 템플릿 업로드"
           >
             <Upload className="w-3.5 h-3.5" />
             업로드
           </button>
           <button
             onClick={() => setIsApiInfoOpen(true)}
             className={`memphis-btn p-2 rounded-full relative ${userApiKey ? 'memphis-btn-cyan' : ''}`}
             title="API 연결 정보"
           >
             <Cpu className="w-5 h-5" />
             {(process.env.API_KEY || userApiKey) && (
               <span className="absolute top-0 right-0 w-3 h-3 bg-[#00D4AA] rounded-full border-2 border-[#1A1A2E]"></span>
             )}
           </button>
          <div className="hidden sm:flex items-center gap-1 bg-[#9B5DE5] border-3 border-[#1A1A2E] px-3 py-1 rounded-full text-xs font-bold text-white shadow-[3px_3px_0_#1A1A2E]">
            <Circle className="w-2 h-2 fill-current" />
            v2.2
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-[#1A1A2E]/60 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* LEFT PANEL: Structure Tree */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-72 md:w-80 memphis-sidebar flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          top-14 md:top-0 h-[calc(100vh-3.5rem)] md:h-auto
        `}>
          {/* 프롬프트 만들기 버튼 */}
          <div className="p-3 md:p-4 border-b-4 border-[#1A1A2E] bg-[#FEFEFE]">
            <a
              href="https://gemini.google.com/gem/13HOLZGAzOKloWSBnxejnMvWDOJHNvdyu?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-center justify-center gap-2.5 w-full px-4 py-3.5 bg-[#00D4AA] hover:bg-[#4ECDC4] text-[#1A1A2E] text-sm font-bold rounded-xl border-4 border-[#1A1A2E] shadow-[5px_5px_0_#1A1A2E] hover:shadow-[7px_7px_0_#1A1A2E] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0_#1A1A2E]"
            >
              <Wand2 className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform duration-200" />
              <span>프롬프트 만들기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3 md:p-4 border-b-4 border-[#1A1A2E] bg-[#FEFEFE]">
            <h2 className="font-bold text-sm text-[#1A1A2E] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9B5DE5]" />
              구조 (Structure)
              <div className="w-3 h-3 bg-[#FF6B9D] border-2 border-[#1A1A2E] rounded-full ml-auto" />
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-3 bg-[#FEFEFE]/80">
            {(template.prompt_sections || []).map((section, idx) => (
              <div key={section.section_id} className="memphis-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSection(prev => prev === section.section_id ? null : section.section_id)}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-sm font-bold text-[#1A1A2E] hover:bg-[#FFE156]/30 transition-colors ${
                    idx % 4 === 0 ? 'bg-[#FFE156]/20' :
                    idx % 4 === 1 ? 'bg-[#FF6B9D]/20' :
                    idx % 4 === 2 ? 'bg-[#4ECDC4]/20' : 'bg-[#9B5DE5]/20'
                  }`}
                >
                  {expandedSection === section.section_id ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Settings className="w-3.5 h-3.5" />
                  <span className="truncate flex-1 text-left">{section.section_label_ko || section.section_label || section.section_id}</span>
                  {(section.is_active !== false) && <div className="w-3 h-3 rounded-full bg-[#00D4AA] border-2 border-[#1A1A2E]"></div>}
                </button>
                {expandedSection === section.section_id && (
                  <div className="p-2 space-y-1 bg-white">
                    {(section.components || []).map((comp) => (
                      <div
                        key={comp.component_id}
                        onClick={() => {
                          const el = document.getElementById(`comp-${comp.component_id}`);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('ring-4', 'ring-[#FF6B9D]');
                            setTimeout(() => el.classList.remove('ring-4', 'ring-[#FF6B9D]'), 2000);
                          }
                          setIsSidebarOpen(false);
                        }}
                        className="pl-2 flex items-center gap-2 text-xs text-[#1A1A2E]/70 py-1.5 md:py-1 hover:bg-[#FFE156]/30 hover:text-[#1A1A2E] rounded-lg cursor-pointer transition-colors font-medium"
                      >
                        <Box className="w-3 h-3 text-[#9B5DE5]" />
                        <span className="truncate">{comp.component_label_ko || comp.component_label || comp.component_id}</span>
                        {(comp.is_active !== false) && <Check className="w-3 h-3 text-[#00D4AA] ml-auto mr-1" />}
                      </div>
                    ))}
                    {(!section.components || section.components.length === 0) && (
                       <div className="pl-2 text-xs text-[#1A1A2E]/50 italic py-1">하위 요소 없음</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(!template.prompt_sections || template.prompt_sections.length === 0) && (
              <div className="text-center py-10 px-4 text-[#1A1A2E]/60 text-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#FFE156] border-3 border-[#1A1A2E] rounded-full flex items-center justify-center shadow-[4px_4px_0_#1A1A2E]">
                  <FileJson className="w-8 h-8" />
                </div>
                <p className="font-bold">로드된 템플릿이 없습니다.</p>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(true);
                  }}
                  className="mt-3 memphis-btn memphis-btn-cyan px-4 py-2 rounded-lg flex items-center justify-center gap-1 mx-auto text-sm"
                >
                  <Play className="w-3 h-3" />
                  JSON 업로드 시작
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR FOOTER: External Tools */}
          <div className="p-3 md:p-4 border-t-4 border-[#1A1A2E] bg-[#FEFEFE]">
            <a
              href="https://translate.google.co.kr/"
              target="_blank"
              rel="noreferrer"
              className="memphis-btn memphis-btn-purple flex items-center justify-center gap-2 w-full px-4 py-2.5 md:py-2 text-xs rounded-lg"
              title="새 탭에서 구글 번역기 열기"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Google 번역기 열기
            </a>
          </div>
        </aside>

        {/* RIGHT PANEL: Editor & Output */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FEFEFE] relative">
          {/* Decorative corner shapes */}
          <div className="absolute top-4 right-4 w-6 h-6 bg-[#FF6B9D] border-2 border-[#1A1A2E] rotate-45 z-10" />

          {/* Middle: Tab Content */}
          <div className="flex-1 p-3 md:p-6 flex flex-col min-h-0 relative">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
              <div className="flex gap-1 bg-[#FEFEFE] p-1 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0_#1A1A2E] w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-1.5 text-xs font-bold rounded-lg transition-all duration-100 ${activeTab === 'preview' ? 'bg-[#FFE156] text-[#1A1A2E] shadow-[2px_2px_0_#1A1A2E]' : 'text-[#1A1A2E]/60 hover:bg-[#FFE156]/30'}`}
                >
                  시각적 편집
                </button>
                <button
                  onClick={() => setActiveTab('prompt')}
                  className={`flex-1 sm:flex-none px-3 md:px-4 py-2 md:py-1.5 text-xs font-bold rounded-lg transition-all duration-100 ${activeTab === 'prompt' ? 'bg-[#4ECDC4] text-[#1A1A2E] shadow-[2px_2px_0_#1A1A2E]' : 'text-[#1A1A2E]/60 hover:bg-[#4ECDC4]/30'}`}
                >
                  최종 프롬프트
                </button>
              </div>
              <div className="flex gap-2">
                 <button
                  onClick={() => copyToClipboard(promptString)}
                  className="memphis-btn text-xs flex items-center justify-center gap-1.5 px-3 py-2 md:py-1.5 rounded-lg w-full sm:w-auto"
                >
                  <Copy className="w-3.5 h-3.5" /> Prompt 복사
                </button>
              </div>
            </div>

            <div className="flex-1 memphis-card rounded-xl overflow-hidden relative">
              {activeTab === 'prompt' ? (
                <textarea
                  value={promptString}
                  readOnly
                  className="w-full h-full p-4 md:p-6 bg-[#1A1A2E] font-mono text-xs md:text-sm text-[#00D4AA] resize-none outline-none leading-relaxed selection:bg-[#9B5DE5]/50"
                  spellCheck={false}
                  placeholder="생성된 프롬프트가 없습니다..."
                />
              ) : (
                <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-8 bg-[#FEFEFE]">
                  {/* Visual Preview */}
                  {(template.prompt_sections || []).map((section, sectionIdx) => (
                    <div key={section.section_id} className={`memphis-section space-y-3 md:space-y-4 p-3 md:p-5 rounded-xl mt-4 ${
                      sectionIdx % 4 === 0 ? 'bg-[#FFE156]/10' :
                      sectionIdx % 4 === 1 ? 'bg-[#FF6B9D]/10' :
                      sectionIdx % 4 === 2 ? 'bg-[#4ECDC4]/10' : 'bg-[#9B5DE5]/10'
                    }`}>
                      <h3 className="text-sm md:text-base font-bold text-[#1A1A2E] flex flex-wrap items-center gap-2 pb-2 border-b-3 border-[#1A1A2E]">
                        <span className={`w-4 h-4 rounded-full border-2 border-[#1A1A2E] ${
                          sectionIdx % 4 === 0 ? 'bg-[#FFE156]' :
                          sectionIdx % 4 === 1 ? 'bg-[#FF6B9D]' :
                          sectionIdx % 4 === 2 ? 'bg-[#4ECDC4]' : 'bg-[#9B5DE5]'
                        }`} />
                        {section.section_label_ko || section.section_label}
                        {section.is_midjourney_params && <span className="text-[10px] bg-[#1A1A2E] text-white px-2 py-0.5 rounded-full font-bold">PARAMS</span>}
                        {(section.is_active !== false) ?
                           <span className="text-[10px] text-[#1A1A2E] bg-[#00D4AA] px-2 py-0.5 rounded-full border-2 border-[#1A1A2E] font-bold">Active</span> :
                           <span className="text-[10px] text-white bg-[#1A1A2E]/50 px-2 py-0.5 rounded-full font-bold">Inactive</span>
                        }
                      </h3>

                      <div className="flex flex-col gap-4 md:gap-6">
                        {(section.components || []).map((comp) => (
                          <div key={comp.component_id} id={`comp-${comp.component_id}`} className="space-y-2 md:space-y-3 transition-all duration-300 rounded-lg">
                             <div className="text-xs font-bold text-[#1A1A2E] flex items-center gap-2 px-1">
                                <Box className="w-3 h-3 text-[#9B5DE5]" />
                                {comp.component_label_ko || comp.component_label}
                             </div>

                             <div className="grid grid-cols-1 gap-3 md:gap-4 pl-2 border-l-4 border-[#1A1A2E]">
                               {(comp.attributes || []).map((attr) => (
                                 <div key={attr.attr_id} className="memphis-card bg-white p-3 md:p-4 rounded-xl flex flex-col gap-2 md:gap-3">
                                   {/* Attribute Header */}
                                   <div className="flex items-center justify-between gap-2">
                                     <label className="text-xs md:text-sm font-bold text-[#1A1A2E] flex items-center gap-2 truncate">
                                       <Triangle className="w-3 h-3 text-[#FF6B9D] fill-current" />
                                       {attr.label_ko || attr.label}
                                       {(attr.is_active === false) && <span className="text-[10px] text-[#FF6B9D] font-bold">(Inactive)</span>}
                                     </label>
                                     <div className="flex items-center gap-1 shrink-0">
                                       <ClearButton onClear={() => updateAttributeValue(section.section_id, comp.component_id, attr.attr_id, "")} />
                                       <CopyButton value={Array.isArray(attr.value) ? attr.value.join(', ') : String(attr.value)} />
                                     </div>
                                   </div>

                                   {/* Split Layout */}
                                   <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-start">
                                     {/* Left: Current Value */}
                                     <div className="w-full md:w-[30%] md:border-r-3 border-[#1A1A2E] md:pr-3 pb-2 md:pb-0 md:pt-2 flex flex-col gap-2 border-b-3 md:border-b-0">
                                       <div className="text-xs md:text-sm text-[#1A1A2E]/70 break-words leading-relaxed bg-[#FFE156]/20 p-2 rounded-lg border-2 border-[#1A1A2E]/30" title={String(attr.value)}>
                                         {getDisplayValue(attr, attr.value)}
                                       </div>
                                       <div className="self-end">
                                          <CopyButton value={getDisplayValue(attr, attr.value)} />
                                       </div>
                                     </div>

                                     {/* Right: Edit Field */}
                                     <div className="flex-1 min-w-0">
                                       <div className="relative">
                                         <input
                                           list={attr.options ? `datalist-${attr.attr_id}` : undefined}
                                           type="text"
                                           placeholder="영문 값 입력..."
                                           className="memphis-input w-full text-sm p-2.5 md:p-2.5 rounded-lg text-[#1A1A2E] placeholder:text-[#1A1A2E]/40 font-medium"
                                           value={Array.isArray(attr.value) ? attr.value.join(', ') : attr.value}
                                           onChange={(e) => updateAttributeValue(section.section_id, comp.component_id, attr.attr_id, e.target.value)}
                                         />
                                       </div>

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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Quick Translator */}
          <div className="border-t-4 border-[#1A1A2E] bg-[#FEFEFE] shrink-0">
             <button
               onClick={() => setIsTranslatorOpen(!isTranslatorOpen)}
               className="w-full flex items-center justify-between px-3 md:px-6 py-2 bg-[#9B5DE5] hover:bg-[#9B5DE5]/80 text-xs text-white border-b-4 border-[#1A1A2E] transition-colors font-bold"
             >
               <div className="flex items-center gap-2">
                 <Languages className="w-4 h-4" />
                 <span>AI 퀵 번역기</span>
                 <div className="w-2 h-2 bg-[#00D4AA] rounded-full border border-white" />
               </div>
               <div className="flex items-center gap-2">
                 {isTranslatorOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
               </div>
             </button>

             {isTranslatorOpen && (
               <div className="p-3 md:p-4 flex flex-col md:flex-row gap-2 md:gap-3 h-auto md:h-48 bg-[#FEFEFE]">
                  <div className="flex-1 flex flex-col gap-1 md:gap-2">
                     <div className="flex justify-between items-center text-xs text-[#1A1A2E]/70 px-1 font-bold">
                        <span>입력</span>
                        <a href="https://translate.google.co.kr/?sl=auto&tl=en&op=translate" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#9B5DE5] transition-colors">
                           <ExternalLink className="w-3 h-3" /> <span className="hidden sm:inline">구글 번역기</span>
                        </a>
                     </div>
                     <textarea
                       className="memphis-input flex-1 min-h-[80px] md:min-h-0 rounded-lg p-2.5 md:p-3 text-sm text-[#1A1A2E] resize-none"
                       placeholder="번역할 텍스트..."
                       value={transInput}
                       onChange={(e) => setTransInput(e.target.value)}
                       onKeyDown={(e) => {
                         if(e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleQuickTranslation();
                         }
                       }}
                     />
                  </div>
                  <div className="flex flex-row md:flex-col justify-center gap-2 py-1 md:py-0">
                     <button
                       onClick={handleQuickTranslation}
                       disabled={isTransLoading || !transInput.trim()}
                       className="memphis-btn memphis-btn-cyan flex-1 md:flex-none p-2.5 md:p-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                       title="번역하기"
                     >
                       {isTransLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                       <span className="md:hidden text-xs font-bold">번역</span>
                     </button>
                     <button
                        onClick={() => {
                            const temp = transInput;
                            setTransInput(transOutput);
                            setTransOutput(temp);
                        }}
                        className="memphis-btn flex-1 md:flex-none p-2.5 md:p-3 rounded-xl flex items-center justify-center gap-2"
                        title="입력/결과 바꾸기 (Swap)"
                     >
                        <ArrowRightLeft className="w-5 h-5" />
                        <span className="md:hidden text-xs font-bold">바꾸기</span>
                     </button>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 md:gap-2">
                     <span className="text-xs text-[#1A1A2E]/70 px-1 font-bold">결과</span>
                     <textarea
                       readOnly
                       className="flex-1 min-h-[80px] md:min-h-0 bg-[#00D4AA]/20 border-3 border-[#1A1A2E] rounded-lg p-2.5 md:p-3 text-sm text-[#1A1A2E] resize-none outline-none shadow-[4px_4px_0_#1A1A2E]"
                       placeholder="번역 결과..."
                       value={transOutput}
                     />
                  </div>
               </div>
             )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A2E]/80 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="memphis-card bg-[#FEFEFE] rounded-2xl max-w-2xl w-full flex flex-col h-[90vh] md:h-[80vh]">
            <div className="p-3 md:p-5 border-b-4 border-[#1A1A2E] flex items-center justify-between bg-[#FFE156] rounded-t-xl shrink-0">
              <h3 className="text-base md:text-lg font-bold text-[#1A1A2E] flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                JSON 템플릿 불러오기
                <div className="w-3 h-3 bg-[#FF6B9D] border-2 border-[#1A1A2E] rounded-full" />
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="memphis-btn memphis-btn-pink p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 md:p-6 flex-1 overflow-hidden flex flex-col">
              {uploadError && (
                <div className="mb-3 md:mb-4 p-2.5 md:p-3 bg-[#FF6B9D]/20 border-3 border-[#FF6B9D] rounded-xl flex items-start gap-2 md:gap-3 text-[#1A1A2E] text-xs md:text-sm shrink-0 shadow-[4px_4px_0_#FF6B9D]">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-[#FF6B9D] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">오류 발생</p>
                    <p>{uploadError}</p>
                  </div>
                </div>
              )}

              <textarea
                value={uploadInput}
                onChange={(e) => setUploadInput(e.target.value)}
                placeholder='{"meta_data": ..., "prompt_sections": ...}'
                className="memphis-input flex-1 w-full p-3 md:p-4 text-[#1A1A2E] font-mono text-xs rounded-xl resize-none"
              />
            </div>

            <div className="p-3 md:p-5 border-t-4 border-[#1A1A2E] bg-[#4ECDC4]/20 rounded-b-xl flex justify-end gap-2 md:gap-3 shrink-0">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="memphis-btn px-3 md:px-4 py-2 text-sm font-bold rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadInput.trim() || isUploadLoading}
                className="memphis-btn memphis-btn-cyan px-4 md:px-6 py-2 text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isUploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">템플릿</span> 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Info Modal */}
      {isApiInfoOpen && (
        <div className="fixed inset-0 bg-[#1A1A2E]/80 z-50 flex items-center justify-center p-2 md:p-4">
          <div className="memphis-card bg-[#FEFEFE] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-3 md:p-5 border-b-4 border-[#1A1A2E] flex items-center justify-between sticky top-0 bg-[#9B5DE5] z-10 rounded-t-xl">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                API 연결 정보
              </h3>
              <button
                onClick={() => setIsApiInfoOpen(false)}
                className="memphis-btn p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs md:text-sm text-[#1A1A2E]/70 font-bold">현재 사용 중인 모델:</p>
                <div className="flex items-center gap-2 text-[#1A1A2E] font-mono text-sm bg-[#00D4AA]/20 px-3 py-2 rounded-xl border-3 border-[#1A1A2E] shadow-[4px_4px_0_#1A1A2E]">
                  <div className="w-3 h-3 rounded-full bg-[#00D4AA] border-2 border-[#1A1A2E] animate-pulse"></div>
                  gemini-2.5-flash
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t-3 border-[#1A1A2E]">
                <p className="text-xs md:text-sm text-[#1A1A2E]/70 font-bold">기능별 사용:</p>
                <ul className="space-y-2 text-xs md:text-sm text-[#1A1A2E]">
                  <li className="flex items-start gap-2 p-2 bg-[#4ECDC4]/20 rounded-lg">
                    <Check className="w-4 h-4 text-[#00D4AA] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">AI 퀵 번역기</span>
                      <p className="text-xs text-[#1A1A2E]/60 mt-0.5">한글↔영문 텍스트 즉시 번역</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 p-2 bg-[#FFE156]/20 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-[#1A1A2E]/50 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-[#1A1A2E]/70">템플릿 업로드 (Parse Only)</span>
                      <p className="text-xs text-[#1A1A2E]/60 mt-0.5">API 미사용, JSON 파싱만 수행</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* API Key Input Section */}
              <div className="space-y-2 pt-4 border-t-3 border-[#1A1A2E]">
                 <label className="text-xs md:text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                   <KeyRound className="w-4 h-4 text-[#FF6B9D]" />
                   Custom API Key
                 </label>
                 <div className="relative">
                   <input
                     type="password"
                     value={userApiKey}
                     onChange={(e) => setUserApiKey(e.target.value)}
                     placeholder="Gemini API Key 입력..."
                     className="memphis-input w-full p-2.5 rounded-lg text-sm text-[#1A1A2E] font-mono placeholder:text-[#1A1A2E]/40"
                   />
                 </div>
                 <p className="text-xs text-[#1A1A2E]/60">
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
