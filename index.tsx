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
  Droplets,
  Music,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Mic,
  Film as FilmIcon,
} from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { stemSeparator, type StemProgress } from './src/audio/StemSeparator';
import { videoEngine } from './src/video/VideoEngine';

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
  label?: string;
  label_ko?: string;
  type?: string;
  value: any;
  value_ko?: string;
  options?: string[] | { value: string; label: string; label_ko?: string }[];
  is_active?: boolean;
  is_locked?: boolean;
  prefix?: string;
  weight?: { enabled: boolean; value: number };
  platform_overrides?: Record<string, any>;
  help_text?: string;
  validation?: any;
}

interface Component {
  component_id: string;
  component_label?: string;
  component_label_ko?: string;
  is_active?: boolean;
  is_collapsed?: boolean;
  attributes: Attribute[];
}

interface Section {
  section_id: string;
  section_label?: string;
  section_label_ko?: string;
  order?: number;
  is_active?: boolean;
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

interface SubCutPrompt {
  prompt: string;
  ko_description: string;
}

interface ScenePrompt {
  id: number;
  scene_title: string;
  prompt: string;
  ko_description: string;
  video_main?: SubCutPrompt;
  video_extend?: SubCutPrompt;
  image_main?: SubCutPrompt;
  image_extend?: SubCutPrompt;
}

interface ConceptArtMasterImage {
  type: string;
  label: string;
  image_prompt: string;
  image_ko_description: string;
  uploaded_image?: string;
}

interface ConceptArtCharacter {
  id: string;
  name: string;
  role: string;
  card: Record<string, string>;
  master_images: ConceptArtMasterImage[];
}

interface ConceptArtEnvironment {
  id: string;
  name: string;
  card: Record<string, string>;
  allowed_effects: string[];
  blocked_effects: string[];
  master_images: ConceptArtMasterImage[];
  uploaded_image?: string;
}

interface ConceptArtProduct {
  id: string;
  name: string;
  card: Record<string, string>;
  master_images: ConceptArtMasterImage[];
}

interface ConceptArtData {
  characters: ConceptArtCharacter[];
  environments: ConceptArtEnvironment[];
  products: ConceptArtProduct[];
  group_shots: ConceptArtMasterImage[];
}

type ConceptArtTab = 'characters' | 'environments' | 'products';

type Stage = 'stage1' | 'stage2' | 'frame-extractor' | 'bg-remover' | 'wm-remover' | 'audio-separator';
type Stage2SubPage = 'concept' | 'image' | 'video';

interface ExtractedFrame {
  id: number;
  timestamp: number;
  dataUrl: string;
  filename: string;
}

// --- Sample Data (3D Stylized Girl & Dog) ---
const SAMPLE_TEMPLATE: Template = {
  "meta_data": {
    "template_name": "TB_V5_0_Lite",
    "template_id": "tpl_tb_v5_0_lite",
    "version": "2.0.0"
  },
  "prompt_sections": [
    {
      "section_id": "sec_subject",
      "section_label_ko": "주요 피사체",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_character",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "character",
              "label_ko": "캐릭터",
              "value": "a cute stylized 3D girl with long black hair, bangs, and big brown eyes",
              "value_ko": "긴 검은 머리와 앞머리, 큰 갈색 눈을 가진 귀여운 3D 스타일 소녀",
              "is_locked": true,
              "is_active": true
            },
            {
              "attr_id": "outfit",
              "label_ko": "복장",
              "value": "black and white varsity jacket, black pleated skirt, striped socks, tan work boots",
              "value_ko": "검은색과 흰색 바시티 자켓, 검은색 주름 스커트, 줄무늬 양말, 황갈색 작업 부츠",
              "is_locked": true,
              "is_active": true
            },
            {
              "attr_id": "props",
              "label_ko": "소품",
              "value": "hands in jacket pockets",
              "value_ko": "자켓 주머니에 넣은 손",
              "is_locked": true,
              "is_active": true
            }
          ]
        },
        {
          "component_id": "comp_creature",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "species",
              "label_ko": "종류",
              "value": "tiny fluffy white dog",
              "value_ko": "작고 솜털이 보송보송한 하얀 강아지",
              "is_locked": true,
              "is_active": true
            },
            {
              "attr_id": "body",
              "label_ko": "체형/신체",
              "value": "round, cloud-like fur texture",
              "value_ko": "둥글고 구름 같은 털 질감",
              "is_locked": true,
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_environment",
      "section_label_ko": "환경",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_env",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "background",
              "label_ko": "배경",
              "value": "outdoor brick pathway, blurred garden with terracotta pots",
              "value_ko": "야외 벽돌 길, 테라코타 화분이 있는 흐릿한 정원 배경",
              "is_active": true
            },
            {
              "attr_id": "lighting",
              "label_ko": "조명",
              "value": "soft natural daylight, warm sun-kissed highlights, soft bokeh",
              "value_ko": "부드러운 자연광, 따스한 햇살의 하이라이트, 부드러운 보케",
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_camera",
      "section_label_ko": "카메라",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_camera",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "camera_setting",
              "label_ko": "카메라 설정",
              "value": "full body shot, eye level, shallow depth of field",
              "value_ko": "전신 샷, 눈높이, 얕은 심도",
              "is_active": true
            }
          ]
        }
      ]
    },
    {
      "section_id": "sec_style",
      "section_label_ko": "스타일",
      "is_active": true,
      "components": [
        {
          "component_id": "comp_style",
          "is_active": true,
          "attributes": [
            {
              "attr_id": "rendering_style",
              "label_ko": "렌더링 스타일",
              "value": "3D stylized rendering, Pixar and Disney inspired, hyper-detailed textures",
              "value_ko": "3D 스타일 렌더링, 픽사와 디즈니 스타일, 매우 상세한 질감",
              "is_active": true
            }
          ]
        }
      ]
    }
  ],
  "color_palette": {
    "primary": "Black & White",
    "secondary": "Warm Tan",
    "accent": "Garden Green"
  }
};

// --- Sample Storyboard JSON (검은 연기 — 도시의 수호자들) ---
const SAMPLE_STORYBOARD = `{
  "project": {
    "title": "검은 연기 — 도시의 수호자들",
    "genre": "복합 (액션 + 드라마 + 광고)",
    "format": "쇼츠 (30초~1분)",
    "tone": "시네마틱",
    "language": "한국어",
    "total_cuts": 6
  },
  "characters": [
    {
      "id": "char_01",
      "name": "강현",
      "role": "주인공",
      "card": {
        "국적/인종": "한국인",
        "성별": "남성",
        "나이대": "30대 초반",
        "체형": "lean muscular",
        "얼굴 특징": "짧은 검은 머리 언더컷, 날카로운 턱선, 왼쪽 눈썹에 작은 흉터",
        "복장": "흰색 도복(dobok), 검은 띠, 소매 약간 걷음",
        "성격/분위기": "차분하고 절제된, 내면의 불꽃",
        "고유 시각 요소": "오른쪽 전완에 한자 문신 '守(수호)'",
        "직업/역할 배경": "태권도 사범"
      },
      "master_images": {
        "fullbody": {
          "image_prompt": "Full body portrait of a Korean male martial artist in his early 30s, lean muscular build, sharp jawline, short black undercut hair, small scar on left eyebrow, wearing a white dobok with black belt tied tightly at the waist with sleeves slightly rolled up revealing a Korean Hanja tattoo on right forearm, barefoot standing in a disciplined fighting stance with fists raised, inside a traditional wooden dojo with warm natural light streaming from large side windows, calm and focused expression with quiet intensity, warm golden side lighting with soft shadows, hyper-realistic cinematic portrait shallow depth of field 8K detail. --no text, letters, watermark",
          "image_ko_description": "전통 나무 도장 안에 서 있는 30대 초반 한국인 남성 무술가. 흰 도복, 검은 띠, 언더컷 헤어, 왼쪽 눈썹 흉터, 오른쪽 전완 한자 문신. 절제된 파이팅 스탠스, 차분하고 집중된 표정. 측면 창문에서 들어오는 따뜻한 자연광."
        },
        "character_sheet": {
          "image_prompt": "Character sheet, full body turnaround of a Korean male martial artist in his early 30s, lean muscular build, sharp jawline, short black undercut hair, small scar on left eyebrow, wearing a white dobok with black belt and sleeves slightly rolled up, Korean Hanja tattoo visible on right forearm. Four views on a single image: front view, left side view, right side view, back view. T-pose neutral standing pose, consistent proportions across all four views. Plain white background, clean studio lighting, evenly lit with no harsh shadows. Hyper-realistic, character design reference sheet, 8K detail. --no text, letters, watermark, no background elements",
          "image_ko_description": "강현 캐릭터 4면 시트. 흰 배경 위에 정면, 좌측, 우측, 뒷면을 균일한 조명으로 배치. 흰 도복, 검은 띠, 언더컷 헤어, 눈썹 흉터, 전완 문신 등 모든 디테일이 4면에서 일관 표현."
        }
      }
    },
    {
      "id": "char_02",
      "name": "라파엘",
      "role": "상대",
      "card": {
        "국적/인종": "브라질인",
        "성별": "남성",
        "나이대": "20대 후반",
        "체형": "athletic, 넓은 어깨",
        "얼굴 특징": "짧은 드레드락 뒤로 묶은 작은 번, 깔끔한 수염, 오른쪽 광대뼈 작은 흉터",
        "복장": "흰색 아바다 팬츠(카포에이라 전통 바지), 상의 없음",
        "성격/분위기": "자신감 넘치는, 에너지 가득한, 장난기 있는",
        "고유 시각 요소": "왼쪽 어깨에 부족 문양 문신",
        "직업/역할 배경": "카포에이라 마스터"
      },
      "master_images": {
        "fullbody": {
          "image_prompt": "Full body portrait of a Brazilian male capoeira fighter in his late 20s, athletic build with broad shoulders, dark brown skin, short dreadlocks pulled back into a small bun, neatly trimmed beard, small scar on right cheekbone, wearing white abada pants with no shirt revealing a toned muscular torso with a tribal tattoo on left shoulder, barefoot standing in a relaxed ginga stance with weight shifted to one leg and arms loose at sides with a confident smirk, inside a traditional wooden dojo with warm natural light from side windows, warm golden side lighting, hyper-realistic cinematic portrait shallow depth of field 8K detail. --no text, letters, watermark",
          "image_ko_description": "전통 나무 도장 안의 20대 후반 브라질인 카포에이라 파이터. 흰 아바다 팬츠, 상의 없는 근육질 상체, 드레드락 번, 수염, 광대뼈 흉터, 어깨 부족 문신. 여유로운 깅가 스탠스, 자신감 넘치는 미소."
        },
        "character_sheet": {
          "image_prompt": "Character sheet, full body turnaround of a Brazilian male capoeira fighter in his late 20s, athletic build with broad shoulders, dark brown skin, short dreadlocks in a small bun, trimmed beard, scar on right cheekbone, wearing white abada pants with no shirt, toned muscular torso with tribal tattoo on left shoulder. Four views on a single image: front view, left side view, right side view, back view. T-pose neutral standing pose, consistent proportions across all four views. Plain white background, clean studio lighting, evenly lit with no harsh shadows. Hyper-realistic, character design reference sheet, 8K detail. --no text, letters, watermark, no background elements",
          "image_ko_description": "라파엘 캐릭터 4면 시트. 흰 배경 위에 정면, 좌측, 우측, 뒷면 배치. 모든 디테일이 4면에서 일관 표현."
        }
      }
    },
    {
      "id": "char_03",
      "name": "수아",
      "role": "조연",
      "card": {
        "국적/인종": "한국인",
        "성별": "여성",
        "나이대": "20대 중반",
        "체형": "slim, 균형잡힌",
        "얼굴 특징": "긴 검은 머리 포니테일, 부드러운 이목구비, 맑은 눈",
        "복장": "검은색 스포츠 자켓, 회색 레깅스, 흰 운동화, 목에 은색 호루라기",
        "성격/분위기": "따뜻하면서도 단호한, 지도자적",
        "고유 시각 요소": "왼쪽 손목에 은색 팔찌",
        "직업/역할 배경": "도장 코치 / 강현의 트레이너"
      },
      "master_images": {
        "fullbody": {
          "image_prompt": "Full body portrait of a Korean female coach in her mid 20s, slim balanced build, long black hair in a high ponytail, soft facial features with clear bright eyes, wearing a black sports jacket over a gray tank top with gray leggings and white sneakers, silver whistle hanging around her neck and silver bracelet on left wrist, standing with arms crossed and a warm but determined expression, inside a traditional wooden dojo with warm side lighting, hyper-realistic cinematic portrait shallow depth of field 8K detail. --no text, letters, watermark",
          "image_ko_description": "전통 나무 도장 안의 20대 중반 한국인 여성 코치. 검은 스포츠 자켓, 회색 레깅스, 흰 운동화, 포니테일, 은색 호루라기와 팔찌. 팔짱 낀 채 따뜻하면서 단호한 표정."
        },
        "character_sheet": {
          "image_prompt": "Character sheet, full body turnaround of a Korean female coach in her mid 20s, slim build, long black hair in high ponytail, soft features with clear eyes, wearing black sports jacket over gray tank top with gray leggings and white sneakers, silver whistle around neck, silver bracelet on left wrist. Four views on a single image: front view, left side view, right side view, back view. Neutral standing pose, consistent proportions across all four views. Plain white background, clean studio lighting, evenly lit with no harsh shadows. Hyper-realistic, character design reference sheet, 8K detail. --no text, letters, watermark, no background elements",
          "image_ko_description": "수아 캐릭터 4면 시트. 흰 배경 위에 정면, 좌측, 우측, 뒷면 배치. 모든 디테일 4면 일관 표현."
        }
      }
    }
  ],
  "environments": [
    {
      "id": "env_01",
      "name": "전통 무술 도장",
      "card": {
        "장소": "전통 목조 무술 도장",
        "실내/실외": "실내",
        "시간대": "오후 (따뜻한 자연광)",
        "바닥 재질": "나무 마루",
        "조명": "자연광 (측면 대형 창문)",
        "조명 방향": "측면광 (왼쪽 창문)",
        "색온도": "따뜻한 (golden hour 느낌)",
        "핵심 소품": "벽면 한국 서예 족자, 목검 거치대, 수련 도구",
        "분위기 키워드": "고요한, 전통적, 숭고한, 긴장감",
        "날씨/환경효과": "창문 빛줄기 속 미세 먼지 입자"
      },
      "allowed_effects": ["먼지 입자", "창문 빛줄기", "나무 바닥 반사광"],
      "blocked_effects": ["모래", "바람", "비", "눈", "낙엽", "안개"],
      "master_images": {
        "wide_establishing": {
          "image_prompt": "Wide establishing shot of a traditional wooden martial arts dojo interior with polished hardwood floor, large windows on the left wall streaming warm golden afternoon sunlight with visible light shafts, fine dust particles floating in the beams, Korean calligraphy scrolls hanging on the far wall, a wooden sword rack in the corner with practice equipment neatly arranged, warm golden color temperature with deep wooden brown tones, serene and sacred atmosphere. Empty scene no people. Cinematic hyper-realistic 8K detail 16:9 aspect ratio. --no text, letters, watermark, no people, no characters",
          "image_ko_description": "전통 목조 도장 내부 와이드 전경. 인물 없는 빈 공간. 고요하고 숭고한 분위기."
        }
      }
    },
    {
      "id": "env_02",
      "name": "도장 외부 마당",
      "card": {
        "장소": "도장 건물 앞 돌마당 / 전통 한옥 마당",
        "실내/실외": "실외",
        "시간대": "석양 (golden hour)",
        "바닥 재질": "돌바닥 + 잔디 경계",
        "조명": "석양 자연광",
        "조명 방향": "역광 / 측면광",
        "색온도": "매우 따뜻한 (deep golden)",
        "핵심 소품": "전통 석등, 소나무, 도장 현판",
        "분위기 키워드": "평화로운, 여운, 성찰, 아름다운",
        "날씨/환경효과": "석양빛, 미풍, 나뭇잎 흔들림"
      },
      "allowed_effects": ["석양 렌즈플레어", "미풍", "나뭇잎 흔들림", "그림자 길게 드리움"],
      "blocked_effects": ["비", "눈", "안개", "먼지 폭풍"],
      "master_images": {
        "wide_establishing": {
          "image_prompt": "Wide establishing shot of a traditional Korean stone courtyard at golden hour sunset, flat stone ground with grass borders, traditional stone lanterns on both sides, tall pine trees framing the scene, deep golden orange sunset light creating long dramatic shadows, peaceful and reflective atmosphere. Empty scene no people. Cinematic hyper-realistic 8K detail 16:9 aspect ratio. --no text, letters, watermark, no people, no characters",
          "image_ko_description": "석양빛 전통 한옥 돌마당 와이드 전경. 인물 없는 빈 공간. 평화롭고 성찰적."
        }
      }
    }
  ],
  "products": [
    {
      "id": "prod_01",
      "name": "VITA-FORCE 에너지 드링크",
      "card": {
        "카테고리": "에너지 음료",
        "외형 묘사": "매트 블랙 알루미늄 캔, 금색 로고, 250ml, 상단에 금색 풀탭",
        "브랜드 컬러": "매트 블랙 + 골드",
        "핵심 셀링포인트": "무설탕, 천연 카페인, 무술인/운동선수용",
        "사용 맥락": "격렬한 훈련 후 수분/에너지 보충",
        "무드/이미지": "프리미엄, 강인한, 절제된 럭셔리"
      },
      "master_images": {
        "hero_shot": {
          "image_prompt": "Eye-level shot of a matte black aluminum energy drink can with a gold logo and gold pull tab on top, 250ml sleek cylindrical shape, placed on a dark stone surface with subtle water droplets on the can surface, dramatic side lighting highlighting the metallic texture and gold logo, dark moody background with a single warm spotlight, matte black and gold color palette, premium commercial product photography clean background 8K detail. --no text, letters, watermark",
          "image_ko_description": "어두운 돌 표면 위의 매트 블랙 에너지 드링크 캔. 금색 로고와 풀탭, 캔 표면 미세 물방울. 프리미엄하고 강인한 무드."
        },
        "product_turnaround": {
          "image_prompt": "Product turnaround sheet of a matte black aluminum energy drink can with gold logo and gold pull tab, 250ml sleek cylinder. Four views on a single image: front view showing full logo, left side view, right side view, back view. Plain white background, clean studio lighting, evenly lit. Commercial product photography, 8K detail. --no text, letters, watermark, no background elements",
          "image_ko_description": "매트 블랙 에너지 드링크 캔 4면 턴어라운드. 흰 배경 위에 정면, 좌측, 우측, 뒷면 배치."
        }
      }
    }
  ],
  "group_shots": [
    {
      "id": "group_01",
      "type": "투샷 대치",
      "character_ids": ["char_01", "char_02"],
      "image_prompt": "Wide cinematic shot inside a traditional wooden dojo. On the left, a Korean martial artist in white dobok with black belt in a disciplined fighting stance. On the right, a shirtless Brazilian capoeira fighter in white pants swaying in a ginga stance. They face each other 3 meters apart. Dust particles float in warm golden sunlight. Tense atmosphere. Cinematic hyper-realistic 8K. --no text, letters, watermark",
      "image_ko_description": "도장 안에서 대치하는 두 격투가. 왼쪽 강현(흰 도복), 오른쪽 라파엘(상의 없음). 3m 간격, 긴장감."
    },
    {
      "id": "group_02",
      "type": "그룹샷 (3인)",
      "character_ids": ["char_01", "char_02", "char_03"],
      "image_prompt": "Wide cinematic shot at a traditional Korean courtyard at golden hour sunset. In the center, a Korean male martial artist in white dobok with arms crossed. To his left, a shirtless Brazilian capoeira fighter in white pants leaning casually against a stone lantern. To his right, a Korean female coach in black sports jacket with hands on hips. All three face the camera with confident expressions. Deep golden sunset backlight. Cinematic hyper-realistic 8K. --no text, letters, watermark",
      "image_ko_description": "석양빛 한옥 마당에 선 세 사람. 중앙 강현, 왼쪽 라파엘, 오른쪽 수아. 자신감 있는 표정, 깊은 금빛 역광."
    }
  ],
  "scenes": [
    {
      "id": 1,
      "scene_title": "새벽 도장의 고요",
      "narrative_phase": "기",
      "character_id": "char_01",
      "environment_id": "env_01",
      "transition_to_next": "J컷 (라파엘 발소리가 먼저 들림)",
      "video_main": {
        "id": "scene_01_main",
        "duration": "0~5s",
        "directing_intent": "도장의 신성한 공간감과 주인공의 내면적 고요함을 보여준다",
        "shot_type": "Extreme wide shot",
        "camera_move": "Slowly tracking forward through the dojo",
        "image_prompt": "Extreme wide shot, a traditional wooden dojo interior in the early morning, warm golden sunlight streaming through large side windows casting long light shafts across the polished wooden floor, dust particles floating gently in the light beams, Korean calligraphy scrolls on the walls and wooden sword rack in the corner, a lone figure of a Korean martial artist in a white dobok standing at the far center in a meditative stance with eyes closed, serene and sacred atmosphere, warm golden tones with deep wooden browns, cinematic film grain high contrast photography 16:9 aspect ratio. --no text, letters, watermark",
        "image_ko_description": "익스트림 와이드. 이른 아침 도장 전경. 금빛 햇살과 먼지 입자. 멀리 중앙에 강현이 눈 감고 명상 중.",
        "video_prompt": "0~5s: Extreme wide shot, slowly tracking forward through the dojo. The camera glides through the empty traditional wooden dojo, warm golden sunlight streams through side windows with dust particles drifting lazily through the light shafts, the polished wooden floor creaks faintly, at the far center the Korean martial artist in white dobok stands perfectly still in meditation with eyes closed, his steady breathing the only audible sound. --no BGM, no music, no soundtrack",
        "video_ko_description": "익스트림 와이드, 도장 내부를 천천히 전진 트래킹. 금빛 햇살 속 먼지, 나무 바닥 삐걱 소리. 멀리 강현이 명상 중, 고요한 호흡만 들린다.",
        "audio_description": "0~2s: Deep silence with faint wooden floor settling. 2~4s: Soft wind filtering through window cracks. 4~5s: Barely audible steady breathing rhythm.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_01_ext",
        "duration": "0~5s",
        "directing_intent": "주인공의 집중된 내면과 절제된 힘을 표정으로 전달한다",
        "shot_type": "Close-up",
        "camera_move": "Slowly pushing in toward his face",
        "image_prompt": "Close-up, the Korean martial artist in white dobok with short black undercut hair and small scar on left eyebrow, eyes closed in deep meditation, his chest rising and falling with controlled breathing, a single dust particle drifts past his face catching the golden sidelight, utterly calm and centered expression, wooden dojo wall with calligraphy scroll in soft bokeh behind, warm amber side lighting with cool shadow on opposite side, cinematic film grain 16:9 aspect ratio. --no text, letters, watermark",
        "image_ko_description": "클로즈업. 강현의 명상 표정. 눈 감고, 절제된 호흡, 먼지 한 알이 얼굴 옆을 지남. 뒤로 서예 족자 보케.",
        "video_prompt": "0~5s: Close-up, slowly pushing in toward his face. The Korean martial artist in white dobok with undercut hair and eyebrow scar stands in deep meditation, his chest rises and falls with controlled breathing, a single dust particle drifts past his face catching the golden sidelight, his expression utterly calm and centered, the warmth of the dojo light plays across his features. --no BGM, no music, no soundtrack",
        "video_ko_description": "클로즈업, 얼굴로 천천히 푸시인. 명상 중 강현의 표정. 가슴 오르내리는 호흡, 먼지 한 알 금빛 반사, 완전한 고요.",
        "audio_description": "0~2s: Subtle room tone with warmth. 2~4s: Soft rhythmic inhale and exhale clearly audible. 4~5s: Faint distant footsteps approaching (J-cut bridge to next scene).",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      }
    },
    {
      "id": 2,
      "scene_title": "대치 — 두 세계의 충돌",
      "narrative_phase": "승",
      "character_id": "char_01",
      "environment_id": "env_01",
      "transition_to_next": "스매시컷 (고요 → 폭발적 액션)",
      "video_main": {
        "id": "scene_02_main",
        "duration": "0~5s",
        "directing_intent": "두 격투가의 대비되는 스타일과 팽팽한 긴장을 동시에 보여준다",
        "shot_type": "Wide shot",
        "camera_move": "Slowly dollying left to right",
        "image_prompt": "Wide shot, inside the traditional wooden dojo, the Korean martial artist in white dobok on the left in a disciplined fighting stance with fists raised, the shirtless Brazilian capoeira fighter in white pants on the right swaying in a rhythmic ginga, they face each other 3 meters apart, golden dust particles drifting between them in warm sidelight, tense electric atmosphere, warm golden tones with dramatic contrast, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "와이드샷. 도장 안 대치. 왼쪽 강현(파이팅 스탠스), 오른쪽 라파엘(깅가 리듬). 3m 간격, 금빛 먼지, 팽팽한 긴장.",
        "video_prompt": "0~5s: Wide shot, slowly dollying from left to right across the dojo. The Korean martial artist in white dobok raises his fists with a controlled exhale, the Brazilian capoeira fighter in white pants shifts his weight in a rhythmic ginga with bare feet whispering against the wooden floor, golden dust particles drift between them, a long tense silence holds with only breathing and distant wood creaking. --no BGM, no music, no soundtrack",
        "video_ko_description": "와이드, 좌에서 우로 달리. 강현 절제된 호흡, 라파엘 깅가 리듬. 금빛 먼지, 호흡과 나무 소리만의 긴장.",
        "audio_description": "0~2s: Controlled exhale from Korean fighter. 2~4s: Bare feet shifting rhythmically on polished wood. 4~5s: Tense silence, faint dust drift.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_02_ext",
        "duration": "0~5s",
        "directing_intent": "눈빛 교차로 두 사람의 결의와 존중을 동시에 포착한다",
        "shot_type": "Extreme close-up",
        "camera_move": "Static with rack focus between two faces",
        "image_prompt": "Extreme close-up, split composition, the Korean martial artist's calm intense dark eyes on the left half of frame with golden sidelight, sharp and focused, warm amber iris catching light, shallow depth of field with the dojo in soft golden bokeh behind, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "익스트림 클로즈업. 강현의 차분하고 강렬한 눈. 금빛 측면광에 홍채가 빛남. 배경 도장 보케.",
        "video_prompt": "0~5s: Extreme close-up, static with rack focus. The Korean martial artist's calm intense dark eyes fill the left of frame, then rack focus shifts to the Brazilian fighter's bright confident eyes on the right, golden sidelight reflecting in both gazes, the sharp piercing tweet of a silver whistle breaks the absolute silence at the end. --no BGM, no music, no soundtrack",
        "video_ko_description": "익스트림 클로즈업, 랙 포커스. 강현의 차분한 눈 → 라파엘의 자신감 넘치는 눈. 금빛 반사. 마지막에 호루라기가 정적을 깬다.",
        "audio_description": "0~2s: Absolute tense silence. 2~4s: Faint heartbeat-like pulse in stillness. 4~5s: Sharp piercing whistle breaking silence.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      }
    },
    {
      "id": 3,
      "scene_title": "결정타 — 점프 뒤돌려차기",
      "narrative_phase": "전",
      "character_id": "char_01",
      "environment_id": "env_01",
      "transition_to_next": "스피드 램프 컷 (슬로모션 → 일반 속도)",
      "video_main": {
        "id": "scene_03_main",
        "duration": "0~5s",
        "directing_intent": "주인공의 압도적 파워와 기술을 최대 스케일로 보여주는 클라이맥스",
        "shot_type": "Wide shot, low angle",
        "camera_move": "Tracking from side with speed ramp to slow motion at impact",
        "image_prompt": "Wide shot low angle, inside the wooden dojo, the Korean martial artist in white dobok mid-sprint leaping into the air with his body beginning to spin, the Brazilian fighter in white pants in defensive stance bracing for impact, golden dust erupting from the wooden floor, warm dramatic sidelight with high contrast shadows, dynamic and explosive energy, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "와이드 로우앵글. 강현이 도약하며 회전 시작, 라파엘 방어 자세. 바닥에서 먼지 분출, 폭발적 에너지.",
        "video_prompt": "0~5s: Wide shot low angle, tracking from side with speed ramp. The Korean martial artist in white dobok sprints forward two powerful steps then plants his left foot hard with a resonant stomp, leaps into the air spinning 360 degrees and delivers a devastating jumping spinning back kick, his right heel connects with the Brazilian fighter's chest in slow motion at the exact moment of impact, the white dobok whips violently during the spin, sweat droplets burst catching the golden sidelight. Dynamic action choreography, rapid movement. --no BGM, no music, no soundtrack",
        "video_ko_description": "와이드 로우앵글, 측면 트래킹+스피드 램프. 강현 질주→도약→360도 회전 점프 뒤돌려차기. 임팩트 순간 슬로모션. 도복 펄럭임, 땀 폭발.",
        "audio_description": "0~2s: Heavy accelerating footsteps ending in powerful stomp. 2~4s: Whoosh of spinning body — slows with speed ramp. 4~5s: Thunderous boom of heel connecting with chest.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_03_ext",
        "duration": "0~5s",
        "directing_intent": "피격 후 날아가는 상대의 리액션과 주인공의 결연한 착지를 포착",
        "shot_type": "Medium shot, handheld",
        "camera_move": "Handheld with slight shake, slowly pushing in",
        "image_prompt": "Medium shot handheld, the Brazilian fighter in white pants launched backward through the air inside the wooden dojo, the Korean martial artist in white dobok landing firmly on both feet in a fighting stance in the foreground, golden dust and sweat particles suspended in warm sidelight, raw and intense aftermath, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "미디엄 핸드헬드. 라파엘이 뒤로 날아가고, 전경에 강현이 양발 착지 파이팅 스탠스. 먼지와 땀이 금빛에 부유.",
        "video_prompt": "0~5s: Medium shot, handheld with slight shake, slowly pushing in. The Brazilian fighter in white pants is launched off his feet flying backward through the air, crashes onto the wooden dojo floor and slides across the polished surface, the Korean martial artist in white dobok lands firmly on both feet in a fighting stance with a sharp exhale, dust settles around him in the golden sidelight, his expression focused and resolved. --no BGM, no music, no soundtrack",
        "video_ko_description": "미디엄 핸드헬드. 라파엘 날아가 바닥에 떨어져 미끄러짐. 강현 양발 착지, 날카로운 호흡. 먼지 가라앉음, 결연한 표정.",
        "audio_description": "0~2s: Body crashing onto wooden floor with heavy sliding scrape. 2~4s: Sharp exhale from Korean fighter landing. 4~5s: Dust settling, heavy breathing from both.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      }
    },
    {
      "id": 4,
      "scene_title": "존중의 악수",
      "narrative_phase": "결",
      "character_id": "char_01",
      "environment_id": "env_01",
      "transition_to_next": "디졸브 (도장 → 석양 마당)",
      "video_main": {
        "id": "scene_04_main",
        "duration": "0~5s",
        "directing_intent": "격렬한 대결 후 스포츠맨십과 상호 존중을 보여준다",
        "shot_type": "Full shot",
        "camera_move": "Static, level angle",
        "image_prompt": "Full shot level angle, inside the wooden dojo, the Korean martial artist in white dobok standing with lowered fists breathing heavily, extending his right hand downward toward the Brazilian capoeira fighter who is on one knee holding his chest, warm golden sidelight creating a peaceful glow between them, dust settling in light beams, atmosphere shifting from intensity to mutual respect, warm amber palette, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "풀샷. 강현이 숨 고르며 손을 내밀고, 라파엘이 무릎 꿇고 올려다봄. 먼지 가라앉는 금빛 속 존중의 순간.",
        "video_prompt": "0~5s: Full shot, static level angle. The Korean martial artist in white dobok stands breathing heavily then slowly lowers his fists and extends his right hand with a calm nod, the Brazilian fighter on one knee looks up with surprise then breaks into a respectful grin, clasps the hand and pulls himself up, they shake hands firmly. --no BGM, no music, no soundtrack",
        "video_ko_description": "풀샷 고정. 강현이 거친 숨 고르며 손 내밀고, 라파엘이 놀란 뒤 웃으며 손 잡고 일어남. 단단한 악수.",
        "audio_description": "0~2s: Heavy breathing gradually slowing. 2~4s: Firm hand clasp and grunt standing up. 4~5s: Warm genuine laughter.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_04_ext",
        "duration": "0~5s",
        "directing_intent": "코치의 따뜻한 인정과 세 사람의 유대감을 전달한다",
        "shot_type": "Medium shot",
        "camera_move": "Slowly pushing in",
        "image_prompt": "Medium shot, the Brazilian fighter patting the Korean fighter's shoulder with a genuine laugh, the Korean female coach in black sports jacket visible at the edge of the dojo with a proud warm expression, dust settling peacefully in golden light between them all, intimate warm atmosphere, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "미디엄샷. 라파엘이 강현 어깨 두드리며 웃고, 가장자리에 수아가 자랑스러운 표정. 금빛 속 따뜻한 분위기.",
        "video_prompt": "0~5s: Medium shot, slowly pushing in. The Brazilian fighter pats the Korean fighter on the shoulder with a genuine laugh, from the edge of the dojo the Korean female coach in black sports jacket calls out warmly, dust settles peacefully in the golden light. --no BGM, no music, no soundtrack",
        "video_ko_description": "미디엄, 푸시인. 라파엘이 어깨 두드리며 웃고, 수아가 따뜻하게 말한다. 금빛 속 먼지 가라앉음.",
        "audio_description": "0~2s: Shoulder pat and warm laughter. 2~4s: Dust settling softly. 4~5s: Female voice calling out warmly.",
        "dialogue": "3~5s: 수아: \\"잘 싸웠어 둘 다\\"",
        "dialogue_language": "한국어"
      }
    },
    {
      "id": 5,
      "scene_title": "에너지 보충",
      "narrative_phase": "결",
      "character_id": "char_01",
      "environment_id": "env_01",
      "transition_to_next": "매치컷 (캔 클로즈업 → 석양 속 캔)",
      "video_main": {
        "id": "scene_05_main",
        "duration": "0~5s",
        "directing_intent": "제품을 자연스러운 일상 맥락 속에서 보여주고, 캐릭터와의 친밀한 관계를 전달한다",
        "shot_type": "Medium shot",
        "camera_move": "Slowly pushing in",
        "image_prompt": "Medium shot, inside the wooden dojo, the Korean martial artist in white dobok sitting on the wooden floor leaning against the wall with a tired peaceful expression, the Korean female coach in black sports jacket crouching beside him handing him a matte black energy drink can with gold logo, the Brazilian fighter in white pants sitting across holding an identical can with a relaxed grin, warm golden afternoon light, product clearly visible, relaxed intimate atmosphere, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "미디엄샷. 도장 벽에 기댄 강현에게 수아가 에너지 드링크를 건넨다. 맞은편 라파엘도 같은 캔. 따뜻한 금빛 속 편안한 분위기. 제품 선명.",
        "video_prompt": "0~5s: Medium shot, slowly pushing in. The Korean martial artist sits on the wooden floor leaning against the wall, the coach crouches beside him and holds out a matte black energy drink can with a soft clink, he takes it with a grateful nod and twists open the pull tab with a satisfying crisp pop and carbonation hiss, takes a long sip then exhales with relief. --no BGM, no music, no soundtrack",
        "video_ko_description": "미디엄 푸시인. 강현 벽에 기대앉고, 수아가 캔 건넨다. 딸깍 소리, 감사히 받아 풀탭 따며 팝 탄산 소리, 한 모금 마시고 안도의 숨.",
        "audio_description": "0~2s: Fabric rustling as coach crouches. 2~4s: Aluminum clink, crisp pop of pull tab, carbonation hiss. 4~5s: Long sip and relieved exhale.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_05_ext",
        "duration": "0~5s",
        "directing_intent": "제품을 프리미엄 히어로 모먼트로 클로즈업하면서 캐릭터 유대감을 유지한다",
        "shot_type": "Extreme close-up macro",
        "camera_move": "Smoothly orbiting around the can",
        "image_prompt": "Extreme close-up macro, a matte black energy drink can with gold logo held in a sweaty hand, condensation droplets on the metallic surface catching warm golden dojo sidelight, gold pull tab already opened, wooden dojo floor in soft bokeh background, product as absolute visual focal point, matte black and gold palette with warm amber ambient, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "매크로 클로즈업. 땀 젖은 손의 매트 블랙 캔, 결로 물방울 금빛 반사, 열린 풀탭. 배경 도장 보케. 제품이 절대적 시각 중심.",
        "video_prompt": "0~5s: Extreme close-up macro, smoothly orbiting around the can. Condensation droplets catch warm golden light rolling slowly down the metallic surface, the gold logo gleams as the can rotates, the Brazilian fighter's voice is heard off-screen raising his can in a casual toast. --no BGM, no music, no soundtrack",
        "video_ko_description": "매크로 오빗. 결로 물방울이 금빛에 금속 표면을 흐르고, 로고가 회전하며 빛남. 화면 밖 라파엘 목소리로 건배.",
        "audio_description": "0~2s: Faint condensation trickling on metal. 2~4s: Soft metallic gleam as logo catches light. 4~5s: Off-screen voice with warm laugh.",
        "dialogue": "3~5s: 라파엘 (off-screen): \\"좋은 경기였어 형\\"",
        "dialogue_language": "한국어"
      }
    },
    {
      "id": 6,
      "scene_title": "석양의 세 사람",
      "narrative_phase": "결",
      "character_id": null,
      "environment_id": "env_02",
      "transition_to_next": "페이드 아웃 (엔딩)",
      "video_main": {
        "id": "scene_06_main",
        "duration": "0~5s",
        "directing_intent": "세 사람의 동료애와 성취감을 석양의 스케일감으로 마무리한다",
        "shot_type": "Wide cinematic shot",
        "camera_move": "Crane shot slowly rising upward",
        "image_prompt": "Wide cinematic shot, traditional Korean stone courtyard at golden hour sunset, three figures standing side by side facing the sunset, center Korean martial artist in white dobok, left shirtless Brazilian fighter with towel on shoulder, right Korean female coach in black jacket with ponytail catching wind, all silhouetted against deep golden orange sunset with long dramatic shadows, stone lanterns and pine trees framing the scene, peaceful powerful atmosphere, deep golden amber palette, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "와이드 시네마틱. 석양빛 돌마당에 세 사람이 나란히 서서 석양을 바라봄. 실루엣과 긴 그림자. 평화롭고 강인한 동료애.",
        "video_prompt": "0~5s: Wide cinematic shot, crane shot slowly rising from ground level. The traditional Korean stone courtyard bathed in deep golden sunset light, three figures stand side by side facing the horizon, the Korean martial artist in center exhales peacefully, the Brazilian fighter adjusts his towel, the coach smiles as wind rustles pine trees, long shadows stretch toward camera. --no BGM, no music, no soundtrack",
        "video_ko_description": "와이드 크레인샷 상승. 석양빛 돌마당, 세 사람 나란히 석양 바라봄. 강현 평화로운 호흡, 라파엘 수건 고침, 수아 미소. 소나무 바람, 긴 그림자.",
        "audio_description": "0~2s: Gentle wind through pine trees. 2~4s: Distant temple bell rings once. 4~5s: Peaceful silence with faint wind.",
        "dialogue": "None",
        "dialogue_language": "No dialogue"
      },
      "video_extend": {
        "id": "scene_06_ext",
        "duration": "0~5s",
        "directing_intent": "대사로 내일을 약속하며 여운과 희망을 남긴다",
        "shot_type": "Medium shot",
        "camera_move": "Level angle, slowly pulling back",
        "image_prompt": "Medium shot, the three figures at the stone courtyard, the Brazilian fighter nudging the Korean fighter's arm playfully, the coach tucking hair behind her ear with a smile, deep golden sunset backlight creating warm silhouettes, intimate and warm farewell atmosphere, cinematic film grain 16:9. --no text, letters, watermark",
        "image_ko_description": "미디엄샷. 라파엘이 강현 팔을 장난스럽게 찌르고, 수아가 머리카락 넘기며 미소. 금빛 역광 실루엣. 따뜻한 여운.",
        "video_prompt": "0~5s: Medium shot, level angle, slowly pulling back. The Brazilian fighter nudges the Korean fighter's arm playfully, the coach tucks hair behind her ear smiling, the camera pulls back revealing the full sunset landscape, warm golden light envelops all three as the scene fades to warmth and silence. --no BGM, no music, no soundtrack",
        "video_ko_description": "미디엄, 천천히 풀백. 라파엘 장난스럽게 팔 찌르고, 수아 미소. 풀백하며 석양 전체 드러남. 따뜻한 정적으로 마무리.",
        "audio_description": "0~2s: Playful arm nudge and soft laugh. 2~4s: Wind through hair, pine rustle. 4~5s: Warm silence settling.",
        "dialogue": "2~4s: 강현: \\"내일 또 하자\\" / 라파엘: \\"당연하지\\"",
        "dialogue_language": "한국어"
      }
    }
  ]
}`;

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const updatePrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, prompt: newPrompt } : p));
  };

  const updateVideoMainPrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? {
      ...p,
      prompt: newPrompt,
      video_main: p.video_main ? { ...p.video_main, prompt: newPrompt } : undefined,
    } : p));
  };

  const updateVideoExtendPrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? {
      ...p,
      video_extend: p.video_extend ? { ...p.video_extend, prompt: newPrompt } : undefined,
    } : p));
  };

  const updateImageMainPrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? {
      ...p,
      prompt: newPrompt,
      image_main: p.image_main ? { ...p.image_main, prompt: newPrompt } : undefined,
    } : p));
  };

  const updateImageExtendPrompt = (id: number, newPrompt: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? {
      ...p,
      image_extend: p.image_extend ? { ...p.image_extend, prompt: newPrompt } : undefined,
    } : p));
  };

  const pasteToPrompt = (id: number) => {
    navigator.clipboard.readText().then(text => {
      updatePrompt(id, text);
    });
  };

  const copyText = (text: string, key?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      if (key !== undefined) {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
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
        {prompts.map((scene) => {
          const isVideoSplit = subPage === 'video' && scene.video_main;
          const isImageSplit = subPage === 'image' && scene.image_main;
          const isSplit = isVideoSplit || isImageSplit;
          const mainData = isVideoSplit ? scene.video_main! : isImageSplit ? scene.image_main! : null;
          const extData = isVideoSplit ? scene.video_extend : isImageSplit ? scene.image_extend : null;
          const onUpdateMain = isVideoSplit ? updateVideoMainPrompt : updateImageMainPrompt;
          const onUpdateExt = isVideoSplit ? updateVideoExtendPrompt : updateImageExtendPrompt;
          const SplitIcon = subPage === 'video' ? Film : ImageIcon;

          return (
            <div key={scene.id} className="neo-card-static rounded-xl overflow-hidden">
              {/* Card Header */}
              <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground flex items-center justify-between bg-content4">
                <div className="flex items-center gap-2.5">
                  <span className="memphis-badge-secondary text-xs font-bold px-2 py-0.5 rounded-md">
                    #{scene.id}
                  </span>
                  <span className="text-sm md:text-base font-medium text-foreground">{scene.scene_title}</span>
                </div>
                {!isSplit && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => pasteToPrompt(scene.id)}
                      className="neo-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                    >
                      <ClipboardPaste className="w-3 h-3" />
                      붙여넣기
                    </button>
                    <button
                      onClick={() => copyText(scene.prompt, String(scene.id))}
                      className="neo-btn px-2 py-1 flex items-center gap-1.5 rounded-lg text-xs"
                    >
                      {copiedKey === String(scene.id) ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === String(scene.id) ? '복사됨' : '복사'}
                    </button>
                  </div>
                )}
              </div>

              {isSplit && mainData ? (
                /* Split View: 메인컷 / 연장컷 — grid로 행 높이 동기화 */
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Row 1: Section headers with copy buttons */}
                  <div className="order-1 lg:order-none px-3 md:px-4 py-1.5 bg-primary/10 text-[11px] font-bold text-primary uppercase tracking-wide border-b-2 border-foreground/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <SplitIcon className="w-3 h-3" />
                      메인컷
                    </div>
                    <button
                      onClick={() => copyText(mainData.prompt, `${scene.id}-main`)}
                      className="neo-btn px-2 py-0.5 flex items-center gap-1 rounded text-[10px]"
                    >
                      {copiedKey === `${scene.id}-main` ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === `${scene.id}-main` ? '복사됨' : '복사'}
                    </button>
                  </div>
                  <div className="order-4 lg:order-none px-3 md:px-4 py-1.5 bg-secondary/10 text-[11px] font-bold text-secondary uppercase tracking-wide border-b-2 border-foreground/10 flex items-center justify-between lg:border-l-3 border-foreground/15 border-t-3 lg:border-t-0">
                    <div className="flex items-center gap-1.5">
                      <SplitIcon className="w-3 h-3" />
                      연장컷
                    </div>
                    <button
                      onClick={() => copyText(extData?.prompt || '', `${scene.id}-ext`)}
                      className="neo-btn px-2 py-0.5 flex items-center gap-1 rounded text-[10px]"
                    >
                      {copiedKey === `${scene.id}-ext` ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                      {copiedKey === `${scene.id}-ext` ? '복사됨' : '복사'}
                    </button>
                  </div>

                  {/* Row 2: Korean descriptions — 같은 행이므로 높이 자동 동기화 */}
                  <div className="order-2 lg:order-none p-3 md:p-4 border-b-2 border-foreground/10">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">한국어 설명</div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{mainData.ko_description}</p>
                  </div>
                  <div className="order-5 lg:order-none p-3 md:p-4 border-b-2 border-foreground/10 lg:border-l-3 border-foreground/15">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">한국어 설명</div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{extData?.ko_description || ''}</p>
                  </div>

                  {/* Row 3: English prompts */}
                  <div className="order-3 lg:order-none p-3 md:p-4 bg-content2">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">English Prompt</div>
                    <textarea
                      value={mainData.prompt}
                      onChange={(e) => onUpdateMain(scene.id, e.target.value)}
                      className="memphis-input w-full text-sm leading-relaxed font-mono whitespace-pre-wrap rounded-lg p-2 resize-y min-h-[60px]"
                      rows={3}
                    />
                  </div>
                  <div className="order-6 lg:order-none p-3 md:p-4 bg-content2 lg:border-l-3 border-foreground/15">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">English Prompt</div>
                    <textarea
                      value={extData?.prompt || ''}
                      onChange={(e) => onUpdateExt(scene.id, e.target.value)}
                      className="memphis-input w-full text-sm leading-relaxed font-mono whitespace-pre-wrap rounded-lg p-2 resize-y min-h-[60px]"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                /* Default View: Korean / English split */
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 p-3 md:p-4 md:border-r-2 border-b-2 md:border-b-0 border-foreground/20">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">한국어 설명</div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{scene.ko_description}</p>
                  </div>
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


// --- Image Drop Zone Component ---

const ImageDropZone = ({ onImage }: { onImage: (dataUrl: string) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragCounter = React.useRef(0);
  const zoneRef = React.useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleFile(file);
        return;
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  return (
    <div
      ref={zoneRef}
      tabIndex={0}
      className={`flex flex-col items-center justify-center w-full h-32 border-3 border-dashed rounded-lg transition-all outline-none select-none ${
        isDragging
          ? 'border-primary bg-primary/10'
          : isFocused
            ? 'border-primary/60 bg-primary/5 ring-2 ring-primary/30'
            : 'border-foreground/30 hover:border-foreground/50 hover:bg-foreground/5'
      }`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => { if (!zoneRef.current?.contains(e.relatedTarget as Node)) setIsFocused(false); }}
    >
      {isDragging ? (
        <>
          <ImagePlus className="w-8 h-8 mb-1 text-primary pointer-events-none" />
          <span className="text-[10px] text-primary font-bold pointer-events-none">여기에 놓으세요</span>
        </>
      ) : isFocused ? (
        <>
          <ClipboardPaste className="w-6 h-6 mb-1.5 text-primary/60 pointer-events-none" />
          <span className="text-[10px] text-primary/70 font-medium pointer-events-none mb-1.5">Ctrl+V 붙여넣기 대기 중...</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
            className="neo-btn px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1"
          >
            <Upload className="w-3 h-3" />
            파일 업로드
          </button>
        </>
      ) : (
        <>
          <ImagePlus className="w-8 h-8 mb-1 text-foreground/30 pointer-events-none" />
          <span className="text-[10px] text-foreground/40 pointer-events-none">클릭하여 선택 · 드래그 · 붙여넣기</span>
        </>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
      }} />
    </div>
  );
};

// --- ConceptArt Content Component ---

const ConceptArtContent = ({
  conceptArtData,
  setConceptArtData,
  onUpload,
}: {
  conceptArtData: ConceptArtData;
  setConceptArtData: React.Dispatch<React.SetStateAction<ConceptArtData>>;
  onUpload: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<ConceptArtTab>('characters');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const restoreInputRef = React.useRef<HTMLInputElement>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const handleBackup = () => {
    const json = JSON.stringify(conceptArtData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conceptart-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data && (data.characters || data.environments || data.products || data.group_shots)) {
          setConceptArtData({
            characters: data.characters || [],
            environments: data.environments || [],
            products: data.products || [],
            group_shots: data.group_shots || [],
          });
        } else {
          alert('유효하지 않은 컨셉아트 백업 파일입니다.');
        }
      } catch {
        alert('JSON 파일을 파싱할 수 없습니다.');
      }
    };
    reader.readAsText(file);
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  const updateCharImage = (charIdx: number, imgIdx: number, dataUrl: string | undefined) => {
    setConceptArtData(prev => ({
      ...prev,
      characters: prev.characters.map((c, ci) => ci !== charIdx ? c : {
        ...c,
        master_images: c.master_images.map((m, mi) => mi !== imgIdx ? m : { ...m, uploaded_image: dataUrl })
      })
    }));
  };

  const updateProductImage = (prodIdx: number, imgIdx: number, dataUrl: string | undefined) => {
    setConceptArtData(prev => ({
      ...prev,
      products: prev.products.map((p, pi) => pi !== prodIdx ? p : {
        ...p,
        master_images: p.master_images.map((m, mi) => mi !== imgIdx ? m : { ...m, uploaded_image: dataUrl })
      })
    }));
  };

  const updateGroupShotImage = (gsIdx: number, dataUrl: string | undefined) => {
    setConceptArtData(prev => ({
      ...prev,
      group_shots: prev.group_shots.map((g, gi) => gi !== gsIdx ? g : { ...g, uploaded_image: dataUrl })
    }));
  };

  const updateEnvImage = (envIdx: number, dataUrl: string | undefined) => {
    setConceptArtData(prev => ({
      ...prev,
      environments: prev.environments.map((e, ei) => ei !== envIdx ? e : { ...e, uploaded_image: dataUrl })
    }));
  };

  const updateEnvMasterImage = (envIdx: number, imgIdx: number, dataUrl: string | undefined) => {
    setConceptArtData(prev => ({
      ...prev,
      environments: prev.environments.map((e, ei) => ei !== envIdx ? e : {
        ...e,
        master_images: e.master_images.map((m, mi) => mi !== imgIdx ? m : { ...m, uploaded_image: dataUrl })
      })
    }));
  };

  const hasData = conceptArtData.characters.length > 0 || conceptArtData.environments.length > 0 || conceptArtData.products.length > 0;

  if (!hasData) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center neo-card-static">
            <Palette className="w-10 h-10 text-foreground/50" />
          </div>
          <p className="text-lg font-bold text-foreground/70 mb-2">컨셉아트 데이터가 없습니다</p>
          <p className="text-sm text-foreground/50 mb-5">전체 스토리보드 JSON을 업로드하여<br/>캐릭터/환경/제품 정보를 확인하세요.</p>
          <button onClick={onUpload} className="neo-btn neo-btn-primary px-5 py-2.5 rounded-lg flex items-center gap-2 mx-auto text-sm font-medium">
            <Upload className="w-4 h-4" />
            스토리보드 JSON 업로드
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: ConceptArtTab; label: string; count: number; bgActive: string }[] = [
    { key: 'characters', label: '캐릭터', count: conceptArtData.characters.length + conceptArtData.group_shots.length, bgActive: 'bg-content3' },
    { key: 'environments', label: '환경', count: conceptArtData.environments.length, bgActive: 'bg-content4' },
    { key: 'products', label: '제품', count: conceptArtData.products.length, bgActive: 'bg-content2' },
  ];

  const ImageRow = ({ koText, enText, copyKey, image, onImage, onImageRemove }: {
    koText: string; enText: string; copyKey: string; image?: string;
    onImage: (dataUrl: string) => void;
    onImageRemove: () => void;
  }) => (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/3 p-3 lg:border-r-2 border-b-2 lg:border-b-0 border-foreground/10">
        <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">한국어 설명</div>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{koText}</p>
      </div>
      <div className="w-full lg:w-1/3 p-3 lg:border-r-2 border-b-2 lg:border-b-0 border-foreground/10 bg-content2">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-foreground/40 font-medium">English Prompt</div>
          <button onClick={() => copyText(enText, copyKey)} className="neo-btn px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
            {copiedKey === copyKey ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
            {copiedKey === copyKey ? '복사됨' : '복사'}
          </button>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed font-mono whitespace-pre-wrap">{enText}</p>
      </div>
      <div className="w-full lg:w-1/3 p-3">
        <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">생성 이미지</div>
        {image ? (
          <div className="relative group">
            <img src={image} alt="concept" className="w-full rounded-lg border-2 border-foreground/20 object-cover" />
            <button onClick={onImageRemove} className="absolute top-1 right-1 neo-btn neo-btn-danger p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <ImageDropZone onImage={onImage} />
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 md:p-6 gap-4">
      {/* Header */}
      <div className="shrink-0 neo-card-static rounded-xl p-3 md:p-4">
        <div className="flex items-center gap-3 mb-3">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-base md:text-lg font-black text-foreground uppercase">컨셉아트</h3>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleBackup} className="neo-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5" title="백업 (JSON 다운로드)">
              <Download className="w-3.5 h-3.5" />
              백업
            </button>
            <button onClick={() => restoreInputRef.current?.click()} className="neo-btn px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5" title="복원 (JSON 업로드)">
              <Upload className="w-3.5 h-3.5" />
              복원
            </button>
            <input ref={restoreInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleRestore} />
          </div>
        </div>
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.key
                  ? `${tab.bgActive} border-3 border-foreground shadow-neo-sm`
                  : 'border-3 border-foreground/20 hover:border-foreground/40 text-foreground/60'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="memphis-badge text-[10px] px-1.5 py-0.5 rounded-full font-bold">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <>
            {conceptArtData.characters.map((char, charIdx) => (
              <div key={char.id} className="neo-card-static rounded-xl overflow-hidden animate-card-enter">
                <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground bg-content3 flex items-center gap-2">
                  <span className="memphis-badge-secondary text-xs font-bold px-2 py-0.5 rounded-md">{char.id}</span>
                  <span className="text-sm md:text-base font-bold text-foreground">{char.name}</span>
                  <span className="text-xs text-foreground/50">({char.role})</span>
                </div>
                <div className="px-3 md:px-4 py-2 border-b-2 border-foreground/10 bg-content2/50">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
                    {Object.entries(char.card).map(([k, v]) => (
                      <span key={k}><span className="font-bold text-foreground/70">{k}:</span> {v}</span>
                    ))}
                  </div>
                </div>
                {char.master_images.map((img, imgIdx) => (
                  <div key={img.type} className="border-b-2 border-foreground/10 last:border-b-0">
                    <div className="px-3 md:px-4 py-1.5 bg-foreground/5 text-[11px] font-bold text-foreground/50 uppercase tracking-wide">
                      {img.label}
                    </div>
                    <ImageRow
                      koText={img.image_ko_description}
                      enText={img.image_prompt}
                      copyKey={`${char.id}-${img.type}`}
                      image={img.uploaded_image}
                      onImage={(url) => updateCharImage(charIdx, imgIdx, url)}
                      onImageRemove={() => updateCharImage(charIdx, imgIdx, undefined)}
                    />
                  </div>
                ))}
              </div>
            ))}
            {conceptArtData.group_shots.length > 0 && (
              <div className="neo-card-static rounded-xl overflow-hidden animate-card-enter">
                <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground bg-content4 flex items-center gap-2">
                  <span className="text-sm md:text-base font-bold text-foreground">그룹샷</span>
                  <span className="memphis-badge text-[10px] px-1.5 py-0.5 rounded-full font-bold">{conceptArtData.group_shots.length}</span>
                </div>
                {conceptArtData.group_shots.map((gs, gsIdx) => (
                  <div key={gsIdx} className="border-b-2 border-foreground/10 last:border-b-0">
                    <div className="px-3 md:px-4 py-1.5 bg-foreground/5 text-[11px] font-bold text-foreground/50 uppercase tracking-wide">
                      {gs.label}
                    </div>
                    <ImageRow
                      koText={gs.image_ko_description}
                      enText={gs.image_prompt}
                      copyKey={`group-${gsIdx}`}
                      image={gs.uploaded_image}
                      onImage={(url) => updateGroupShotImage(gsIdx, url)}
                      onImageRemove={() => updateGroupShotImage(gsIdx, undefined)}
                    />
                  </div>
                ))}
              </div>
            )}
            {conceptArtData.characters.length === 0 && conceptArtData.group_shots.length === 0 && (
              <div className="text-center py-12 text-foreground/40 text-sm">등록된 캐릭터가 없습니다.</div>
            )}
          </>
        )}

        {/* Environments Tab */}
        {activeTab === 'environments' && (
          <>
            {conceptArtData.environments.map((env, envIdx) => (
              <div key={env.id} className="neo-card-static rounded-xl overflow-hidden animate-card-enter">
                <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground bg-content4 flex items-center gap-2">
                  <span className="memphis-badge-secondary text-xs font-bold px-2 py-0.5 rounded-md">{env.id}</span>
                  <span className="text-sm md:text-base font-bold text-foreground">{env.name}</span>
                </div>
                {/* Card Summary */}
                <div className="px-3 md:px-4 py-2 border-b-2 border-foreground/10 bg-content2/50">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
                    {Object.entries(env.card).map(([k, v]) => (
                      <span key={k}><span className="font-bold text-foreground/70">{k}:</span> {v}</span>
                    ))}
                  </div>
                </div>
                {/* Effects */}
                {(env.allowed_effects.length > 0 || env.blocked_effects.length > 0) && (
                  <div className="px-3 md:px-4 py-2 border-b-2 border-foreground/10 flex flex-wrap gap-2 items-center">
                    {env.allowed_effects.map((eff, i) => (
                      <span key={`a-${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-foreground/70">{eff}</span>
                    ))}
                    {env.blocked_effects.map((eff, i) => (
                      <span key={`b-${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-danger/10 border border-danger/30 text-foreground/70 line-through">{eff}</span>
                    ))}
                  </div>
                )}
                {/* Master Images */}
                {env.master_images.length > 0 ? (
                  env.master_images.map((img, imgIdx) => (
                    <div key={img.type} className="border-b-2 border-foreground/10 last:border-b-0">
                      <div className="px-3 md:px-4 py-1.5 bg-foreground/5 text-[11px] font-bold text-foreground/50 uppercase tracking-wide">
                        {img.label}
                      </div>
                      <ImageRow
                        koText={img.image_ko_description}
                        enText={img.image_prompt}
                        copyKey={`${env.id}-${img.type}`}
                        image={img.uploaded_image}
                        onImage={(url) => updateEnvMasterImage(envIdx, imgIdx, url)}
                        onImageRemove={() => updateEnvMasterImage(envIdx, imgIdx, undefined)}
                      />
                    </div>
                  ))
                ) : (
                  /* Fallback: single image upload for environments without master_images */
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-wider text-foreground/40 mb-2 font-medium">레퍼런스 이미지</div>
                    {env.uploaded_image ? (
                      <div className="relative group">
                        <img src={env.uploaded_image} alt={env.name} className="w-full rounded-lg border-2 border-foreground/20 object-cover" />
                        <button onClick={() => updateEnvImage(envIdx, undefined)} className="absolute top-1 right-1 neo-btn neo-btn-danger p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <ImageDropZone onImage={(url) => updateEnvImage(envIdx, url)} />
                    )}
                  </div>
                )}
              </div>
            ))}
            {conceptArtData.environments.length === 0 && (
              <div className="text-center py-12 text-foreground/40 text-sm">등록된 환경이 없습니다.</div>
            )}
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {conceptArtData.products.map((prod, prodIdx) => (
              <div key={prod.id} className="neo-card-static rounded-xl overflow-hidden animate-card-enter">
                <div className="px-3 md:px-4 py-2.5 md:py-3 border-b-3 border-foreground bg-content2 flex items-center gap-2">
                  <span className="memphis-badge-secondary text-xs font-bold px-2 py-0.5 rounded-md">{prod.id}</span>
                  <span className="text-sm md:text-base font-bold text-foreground">{prod.name}</span>
                </div>
                <div className="px-3 md:px-4 py-2 border-b-2 border-foreground/10 bg-content2/50">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/60">
                    {Object.entries(prod.card).map(([k, v]) => (
                      <span key={k}><span className="font-bold text-foreground/70">{k}:</span> {v}</span>
                    ))}
                  </div>
                </div>
                {prod.master_images.map((img, imgIdx) => (
                  <div key={img.type} className="border-b-2 border-foreground/10 last:border-b-0">
                    <div className="px-3 md:px-4 py-1.5 bg-foreground/5 text-[11px] font-bold text-foreground/50 uppercase tracking-wide">
                      {img.label}
                    </div>
                    <ImageRow
                      koText={img.image_ko_description}
                      enText={img.image_prompt}
                      copyKey={`${prod.id}-${img.type}`}
                      image={img.uploaded_image}
                      onImage={(url) => updateProductImage(prodIdx, imgIdx, url)}
                      onImageRemove={() => updateProductImage(prodIdx, imgIdx, undefined)}
                    />
                  </div>
                ))}
              </div>
            ))}
            {conceptArtData.products.length === 0 && (
              <div className="text-center py-12 text-foreground/40 text-sm">등록된 제품이 없습니다.</div>
            )}
          </>
        )}
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

// --- Audio Separator Component ---

type AudioSepState = 'idle' | 'loading-model' | 'separating' | 'done' | 'error';
const FILE_ACCEPT = 'audio/*,video/*,.mp3,.wav,.flac,.ogg,.m4a,.mp4,.webm,.mov';
const PX_PER_SEC_BASE = 100;
const TRACK_HEIGHT = 64;
const LABEL_W = 100;
const TOGGLE_W = 44;
const TIMELINE_PAD = 8;

interface SepTrack {
  id: string;
  type: 'video' | 'vocals' | 'instrumental';
  name: string;
  blob: Blob;
  url: string;
  color: string;
  active: boolean;
  thumbnails?: string[];
}

// Helper: get video metadata
async function getVideoMeta(file: File): Promise<{ duration: number }> {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.playsInline = true;
    v.muted = true;
    const t = setTimeout(() => { URL.revokeObjectURL(v.src); reject(new Error('시간 초과')); }, 15000);
    v.onloadedmetadata = () => { clearTimeout(t); resolve({ duration: v.duration }); URL.revokeObjectURL(v.src); };
    v.onerror = () => { clearTimeout(t); reject(new Error('메타데이터 읽기 실패')); URL.revokeObjectURL(v.src); };
    v.src = URL.createObjectURL(file);
    v.load();
  });
}

// Helper: generate thumbnails from video
async function genThumbnails(videoUrl: string, duration: number, count = 10): Promise<string[]> {
  const v = document.createElement('video');
  v.playsInline = true; v.muted = true; v.preload = 'auto'; v.src = videoUrl;
  await new Promise<void>(r => { const t = setTimeout(r, 8000); v.onloadeddata = () => { clearTimeout(t); r(); }; v.load(); });
  const thumbs: string[] = [];
  const interval = duration / count;
  for (let i = 0; i < count; i++) {
    v.currentTime = i * interval;
    await new Promise<void>(r => { const t = setTimeout(r, 3000); v.onseeked = () => { clearTimeout(t); r(); }; });
    try {
      const c = document.createElement('canvas'); c.width = 160; c.height = 90;
      c.getContext('2d')!.drawImage(v, 0, 0, 160, 90);
      thumbs.push(c.toDataURL('image/jpeg', 0.7));
    } catch { thumbs.push(''); }
  }
  return thumbs;
}

// Thumbnail strip
const ThumbnailStrip = ({ thumbnails }: { thumbnails: string[] }) => {
  if (!thumbnails.length) return <div className="w-full h-full bg-content2" />;
  return (
    <div className="w-full h-full flex overflow-hidden">
      {thumbnails.map((thumb, i) => (
        <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / thumbnails.length}%` }}>
          <img src={thumb} alt="" className="w-full h-full object-cover" draggable={false} />
        </div>
      ))}
    </div>
  );
};

// Waveform canvas
const WaveformCanvas = ({ blob, color }: { blob: Blob | null; color: string }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (!blob || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const draw = async () => {
      const audioCtx = new AudioContext({ sampleRate: 44100 });
      try {
        const ab = await blob.arrayBuffer();
        const audioBuf = await audioCtx.decodeAudioData(ab);
        const data = audioBuf.getChannelData(0);

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const w = rect.width;
        const h = rect.height;
        const step = Math.ceil(data.length / w);
        const mid = h / 2;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.75;

        for (let x = 0; x < w; x++) {
          const start = x * step;
          let min = 0, max = 0;
          for (let j = 0; j < step && start + j < data.length; j++) {
            const val = data[start + j];
            if (val < min) min = val;
            if (val > max) max = val;
          }
          const top = mid + min * mid;
          const bottom = mid + max * mid;
          ctx.fillRect(x, top, 1, Math.max(1, bottom - top));
        }
      } finally {
        await audioCtx.close();
      }
    };
    draw().catch(console.error);
  }, [blob, color]);

  if (!blob) return <div className="w-full h-full" />;
  return <canvas ref={canvasRef} className="w-full h-full" />;
};

// Format time as mm:ss.cc
const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const cs = Math.floor((s % 1) * 100);
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};

const AudioSeparatorContent = () => {
  const [state, setState] = React.useState<AudioSepState>('idle');
  const [fileName, setFileName] = React.useState('');
  const [progressPct, setProgressPct] = React.useState(0);
  const [progressMsg, setProgressMsg] = React.useState('');
  const [error, setError] = React.useState('');
  const [dragging, setDragging] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  // Video state
  const [videoUrl, setVideoUrl] = React.useState<string>('');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Playback state
  const [tracks, setTracks] = React.useState<SepTrack[]>([]);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [zoom, setZoom] = React.useState(1);
  const audioRefs = React.useRef<Map<string, HTMLAudioElement>>(new Map());
  const rafRef = React.useRef<number>(0);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const [isDraggingHead, setIsDraggingHead] = React.useState(false);
  const isVideoMode = !!videoUrl;

  const pxPerSec = PX_PER_SEC_BASE * zoom;
  const timelineWidth = duration * pxPerSec;

  // Sync loop — use video as master clock when available
  const startSync = React.useCallback(() => {
    if (rafRef.current) return;
    const tick = () => {
      const video = videoRef.current;
      const audioEls: HTMLAudioElement[] = [...audioRefs.current.values()];
      // Master clock: video if video mode, else first playing audio
      const playingAudio = audioEls.find(el => !el.paused && !el.ended);
      const masterTime = video && !video.paused ? video.currentTime : playingAudio?.currentTime;
      if (masterTime === undefined) { rafRef.current = 0; return; }
      // Stop if all sources are paused/ended
      const videoPaused = !video || video.paused;
      const allAudioPaused = audioEls.every(el => el.paused || el.ended);
      if (videoPaused && allAudioPaused) { rafRef.current = 0; return; }
      setCurrentTime(masterTime);
      for (const el of audioEls) {
        if (!el.paused && Math.abs(el.currentTime - masterTime) > 0.05) el.currentTime = masterTime;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopSync = React.useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
  }, []);

  const togglePlay = React.useCallback(() => {
    const video = videoRef.current;
    const allEls: HTMLAudioElement[] = [...audioRefs.current.values()];
    const els = allEls.filter(el => {
      const track = tracks.find(t => t.type !== 'video' && t.url === el.src);
      return track?.active !== false;
    });
    const videoTrack = tracks.find(t => t.type === 'video');
    if (isPlaying) {
      stopSync();
      if (video) video.pause();
      els.forEach(el => el.pause());
      setIsPlaying(false);
    } else {
      const t = currentTime;
      if (video && videoTrack?.active) { video.currentTime = t; video.play().catch(() => {}); }
      els.forEach(el => { el.currentTime = t; el.play().catch(() => {}); });
      startSync();
      setIsPlaying(true);
    }
  }, [isPlaying, currentTime, tracks, startSync, stopSync]);

  const seekTo = React.useCallback((t: number) => {
    const clamped = Math.max(0, Math.min(duration, t));
    setCurrentTime(clamped);
    const video = videoRef.current;
    if (video) video.currentTime = clamped;
    audioRefs.current.forEach(el => { el.currentTime = clamped; });
  }, [duration]);

  // Handle ended
  React.useEffect(() => {
    const handler = () => {
      stopSync();
      if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
      audioRefs.current.forEach(el => { el.pause(); el.currentTime = 0; });
      setIsPlaying(false);
      setCurrentTime(0);
    };
    // Listen on all audio elements + video so any ending triggers stop
    const targets: HTMLMediaElement[] = [];
    if (videoRef.current) targets.push(videoRef.current);
    audioRefs.current.forEach(el => targets.push(el));
    targets.forEach(el => el.addEventListener('ended', handler));
    return () => { targets.forEach(el => el.removeEventListener('ended', handler)); };
  }, [tracks, stopSync]);

  // Video muted (audio comes from audio elements)
  React.useEffect(() => {
    if (videoRef.current) videoRef.current.muted = true;
  });

  // Sync video seek when paused
  React.useEffect(() => {
    if (isPlaying || !videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - currentTime) > 0.05) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // Volume sync
  React.useEffect(() => {
    audioRefs.current.forEach(el => { el.volume = volume; });
  }, [volume]);

  // Toggle track active
  const toggleTrack = React.useCallback((id: string) => {
    setTracks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, active: !t.active };
      if (t.type === 'video') {
        // video track toggle handled via CSS opacity
      } else {
        const el = audioRefs.current.get(id);
        if (el) {
          if (next.active && isPlaying) { el.currentTime = currentTime; el.play().catch(() => {}); }
          else el.pause();
        }
      }
      return next;
    }));
  }, [isPlaying, currentTime]);

  // Time ruler ticks
  const rulerTicks = React.useMemo(() => {
    if (!duration) return [];
    const minPx = 60;
    const intervals = [0.5, 1, 2, 5, 10, 15, 30, 60];
    let interval = intervals.find(i => i * pxPerSec >= minPx) || 60;
    const ticks: { time: number; x: number }[] = [];
    for (let t = 0; t <= duration; t += interval) {
      ticks.push({ time: t, x: t * pxPerSec + TIMELINE_PAD });
    }
    return ticks;
  }, [duration, pxPerSec]);

  // Timeline click-to-seek
  const handleTimelineClick = React.useCallback((e: React.MouseEvent) => {
    if (isDraggingHead) return;
    const container = timelineRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft - TIMELINE_PAD;
    seekTo(x / pxPerSec);
  }, [pxPerSec, seekTo, isDraggingHead]);

  // Playhead drag
  const handlePlayheadDown = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingHead(true);
    const wasPlaying = isPlaying;
    if (isPlaying) { stopSync(); audioRefs.current.forEach(el => el.pause()); setIsPlaying(false); }

    const move = (clientX: number) => {
      const container = timelineRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left + container.scrollLeft - TIMELINE_PAD;
      seekTo(x / pxPerSec);
    };

    const onMouseMove = (ev: MouseEvent) => move(ev.clientX);
    const onTouchMove = (ev: TouchEvent) => move(ev.touches[0].clientX);
    const onUp = () => {
      setIsDraggingHead(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
      if (wasPlaying) {
        const allEls2: HTMLAudioElement[] = [...audioRefs.current.values()];
        const els = allEls2.filter(el => {
          const track = tracks.find(t => t.url === el.src);
          return track?.active !== false;
        });
        els.forEach(el => { el.play().catch(() => {}); });
        startSync();
        setIsPlaying(true);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onUp);
  }, [isPlaying, pxPerSec, seekTo, startSync, stopSync, tracks]);

  // Zoom with ctrl+scroll
  React.useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => Math.max(0.2, Math.min(8, z * (e.deltaY < 0 ? 1.15 : 1 / 1.15))));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [state]);

  // Download handler
  const handleDownload = React.useCallback((track: SepTrack) => {
    const a = document.createElement('a');
    a.href = track.url;
    a.download = `${fileName.replace(/\.[^.]+$/, '')}_${track.name}.wav`;
    a.click();
  }, [fileName]);

  const computeOverallProgress = React.useCallback((p: StemProgress) => {
    let overall = 0;
    switch (p.stage) {
      case 'download': overall = p.progress * 0.3; break;
      case 'extract': overall = 30 + p.progress * 0.05; break;
      case 'separate': overall = 35 + p.progress * 0.55; break;
      case 'encode': overall = 90 + p.progress * 0.1; break;
    }
    setProgressPct(Math.min(100, overall));
    setProgressMsg(p.message);
  }, []);

  const processFile = React.useCallback(async (file: File) => {
    setFileName(file.name);
    setError('');
    setTracks([]);
    setCurrentTime(0);
    setIsPlaying(false);
    setVideoUrl('');
    stopSync();

    const isVideo = file.type.startsWith('video/');

    try {
      let dur = 0;
      let thumbnails: string[] = [];
      let vidUrl = '';
      let audioBlob: Blob = file;

      if (isVideo) {
        // 1. Get video metadata + thumbnails
        setState('loading-model');
        setProgressPct(0);
        setProgressMsg('영상 분석 중...');
        const meta = await getVideoMeta(file);
        dur = meta.duration;
        vidUrl = URL.createObjectURL(file);
        setVideoUrl(vidUrl);
        setDuration(dur);

        setProgressMsg('썸네일 생성 중...');
        setProgressPct(3);
        thumbnails = await genThumbnails(vidUrl, dur, 10);

        // 2. Load FFmpeg + extract audio (progress 5-25%)
        setProgressMsg('FFmpeg 로딩 중...');
        setProgressPct(5);
        if (!videoEngine.isLoaded()) {
          await videoEngine.load((p) => {
            setProgressPct(5 + p * 0.1);
            setProgressMsg('FFmpeg 로딩 중...');
          });
        }
        setProgressMsg('오디오 추출 중...');
        setProgressPct(15);
        audioBlob = await videoEngine.extractAudioFromFile(file);
        setProgressPct(25);

        // 3. Load stem separator model (25-40%)
        setProgressMsg('AI 모델 준비 중...');
        await stemSeparator.load((p) => {
          if (p.stage === 'download') setProgressPct(25 + p.progress * 0.15);
          setProgressMsg(p.message);
        });
      } else {
        // Audio file: get duration via Web Audio API
        setState('loading-model');
        setProgressPct(0);
        setProgressMsg('AI 모델 로딩 중...');
        await stemSeparator.load(computeOverallProgress);
      }

      // 4. Separate stems
      setState('separating');
      setProgressMsg('음원 분리 시작...');
      const result = await stemSeparator.separate(audioBlob, (p) => {
        if (isVideo) {
          let overall = 40;
          if (p.stage === 'extract') overall = 40 + p.progress * 0.05;
          else if (p.stage === 'separate') overall = 45 + p.progress * 0.45;
          else if (p.stage === 'encode') overall = 90 + p.progress * 0.1;
          setProgressPct(Math.min(100, overall));
        } else {
          computeOverallProgress(p);
        }
        setProgressMsg(p.message);
      });

      // Get duration from audio if not video
      if (!isVideo) {
        const tmpCtx = new AudioContext({ sampleRate: 44100 });
        const ab = await result.vocals.arrayBuffer();
        const audioBuf = await tmpCtx.decodeAudioData(ab);
        dur = audioBuf.duration;
        await tmpCtx.close();
        setDuration(dur);
      }

      const vocalUrl = URL.createObjectURL(result.vocals);
      const instrUrl = URL.createObjectURL(result.instrumental);

      const newTracks: SepTrack[] = [];
      if (isVideo) {
        newTracks.push({
          id: 'video', type: 'video', name: '영상', blob: file, url: vidUrl,
          color: '#60a5fa', active: true, thumbnails,
        });
      }
      newTracks.push(
        { id: 'vocals', type: 'vocals', name: '보컬', blob: result.vocals, url: vocalUrl, color: '#4ade80', active: true },
        { id: 'instrumental', type: 'instrumental', name: '반주', blob: result.instrumental, url: instrUrl, color: '#fbbf24', active: true },
      );
      setTracks(newTracks);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setState('error');
    }
  }, [computeOverallProgress, stopSync]);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = React.useCallback(() => {
    stopSync();
    if (videoRef.current) videoRef.current.pause();
    audioRefs.current.forEach(el => el.pause());
    // Revoke non-video URLs (video URL might still be shared)
    tracks.forEach(t => { if (t.type !== 'video') URL.revokeObjectURL(t.url); });
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setState('idle');
    setFileName('');
    setProgressPct(0);
    setProgressMsg('');
    setError('');
    setTracks([]);
    setDuration(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setZoom(1);
    setVideoUrl('');
    if (fileRef.current) fileRef.current.value = '';
  }, [stopSync, tracks, videoUrl]);

  const displayName = fileName.replace(/\.[^.]+$/, '');
  const shortName = displayName.length > 30 ? displayName.slice(0, 27) + '...' : displayName;
  const playheadX = currentTime * pxPerSec + TIMELINE_PAD;

  // --- Idle ---
  if (state === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <div
            className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
              dragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-foreground/30 hover:border-foreground/60 bg-content1'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-foreground/40" />
            <p className="text-lg font-bold mb-2">영상 또는 오디오 파일을 드래그하거나 클릭하세요</p>
            <p className="text-sm text-foreground/50">MP4, WebM, MOV, MP3, WAV, FLAC, OGG, M4A</p>
            <input ref={fileRef} type="file" accept={FILE_ACCEPT} className="hidden" onChange={handleFileChange} />
          </div>
          <div className="mt-6 text-center text-xs text-foreground/30 space-y-1">
            <p>UVR-MDX-NET 기반 AI 음원분리 (보컬/반주)</p>
            <p>모든 처리는 브라우저에서 로컬로 실행됩니다</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Loading / Separating ---
  if (state === 'loading-model' || state === 'separating') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="border-3 border-foreground rounded-2xl p-8 bg-content1 shadow-neo-lg">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="w-6 h-6 text-warning animate-spin" />
              <div>
                <p className="font-bold">{shortName}</p>
                <p className="text-sm text-foreground/60">{state === 'loading-model' ? 'AI 모델 준비 중...' : '음원 분리 중...'}</p>
              </div>
            </div>
            <div className="w-full bg-content3 rounded-full h-4 mb-3 border-2 border-foreground/20 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-warning to-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between text-xs text-foreground/50">
              <span>{progressMsg}</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error ---
  if (state === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <div className="border-3 border-danger rounded-2xl p-8 bg-content1 shadow-neo-lg text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-danger" />
            <p className="font-bold text-lg mb-2">오류가 발생했습니다</p>
            <p className="text-sm text-foreground/60 mb-6">{error}</p>
            <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border-3 border-foreground shadow-neo-md hover:shadow-neo-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all bg-danger text-danger-foreground">
              <RefreshCw className="w-4 h-4" /> 다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Done: Timeline UI ---
  const videoTrack = tracks.find(t => t.type === 'video');
  const audioTracks = tracks.filter(t => t.type !== 'video');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Hidden audio elements (audio tracks only) */}
      {audioTracks.map(t => (
        <audio
          key={t.id}
          ref={el => { if (el) { el.volume = volume; audioRefs.current.set(t.id, el); } else audioRefs.current.delete(t.id); }}
          src={t.url}
          preload="auto"
        />
      ))}

      {/* Video Preview (if video mode) */}
      {isVideoMode && (
        <div className="flex-shrink-0 flex justify-center p-2 sm:p-4 bg-content2/30">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full max-h-[35vh] sm:max-h-[50vh] object-contain rounded-md border-3 border-foreground shadow-neo-lg"
            muted
            playsInline
            style={{ opacity: videoTrack?.active ? 1 : 0.3 }}
          />
        </div>
      )}

      {/* Timeline Area */}
      <div className="flex-1 flex flex-col min-h-0 border-b-3 border-foreground/20">
        {/* Time Ruler + Tracks */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Ruler row */}
          <div className="flex shrink-0 border-b-2 border-foreground/10" style={{ height: 28 }}>
            <div className="shrink-0 border-r-2 border-foreground/10 bg-content1" style={{ width: LABEL_W }} />
            <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden relative bg-content2/50" onClick={handleTimelineClick}>
              <div className="relative" style={{ width: timelineWidth + TIMELINE_PAD * 2, height: 28 }}>
                {rulerTicks.map(({ time, x }) => (
                  <div key={time} className="absolute top-0 flex flex-col items-center" style={{ left: x }}>
                    <span className="text-[10px] text-foreground/40 font-mono select-none whitespace-nowrap" style={{ transform: 'translateX(-50%)' }}>
                      {time < 60 ? `${Math.round(time)}초` : `${Math.floor(time / 60)}:${String(Math.round(time % 60)).padStart(2, '0')}`}
                    </span>
                    <div className="w-px h-2 bg-foreground/20" />
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 border-l-2 border-foreground/10 bg-content1" style={{ width: TOGGLE_W }} />
          </div>

          {/* Track rows */}
          {tracks.map((track) => (
            <div key={track.id} className="flex shrink-0 border-b-2 border-foreground/10" style={{ height: TRACK_HEIGHT }}>
              {/* Label */}
              <div className="shrink-0 flex items-center gap-2 px-2 border-r-2 border-foreground/10 bg-content1" style={{ width: LABEL_W }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: track.color + '30' }}>
                  {track.type === 'video'
                    ? <FilmIcon className="w-3 h-3" style={{ color: track.color }} />
                    : track.type === 'vocals'
                    ? <Mic className="w-3 h-3" style={{ color: track.color }} />
                    : <Music className="w-3 h-3" style={{ color: track.color }} />
                  }
                </div>
                <span className="text-xs font-bold truncate">{track.name}</span>
              </div>

              {/* Content: Thumbnails for video, Waveform for audio */}
              <div
                className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-pointer"
                style={{ backgroundColor: track.color + '10', opacity: track.active ? 1 : 0.35 }}
                onClick={handleTimelineClick}
                onScroll={(e) => {
                  if (timelineRef.current) timelineRef.current.scrollLeft = e.currentTarget.scrollLeft;
                }}
              >
                <div className="relative h-full" style={{ width: timelineWidth + TIMELINE_PAD * 2 }}>
                  <div className="absolute top-0 h-full" style={{ left: TIMELINE_PAD, width: timelineWidth }}>
                    {track.type === 'video' && track.thumbnails
                      ? <ThumbnailStrip thumbnails={track.thumbnails} />
                      : <WaveformCanvas blob={track.blob} color={track.color} />
                    }
                  </div>
                  {/* Playhead */}
                  <div
                    className="absolute top-0 h-full pointer-events-none"
                    style={{ left: playheadX, width: 2, backgroundColor: '#f43f5e', zIndex: 10 }}
                  />
                </div>
              </div>

              {/* Toggle */}
              <div className="shrink-0 flex flex-col items-center justify-center gap-1 border-l-2 border-foreground/10 bg-content1" style={{ width: TOGGLE_W }}>
                <button onClick={() => toggleTrack(track.id)} className="p-0.5 rounded hover:bg-content3 transition-colors" title={track.active ? '숨기기' : '보이기'}>
                  {track.active ? <Eye className="w-3.5 h-3.5 text-foreground/50" /> : <EyeOff className="w-3.5 h-3.5 text-foreground/30" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transport Bar */}
      <div className="shrink-0 flex items-center gap-3 px-3 py-2 bg-content1 border-t-2 border-foreground/10">
        <button
          onClick={togglePlay}
          className="w-9 h-9 rounded-lg flex items-center justify-center border-3 border-foreground shadow-neo-sm hover:shadow-neo-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          style={{ backgroundColor: '#4ade80' }}
        >
          {isPlaying ? <Pause className="w-4 h-4 text-foreground" /> : <Play className="w-4 h-4 text-foreground ml-0.5" />}
        </button>

        <div className="text-xs font-mono text-foreground/70 whitespace-nowrap bg-content2 px-2 py-1 rounded-md border border-foreground/15 select-none">
          {fmtTime(currentTime)} / {fmtTime(duration)}
        </div>

        <div className="flex-1 relative h-6 flex items-center cursor-pointer group" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo(((e.clientX - rect.left) / rect.width) * duration);
        }}>
          <div className="w-full h-1.5 bg-content3 rounded-full overflow-hidden group-hover:h-2 transition-all">
            <div className="h-full rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%`, backgroundColor: '#4ade80' }} />
          </div>
        </div>

        <button onClick={() => setVolume(v => v > 0 ? 0 : 1)} className="p-1 rounded hover:bg-content3 transition-colors" title="볼륨">
          {volume > 0 ? <Volume2 className="w-4 h-4 text-foreground/60" /> : <VolumeX className="w-4 h-4 text-foreground/40" />}
        </button>
        <input
          type="range" min={0} max={1} step={0.01} value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-16 h-1 accent-[#4ade80] cursor-pointer"
        />

        <span className="text-[10px] font-mono text-foreground/30 whitespace-nowrap select-none">{Math.round(zoom * 100)}%</span>

        <button onClick={reset} className="p-1.5 rounded-lg hover:bg-content3 transition-colors border border-foreground/15" title="새 파일">
          <RefreshCw className="w-3.5 h-3.5 text-foreground/50" />
        </button>
      </div>

      {/* Download Bar */}
      {(() => {
        const downloadable = audioTracks.filter(t => t.active);
        if (!downloadable.length) return null;
        return (
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-content2/50 border-t-2 border-foreground/10">
            {downloadable.map(t => (
              <button
                key={t.id}
                onClick={() => handleDownload(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-foreground/30 hover:border-foreground/60 bg-content1 hover:bg-content3 transition-all"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                <span>{t.name}</span>
                <Download className="w-3.5 h-3.5 text-foreground/50" />
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
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
                <span className="text-white font-bold text-sm">배경 제거 중...</span>
              </div>
            </div>
            <div className="p-3">
              <div className="w-full h-3 bg-content2 rounded-full border-2 border-foreground overflow-hidden relative">
                <div className="bg-remover-indeterminate" />
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

// --- Watermark Remover Types & Constants ---

type WmStatus = 'idle' | 'masking' | 'processing' | 'done' | 'error';
const WM_MAX_FILE_SIZE = 20 * 1024 * 1024;
const WM_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const WM_DEFAULT_INPAINT_RADIUS = 5;

// --- Telea Inpainting Algorithm (pure JS) ---

class WmMinHeap {
  private data: { dist: number; x: number; y: number }[] = [];
  push(item: { dist: number; x: number; y: number }) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop(): { dist: number; x: number; y: number } | undefined {
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0 && last) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  get size() { return this.data.length; }
  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[i].dist < this.data[parent].dist) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else break;
    }
  }
  private _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].dist < this.data[smallest].dist) smallest = l;
      if (r < n && this.data[r].dist < this.data[smallest].dist) smallest = r;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}

const KNOWN = 0, BAND = 1, UNKNOWN = 2;

function wmTeleaInpaint(imageData: ImageData, maskData: Uint8Array, radius: number): ImageData {
  const w = imageData.width, h = imageData.height;
  const src = new Float32Array(imageData.data);
  const out = new Float32Array(src);
  const state = new Uint8Array(w * h);
  const dist = new Float32Array(w * h);
  const heap = new WmMinHeap();
  const INF = 1e10;

  // Initialize: mask>128 → UNKNOWN, else KNOWN
  for (let i = 0; i < w * h; i++) {
    if (maskData[i] > 128) {
      state[i] = UNKNOWN;
      dist[i] = INF;
    } else {
      state[i] = KNOWN;
      dist[i] = 0;
    }
  }

  // Find boundary: KNOWN pixels adjacent to UNKNOWN → BAND
  const dx4 = [-1, 1, 0, 0], dy4 = [0, 0, -1, 1];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (state[idx] !== KNOWN) continue;
      for (let d = 0; d < 4; d++) {
        const nx = x + dx4[d], ny = y + dy4[d];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && state[ny * w + nx] === UNKNOWN) {
          state[idx] = BAND;
          dist[idx] = 0;
          heap.push({ dist: 0, x, y });
          break;
        }
      }
    }
  }

  // Fast Marching
  while (heap.size > 0) {
    const cur = heap.pop()!;
    const ci = cur.y * w + cur.x;
    if (state[ci] === KNOWN) continue;
    state[ci] = KNOWN;

    // Inpaint this pixel using weighted average of KNOWN neighbors within radius
    let sumR = 0, sumG = 0, sumB = 0, sumW = 0;
    const r2 = radius * radius;
    const rInt = Math.ceil(radius);
    for (let dy = -rInt; dy <= rInt; dy++) {
      for (let dx = -rInt; dx <= rInt; dx++) {
        const nx = cur.x + dx, ny = cur.y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const ni = ny * w + nx;
        if (state[ni] !== KNOWN || ni === ci) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const geoDist = 1.0 / (Math.sqrt(d2) + 1e-6);
        const levelDist = 1.0 / (1 + Math.abs(dist[ni] - dist[ci]));
        // Direction factor
        const dirFactor = Math.max(0.01, (dx * (cur.x - nx) + dy * (cur.y - ny)) / (Math.sqrt(d2) + 1e-6));
        const weight = geoDist * levelDist * dirFactor;
        const pi = ni * 4;
        sumR += out[pi] * weight;
        sumG += out[pi + 1] * weight;
        sumB += out[pi + 2] * weight;
        sumW += weight;
      }
    }
    if (sumW > 0) {
      const pi = ci * 4;
      out[pi] = sumR / sumW;
      out[pi + 1] = sumG / sumW;
      out[pi + 2] = sumB / sumW;
      out[pi + 3] = 255;
    }

    // Update neighbors
    for (let d = 0; d < 4; d++) {
      const nx = cur.x + dx4[d], ny = cur.y + dy4[d];
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const ni = ny * w + nx;
      if (state[ni] !== UNKNOWN) continue;
      const newDist = dist[ci] + 1;
      if (newDist < dist[ni]) {
        dist[ni] = newDist;
        state[ni] = BAND;
        heap.push({ dist: newDist, x: nx, y: ny });
      }
    }
  }

  const result = new ImageData(w, h);
  for (let i = 0; i < out.length; i++) {
    result.data[i] = Math.max(0, Math.min(255, Math.round(out[i])));
  }
  return result;
}

// --- Watermark Mask Painter Component ---

const WM_INITIAL_ZOOM = 0.75;
const WM_MIN_ZOOM = 0.3;
const WM_MAX_ZOOM = 10;
const WM_MIN_BRUSH = 5;
const WM_MAX_BRUSH = 100;
const WM_MAX_HISTORY = 20;

const WmMaskPainter = ({ imageUrl, width, height, onMaskReady, processing }: {
  imageUrl: string; width: number; height: number; onMaskReady: (mask: Uint8Array) => void; processing?: boolean;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const imgCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const cursorRef = React.useRef<HTMLDivElement>(null);

  const [brushSize, setBrushSize] = useState(30);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [zoom, setZoom] = useState(WM_INITIAL_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // Computed display rect for the image within the container
  const [displayRect, setDisplayRect] = useState({ rw: 0, rh: 0, ox: 0, oy: 0 });

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
  const undoRef = React.useRef(() => {});
  const redoRef = React.useRef(() => {});

  useEffect(() => {
    const imgCanvas = imgCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imgCanvas || !maskCanvas) return;
    imgCanvas.width = width;
    imgCanvas.height = height;
    maskCanvas.width = width;
    maskCanvas.height = height;
    const imgCtx = imgCanvas.getContext('2d')!;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.clearRect(0, 0, width, height);
    bgLoadImage(imageUrl).then((img) => {
      imgCtx.clearRect(0, 0, width, height);
      imgCtx.drawImage(img, 0, 0, width, height);
      historyRef.current = [];
      historyIndexRef.current = -1;
      saveMaskHistory();
    });
    setZoom(WM_INITIAL_ZOOM);
    setPan({ x: 0, y: 0 });
    initialCenteredRef.current = false;
  }, [imageUrl, width, height]);

  // Track container size → compute exact display rect for the image
  useEffect(() => {
    const container = containerRef.current;
    if (!container || width === 0 || height === 0) return;
    const computeRect = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      if (cw === 0 || ch === 0) return;
      const imageAspect = width / height;
      const containerAspect = cw / ch;
      let rw: number, rh: number, ox: number, oy: number;
      if (imageAspect > containerAspect) { rw = cw; rh = cw / imageAspect; ox = 0; oy = (ch - rh) / 2; }
      else { rh = ch; rw = ch * imageAspect; ox = (cw - rw) / 2; oy = 0; }
      setDisplayRect({ rw, rh, ox, oy });
    };
    computeRect();
    const observer = new ResizeObserver(computeRect);
    observer.observe(container);
    return () => observer.disconnect();
  }, [width, height]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        spaceHeldRef.current = true;
        if (cursorRef.current) cursorRef.current.style.display = 'none';
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
      // Ctrl+Z / Cmd+Z = undo, Ctrl+Shift+Z / Cmd+Shift+Z = redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRef.current();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redoRef.current();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceHeldRef.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'none';
        if (cursorRef.current) cursorRef.current.style.display = 'block';
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const getContainedRect = React.useCallback(() => {
    if (displayRect.rw > 0) return { offsetX: displayRect.ox, offsetY: displayRect.oy, renderWidth: displayRect.rw, renderHeight: displayRect.rh };
    return { offsetX: 0, offsetY: 0, renderWidth: 1, renderHeight: 1 };
  }, [displayRect]);

  const clampPan = React.useCallback((px: number, py: number, z: number) => {
    const container = containerRef.current;
    if (!container) return { x: px, y: py };
    // When zoomed out (z <= 1): free movement, no clamping
    if (z <= 1) return { x: px, y: py };
    // When zoomed in: keep image within bounds
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    return { x: Math.max(cw * (1 - z), Math.min(0, px)), y: Math.max(ch * (1 - z), Math.min(0, py)) };
  }, []);

  // Center image on initial load
  const initialCenteredRef = React.useRef(false);
  useEffect(() => {
    if (displayRect.rw === 0 || initialCenteredRef.current) return;
    initialCenteredRef.current = true;
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const z = zoomRef.current;
    setPan({ x: (cw - cw * z) / 2, y: (ch - ch * z) / 2 });
  }, [displayRect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -2 : 2;
        setBrushSize(prev => Math.max(WM_MIN_BRUSH, Math.min(WM_MAX_BRUSH, prev + delta)));
      } else {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const oldZoom = zoomRef.current;
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        let newZoom = Math.max(WM_MIN_ZOOM, Math.min(WM_MAX_ZOOM, oldZoom * factor));
        if (Math.abs(newZoom - 1) < 0.05) newZoom = 1;
        const nx = mx - (mx - panRef.current.x) * (newZoom / oldZoom);
        const ny = my - (my - panRef.current.y) * (newZoom / oldZoom);
        setZoom(newZoom);
        setPan(newZoom <= 1 ? { x: nx, y: ny } : clampPan(nx, ny, newZoom));
      }
    };
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const saveMaskHistory = React.useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const idx = historyIndexRef.current;
    historyRef.current = historyRef.current.slice(0, idx + 1);
    historyRef.current.push(data);
    if (historyRef.current.length > WM_MAX_HISTORY) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = React.useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    maskCanvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = React.useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    maskCanvas.getContext('2d')!.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);
  undoRef.current = undo;
  redoRef.current = redo;

  const getCanvasPos = React.useCallback((clientX: number, clientY: number) => {
    const canvas = imgCanvasRef.current;
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

  const paint = React.useCallback((x: number, y: number) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    const { renderWidth } = getContainedRect();
    const baseScale = maskCanvas.width / renderWidth;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, (brushSizeRef.current / 2) * baseScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [getContainedRect]);

  const paintLine = React.useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    const { renderWidth } = getContainedRect();
    const baseScale = maskCanvas.width / renderWidth;
    const r = (brushSizeRef.current / 2) * baseScale;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = r * 2;
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
    // Always capture on the container so pointer events keep flowing even outside bounds
    if (containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
    if (e.button === 1 || e.button === 2 || (e.button === 0 && spaceHeldRef.current)) {
      isPanningRef.current = true;
      panStartMouseRef.current = { x: e.clientX, y: e.clientY };
      panStartValRef.current = { ...panRef.current };
      if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
      return;
    }
    if (e.button === 0) {
      isDrawingRef.current = true;
      const pos = getCanvasPos(e.clientX, e.clientY);
      if (pos) { paint(pos.x, pos.y); lastPosRef.current = pos; }
    }
  }, [getCanvasPos, paint]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && !spaceHeldRef.current && !isPanningRef.current) {
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
      if (lastPosRef.current) paintLine(lastPosRef.current, pos);
      else paint(pos.x, pos.y);
      lastPosRef.current = pos;
    }
  }, [cursorVisible, getCanvasPos, paint, paintLine, moveCursor, clampPan]);

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    if (containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
    if (isPanningRef.current) {
      isPanningRef.current = false;
      if (containerRef.current) containerRef.current.style.cursor = spaceHeldRef.current ? 'grab' : 'none';
      return;
    }
    if (isDrawingRef.current) { isDrawingRef.current = false; lastPosRef.current = null; saveMaskHistory(); }
  }, [saveMaskHistory]);

  const handlePointerLeave = React.useCallback(() => {
    setCursorVisible(false);
    // Don't stop panning/drawing here — pointer capture keeps events flowing via handlePointerUp
  }, []);

  const zoomTo = React.useCallback((newZoom: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const oldZoom = zoomRef.current;
    const z = Math.max(WM_MIN_ZOOM, Math.min(WM_MAX_ZOOM, newZoom));
    const mx = cw / 2; const my = ch / 2;
    const nx = mx - (mx - panRef.current.x) * (z / oldZoom);
    const ny = my - (my - panRef.current.y) * (z / oldZoom);
    setZoom(z);
    setPan(clampPan(nx, ny, z));
  }, [clampPan]);

  const handleComplete = React.useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d')!;
    const maskImageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    // Extract alpha-like mask: red channel > 0 means masked
    const mask = new Uint8Array(maskCanvas.width * maskCanvas.height);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = maskImageData.data[i * 4 + 3] > 0 ? 255 : 0;
    }
    onMaskReady(mask);
  }, [onMaskReady]);

  const cursorSize = brushSize * zoom;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Controls — top bar */}
      <div className="flex items-center gap-2 flex-wrap pb-2 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <div className="shrink-0 rounded-full bg-foreground" style={{ width: Math.max(8, brushSize * 0.4), height: Math.max(8, brushSize * 0.4) }} />
          <input type="range" min={WM_MIN_BRUSH} max={WM_MAX_BRUSH} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="flex-1 accent-secondary" disabled={processing} />
          <span className="text-[10px] text-foreground/50 w-6 text-right tabular-nums font-bold">{brushSize}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={!canUndo || processing} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="실행 취소"><Undo2 className="w-3.5 h-3.5" /></button>
          <button onClick={redo} disabled={!canRedo || processing} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="다시 실행"><Redo2 className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => zoomTo(zoom / 1.3)} disabled={zoom <= WM_MIN_ZOOM || processing} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="축소"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={() => zoomTo(1)} disabled={zoom === 1 || processing} className="neo-btn px-1.5 py-1 rounded-lg disabled:opacity-30 text-[10px] tabular-nums min-w-[2.5rem] text-center font-bold" title="초기화">{Math.round(zoom * 100)}%</button>
          <button onClick={() => zoomTo(zoom * 1.3)} disabled={zoom >= WM_MAX_ZOOM || processing} className="neo-btn p-1.5 rounded-lg disabled:opacity-30" title="확대"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>
        <button onClick={handleComplete} disabled={processing} className="neo-btn neo-btn-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50">
          {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {processing ? '처리중...' : '적용'}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 rounded-xl overflow-hidden select-none"
        style={{ cursor: processing ? 'wait' : 'none', touchAction: 'none' }}
        onPointerDown={processing ? undefined : handlePointerDown}
        onPointerMove={processing ? undefined : handlePointerMove}
        onPointerUp={processing ? undefined : handlePointerUp}
        onPointerLeave={processing ? undefined : handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div className="absolute" style={{ left: displayRect.ox, top: displayRect.oy, width: displayRect.rw || '100%', height: displayRect.rh || '100%' }}>
            <canvas ref={imgCanvasRef} className="w-full h-full block" />
            <canvas ref={maskCanvasRef} className="absolute inset-0 w-full h-full block" />
          </div>
        </div>
        <div
          ref={cursorRef}
          className="absolute pointer-events-none"
          style={{
            width: cursorSize, height: cursorSize,
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3)', transform: 'translate(-50%, -50%)',
            display: cursorVisible && !processing ? 'block' : 'none',
          }}
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium pointer-events-none">
          마스크 모드 — 제거할 영역을 칠하세요
        </div>
        {zoom > 1 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium tabular-nums pointer-events-none">
            {Math.round(zoom * 100)}%
          </div>
        )}
        {processing && (
          <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/70 rounded-lg">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
              <span className="text-white text-sm font-bold">워터마크 제거 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Watermark Remover Content Component ---

const WatermarkRemoverContent = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<WmStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wmProcessing, setWmProcessing] = useState(false);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [inpaintRadius, setInpaintRadius] = useState(WM_DEFAULT_INPAINT_RADIUS);
  const [downloadFormat, setDownloadFormat] = useState<BgImageFormat>('png');
  const [isDragOver, setIsDragOver] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = React.useRef<HTMLDivElement>(null);
  const isDragging = React.useRef(false);
  const originalImageDataRef = React.useRef<ImageData | null>(null);
  const maskRef = React.useRef<Uint8Array | null>(null);

  const wmValidateFile = (file: File): string | null => {
    if (!WM_ACCEPTED_TYPES.includes(file.type)) return 'PNG, JPEG, WEBP 형식만 지원합니다.';
    if (file.size > WM_MAX_FILE_SIZE) return '파일 크기는 20MB 이하여야 합니다.';
    return null;
  };

  const handleImageFile = async (file: File) => {
    const validationError = wmValidateFile(file);
    if (validationError) { setError(validationError); return; }
    setError(null);
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setCurrentUrl(url);
    setResultUrl(null);
    setSliderPosition(50);
    setProgress(0);

    try {
      const dims = await bgGetImageDimensions(url);
      setImageWidth(dims.width);
      setImageHeight(dims.height);
      // Pre-load image data for inpainting
      const img = await bgLoadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = dims.width;
      canvas.height = dims.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      originalImageDataRef.current = ctx.getImageData(0, 0, dims.width, dims.height);
    } catch {
      setImageWidth(0);
      setImageHeight(0);
    }

    setStatus('masking');
  };

  const handleMaskReady = async (mask: Uint8Array) => {
    maskRef.current = mask;
    if (!originalImageDataRef.current) { setError('원본 이미지 데이터를 불러올 수 없습니다.'); return; }

    // Check if any pixel is masked
    let hasMask = false;
    for (let i = 0; i < mask.length; i++) { if (mask[i] > 128) { hasMask = true; break; } }
    if (!hasMask) { setError('마스크를 칠해주세요. 제거할 영역을 선택하지 않았습니다.'); return; }

    setWmProcessing(true);
    setError(null);

    // Run inpainting via setTimeout to keep UI responsive
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          const result = wmTeleaInpaint(originalImageDataRef.current!, mask, inpaintRadius);
          // Convert result to blob URL and update current image
          const canvas = document.createElement('canvas');
          canvas.width = imageWidth;
          canvas.height = imageHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.putImageData(result, 0, 0);
          // Update the working image data for next round
          originalImageDataRef.current = result;
          const newUrl = canvas.toDataURL('image/png');
          // Revoke old currentUrl if it's different from originalUrl
          if (currentUrl && currentUrl !== originalUrl) URL.revokeObjectURL(currentUrl);
          setCurrentUrl(newUrl);
          setResultUrl(newUrl);
        } catch (err: any) {
          setError(err.message || '인페인팅 처리 중 오류가 발생했습니다.');
        }
        setWmProcessing(false);
        resolve();
      }, 50);
    });
  };

  const handleDownload = async () => {
    if (!currentUrl || !imageFile) return;
    try {
      const img = await bgLoadImage(currentUrl);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const blob = await bgCanvasToBlob(canvas, downloadFormat);
      const baseName = imageFile.name.replace(/\.[^.]+$/, '');
      bgDownloadBlob(blob, `${baseName}_wm-removed.${downloadFormat}`);
    } catch { /* download failed */ }
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (currentUrl && currentUrl !== originalUrl) URL.revokeObjectURL(currentUrl);
    setImageFile(null);
    setOriginalUrl(null);
    setCurrentUrl(null);
    setResultUrl(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setImageWidth(0);
    setImageHeight(0);
    setInpaintRadius(WM_DEFAULT_INPAINT_RADIUS);
    setSliderPosition(50);
    setWmProcessing(false);
    originalImageDataRef.current = null;
    maskRef.current = null;
  };

  const goBackToMasking = () => {
    setResultUrl(null);
    setStatus('masking');
    setProgress(0);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); const file = e.dataTransfer.files[0]; if (file) handleImageFile(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); };

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
  const handleSliderPointerUp = React.useCallback(() => { isDragging.current = false; }, []);

  // Upload state (idle)
  if (status === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className={`frame-dropzone w-full max-w-lg p-10 rounded-2xl text-center cursor-pointer neo-card-static ${isDragOver ? 'frame-dropzone-active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('wm-image-input')?.click()}
        >
          <input
            id="wm-image-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageFile(file); }}
          />
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center neo-card-static">
            <Droplets className="w-10 h-10 text-secondary" />
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

  // Masking state
  if (status === 'masking') {
    return (
      <div className="flex-1 flex flex-col min-h-0 p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <Droplets className="w-4 h-4 text-secondary" />
          <h3 className="text-sm font-black text-foreground uppercase flex-1">워터마크 영역 선택</h3>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-foreground/60 font-bold">반경</label>
            <input
              type="range" min={3} max={20} value={inpaintRadius}
              onChange={(e) => setInpaintRadius(Number(e.target.value))}
              className="w-20 accent-secondary"
              disabled={wmProcessing}
            />
            <span className="text-foreground/50 tabular-nums font-bold w-4 text-right">{inpaintRadius}</span>
          </div>
          {resultUrl && (
            <div className="flex items-center gap-1">
              <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as BgImageFormat)} className="neo-btn px-1.5 py-1 rounded-lg text-xs font-bold uppercase bg-content1 border-2 border-foreground">
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
              <button onClick={handleDownload} className="neo-btn neo-btn-primary flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold">
                <Download className="w-3 h-3" />
              </button>
            </div>
          )}
          <button onClick={resetAll} className="neo-btn px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        {error && (
          <div className="mb-2 p-2.5 rounded-xl flex items-center gap-2 text-xs bg-danger/10 border-2 border-foreground shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-danger shrink-0" />
            <span className="text-foreground/80">{error}</span>
          </div>
        )}
        <WmMaskPainter
          imageUrl={currentUrl!}
          width={imageWidth}
          height={imageHeight}
          onMaskReady={handleMaskReady}
          processing={wmProcessing}
        />
      </div>
    );
  }

  // Processing state
  if (status === 'processing') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="neo-card-static rounded-xl overflow-hidden max-w-lg w-full">
          <div className="relative">
            <img src={originalUrl!} alt="Original" className="w-full max-h-[50vh] object-contain bg-foreground/5" />
            <div className="absolute inset-0 bg-foreground/40 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <span className="text-white font-bold text-sm">워터마크 제거 중... {progress}%</span>
            </div>
          </div>
          <div className="p-3">
            <div className="w-full h-3 bg-content2 rounded-full border-2 border-foreground overflow-hidden">
              <div className="h-full bg-secondary transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="neo-card-static rounded-xl p-6 text-center space-y-4 max-w-md w-full">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center neo-card-static">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <p className="text-sm font-bold text-foreground/80">{error || '워터마크 제거 중 오류가 발생했습니다.'}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={goBackToMasking} className="neo-btn neo-btn-secondary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              다시 마스크
            </button>
            <button onClick={resetAll} className="neo-btn px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              새 이미지
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Done state — Before/After slider + download
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 p-3 md:p-4 gap-3">
      {/* LEFT: Before/After Slider */}
      <div className="w-full md:flex-1 flex flex-col gap-3 md:overflow-y-auto">
        <div className="neo-card-static rounded-xl overflow-hidden">
          <div className="px-3 py-2 border-b-2 border-foreground/20 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-secondary" />
            <h3 className="text-sm font-black text-foreground uppercase flex-1">결과 비교</h3>
            <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground border-2 border-foreground">{imageWidth}x{imageHeight}</span>
            <button onClick={resetAll} className="neo-btn px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="p-3">
            <div
              ref={sliderRef}
              className="relative w-full aspect-[4/3] sm:aspect-video rounded-xl overflow-hidden select-none cursor-col-resize bg-foreground/5"
              style={{ touchAction: 'none' }}
              onPointerDown={handleSliderPointerDown}
              onPointerMove={handleSliderPointerMove}
              onPointerUp={handleSliderPointerUp}
            >
              <img src={resultUrl!} alt="After" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
              <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                <img src={originalUrl!} alt="Before" className="absolute inset-0 w-full h-full object-contain" draggable={false} />
              </div>
              <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-foreground">
                  <GripVertical className="w-5 h-5 sm:w-4 sm:h-4 text-foreground/50" />
                </div>
              </div>
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium">Before</div>
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-1.5 sm:px-2 py-0.5 bg-foreground/50 rounded text-[10px] sm:text-xs text-white font-medium">After</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
        {/* Re-mask button */}
        <button onClick={goBackToMasking} className="neo-btn neo-btn-secondary flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold w-full">
          <Droplets className="w-4 h-4" />
          다시 마스크
        </button>

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
          </div>
        </div>

        {/* New image */}
        <button onClick={resetAll} className="neo-btn flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold w-full">
          <ImagePlus className="w-4 h-4" />
          새 이미지
        </button>
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

      // Full storyboard format (object with "scenes" key)
      if (!Array.isArray(json) && typeof json === 'object' && json !== null && 'scenes' in json) {
        const sb = json;

        // Parse characters
        const chars: ConceptArtCharacter[] = [];
        if (Array.isArray(sb.characters)) {
          for (const c of sb.characters) {
            const mi: ConceptArtMasterImage[] = [];
            if (c.master_images && typeof c.master_images === 'object') {
              for (const [k, v] of Object.entries(c.master_images as Record<string, any>)) {
                mi.push({
                  type: k,
                  label: k === 'fullbody' ? '풀바디' : k === 'character_sheet' ? '캐릭터 시트' : k,
                  image_prompt: v?.image_prompt || '',
                  image_ko_description: v?.image_ko_description || '',
                });
              }
            }
            chars.push({ id: c.id || '', name: c.name || '', role: c.role || '', card: c.card || {}, master_images: mi });
          }
        }

        // Parse environments
        const envs: ConceptArtEnvironment[] = [];
        if (Array.isArray(sb.environments)) {
          for (const e of sb.environments) {
            const emi: ConceptArtMasterImage[] = [];
            if (e.master_images && typeof e.master_images === 'object') {
              for (const [k, v] of Object.entries(e.master_images as Record<string, any>)) {
                emi.push({
                  type: k,
                  label: k === 'wide_establishing' ? '와이드 전경' : k,
                  image_prompt: v?.image_prompt || '',
                  image_ko_description: v?.image_ko_description || '',
                });
              }
            }
            envs.push({
              id: e.id || '', name: e.name || '', card: e.card || {},
              allowed_effects: Array.isArray(e.allowed_effects) ? e.allowed_effects : [],
              blocked_effects: Array.isArray(e.blocked_effects) ? e.blocked_effects : [],
              master_images: emi,
            });
          }
        }

        // Parse products
        const prods: ConceptArtProduct[] = [];
        if (Array.isArray(sb.products)) {
          for (const p of sb.products) {
            const mi: ConceptArtMasterImage[] = [];
            if (p.master_images && typeof p.master_images === 'object') {
              for (const [k, v] of Object.entries(p.master_images as Record<string, any>)) {
                mi.push({
                  type: k,
                  label: k === 'hero_shot' ? '히어로샷' : k === 'product_turnaround' ? '제품 턴어라운드' : k,
                  image_prompt: v?.image_prompt || '',
                  image_ko_description: v?.image_ko_description || '',
                });
              }
            }
            prods.push({ id: p.id || '', name: p.name || '', card: p.card || {}, master_images: mi });
          }
        }

        // Parse group shots
        const gs: ConceptArtMasterImage[] = [];
        if (Array.isArray(sb.group_shots)) {
          for (const g of sb.group_shots) {
            gs.push({
              type: 'group_shot', label: g.type || g.id || '그룹샷',
              image_prompt: g.image_prompt || '', image_ko_description: g.image_ko_description || '',
            });
          }
        }

        setConceptArtData({ characters: chars, environments: envs, products: prods, group_shots: gs });

        // Parse scenes into image/video prompts (v4 schema: prompts inside video_main/video_extend)
        if (Array.isArray(sb.scenes)) {
          const imgP: ScenePrompt[] = [];
          const vidP: ScenePrompt[] = [];
          for (const s of sb.scenes) {
            if (typeof s.id !== 'number') continue;

            // Image prompts: v4 schema has image_prompt inside video_main/video_extend, legacy at scene root
            const imgMain = s.video_main?.image_prompt || s.image_prompt;
            const imgExt = s.video_extend?.image_prompt;
            if (imgMain || imgExt) {
              imgP.push({
                id: s.id,
                scene_title: s.scene_title || '',
                prompt: imgMain || '',
                ko_description: s.video_main?.image_ko_description || s.image_ko_description || '',
                image_main: imgMain ? { prompt: imgMain, ko_description: s.video_main?.image_ko_description || s.image_ko_description || '' } : undefined,
                image_extend: imgExt ? { prompt: imgExt, ko_description: s.video_extend?.image_ko_description || '' } : undefined,
              });
            }

            // Video prompts: v4 schema has video_prompt inside video_main/video_extend, legacy at scene root
            const vidMain = s.video_main?.video_prompt || s.video_prompt;
            const vidExt = s.video_extend?.video_prompt;
            if (vidMain || vidExt) {
              vidP.push({
                id: s.id,
                scene_title: s.scene_title || '',
                prompt: vidMain || '',
                ko_description: s.video_main?.video_ko_description || s.video_ko_description || '',
                video_main: vidMain ? { prompt: vidMain, ko_description: s.video_main?.video_ko_description || s.video_ko_description || '' } : undefined,
                video_extend: vidExt ? { prompt: vidExt, ko_description: s.video_extend?.video_ko_description || '' } : undefined,
              });
            }
          }
          if (imgP.length > 0) setImagePrompts(imgP);
          if (vidP.length > 0) setVideoPrompts(vidP);
        }

        setStage2SubPage('concept');
        setIsStage2UploadOpen(false);
        setStage2UploadInput('');
        setIsSidebarOpen(false);
        return;
      }

      if (!Array.isArray(json)) throw new Error('JSON 배열 형식이거나 스토리보드 객체 형식이어야 합니다.');

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
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);

  // Stage 2 state
  const [currentStage, setCurrentStage] = useState<Stage>('stage1');
  const [stage2SubPage, setStage2SubPage] = useState<Stage2SubPage>('image');
  const [imagePrompts, setImagePrompts] = useState<ScenePrompt[]>([]);
  const [videoPrompts, setVideoPrompts] = useState<ScenePrompt[]>([]);
  const [isStage2UploadOpen, setIsStage2UploadOpen] = useState(false);
  const [stage2UploadTarget, setStage2UploadTarget] = useState<Stage2SubPage>('image');
  const [stage2UploadInput, setStage2UploadInput] = useState(SAMPLE_STORYBOARD);
  const [stage2UploadError, setStage2UploadError] = useState<string | null>(null);
  const [conceptArtData, setConceptArtData] = useState<ConceptArtData>({ characters: [], environments: [], products: [], group_shots: [] });

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
    try {
      const ca = localStorage.getItem('conceptArtData');
      if (ca) setConceptArtData(JSON.parse(ca));
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

  useEffect(() => {
    const hasData = conceptArtData.characters.length > 0 || conceptArtData.environments.length > 0 || conceptArtData.products.length > 0 || conceptArtData.group_shots.length > 0;
    if (hasData) {
      try {
        // Strip uploaded_image fields to avoid localStorage size limit
        const stripped: ConceptArtData = {
          characters: conceptArtData.characters.map(c => ({ ...c, master_images: c.master_images.map(m => ({ ...m, uploaded_image: undefined })) })),
          environments: conceptArtData.environments.map(e => ({ ...e, uploaded_image: undefined, master_images: e.master_images.map(m => ({ ...m, uploaded_image: undefined })) })),
          products: conceptArtData.products.map(p => ({ ...p, master_images: p.master_images.map(m => ({ ...m, uploaded_image: undefined })) })),
          group_shots: conceptArtData.group_shots.map(g => ({ ...g, uploaded_image: undefined })),
        };
        localStorage.setItem('conceptArtData', JSON.stringify(stripped));
      } catch {}
    } else {
      localStorage.removeItem('conceptArtData');
    }
  }, [conceptArtData]);

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
              TB STUDIO LAB
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
          {/* 이미지생성기 header */}
          <div className="p-2 md:p-3 pb-1 shrink-0">
            <button
              onClick={() => {
                if (!isImageGenOpen) {
                  setIsImageGenOpen(true);
                  if (currentStage !== 'stage1' && currentStage !== 'stage2') {
                    setCurrentStage('stage1');
                  }
                } else {
                  setIsImageGenOpen(false);
                }
              }}
              className={`neo-btn flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                (currentStage === 'stage1' || currentStage === 'stage2')
                  ? 'bg-content3 border-3 border-foreground shadow-neo-sm'
                  : 'border-3 border-foreground/30 hover:border-foreground/60'
              }`}
            >
              <Wand2 className="w-4 h-4 text-primary" />
              <span className="flex-1 text-left">이미지생성기</span>
              {isImageGenOpen ? <ChevronUp className="w-4 h-4 text-foreground/60" /> : <ChevronDown className="w-4 h-4 text-foreground/60" />}
            </button>
          </div>

          {/* 이미지생성기 sub-items + content */}
          {isImageGenOpen && (
            <>
              <div className="px-2 md:px-3 pb-1 shrink-0">
                <div className="pl-4 space-y-1">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setCurrentStage('stage1')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                        currentStage === 'stage1'
                          ? 'bg-primary text-primary-foreground border-3 border-foreground shadow-neo-sm'
                          : 'text-foreground/60 hover:bg-content2 border-3 border-foreground/20 hover:border-foreground/40'
                      }`}
                    >
                      {currentStage === 'stage1' && <div className="w-1.5 h-4 rounded-full bg-primary-foreground" />}
                      1단계
                    </button>
                    <button
                      onClick={() => setCurrentStage('stage2')}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                        currentStage === 'stage2'
                          ? 'bg-secondary text-secondary-foreground border-3 border-foreground shadow-neo-sm'
                          : 'text-foreground/60 hover:bg-content2 border-3 border-foreground/20 hover:border-foreground/40'
                      }`}
                    >
                      {currentStage === 'stage2' && <div className="w-1.5 h-4 rounded-full bg-secondary-foreground" />}
                      2단계
                    </button>
                  </div>
                  {(currentStage === 'stage1' || currentStage === 'stage2') && (
                    <a
                      href={currentStage === 'stage1'
                        ? "https://gemini.google.com/gem/13HOLZGAzOKloWSBnxejnMvWDOJHNvdyu?usp=sharing"
                        : "https://gemini.google.com/gem/1CdSxrlLl-Et1lUzFrBAUwVKhcwPJ4ZOl?usp=sharing"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className={`group neo-btn flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border-3 ${
                        currentStage === 'stage1'
                          ? 'neo-btn-primary hover:shadow-neo-sm'
                          : 'neo-btn-secondary hover:shadow-neo-sm'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
                      <span>{currentStage === 'stage1' ? '1단계' : '2단계'} 젬 가이드</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Stage 1 Sidebar Content */}
              {currentStage === 'stage1' && (
                <>
                  <div className="px-3 md:px-4 py-2 border-y-2 border-foreground/20 shrink-0">
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
                  <button
                    onClick={() => setStage2SubPage('concept')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      stage2SubPage === 'concept'
                        ? 'text-foreground bg-content3 border-3 border-foreground shadow-neo-sm'
                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 border-3 border-foreground/20'
                    }`}
                  >
                    <Palette className="w-5 h-5 text-primary" />
                    <span className="flex-1 text-left">컨셉아트</span>
                    {(conceptArtData.characters.length + conceptArtData.environments.length + conceptArtData.products.length) > 0 && (
                      <span className="memphis-badge text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {conceptArtData.characters.length + conceptArtData.environments.length + conceptArtData.products.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setStage2SubPage('image')}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${
                      stage2SubPage === 'image'
                        ? 'text-foreground bg-content4 border-3 border-foreground shadow-neo-sm'
                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 border-3 border-foreground/20'
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
                        : 'text-foreground/60 hover:text-foreground/80 hover:bg-foreground/5 border-3 border-foreground/20'
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
            </>
          )}

          {/* Other tools */}
          <div className="p-2 md:p-3 pt-1 border-t-2 border-foreground/20 space-y-1 shrink-0">
            {/* 프레임추출기 */}
            <button
              onClick={() => setCurrentStage('frame-extractor')}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                currentStage === 'frame-extractor'
                  ? 'neo-btn neo-btn-warning border-3 border-foreground shadow-neo-sm'
                  : 'neo-btn border-3 border-foreground/30 hover:border-foreground/60'
              }`}
            >
              {currentStage === 'frame-extractor' && <div className="w-1.5 h-4 rounded-full bg-warning" />}
              <Scissors className="w-4 h-4 text-warning" />
              <span className="flex-1 text-left">프레임추출기</span>
            </button>

            {/* 배경지우기 */}
            <button
              onClick={() => setCurrentStage('bg-remover')}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                currentStage === 'bg-remover'
                  ? 'neo-btn neo-btn-danger border-3 border-foreground shadow-neo-sm'
                  : 'neo-btn border-3 border-foreground/30 hover:border-foreground/60'
              }`}
            >
              {currentStage === 'bg-remover' && <div className="w-1.5 h-4 rounded-full bg-danger" />}
              <Eraser className="w-4 h-4 text-danger" />
              <span className="flex-1 text-left">배경지우기</span>
            </button>

            {/* 워터마크제거 */}
            <button
              onClick={() => setCurrentStage('wm-remover')}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                currentStage === 'wm-remover'
                  ? 'neo-btn neo-btn-secondary border-3 border-foreground shadow-neo-sm'
                  : 'neo-btn border-3 border-foreground/30 hover:border-foreground/60'
              }`}
            >
              {currentStage === 'wm-remover' && <div className="w-1.5 h-4 rounded-full bg-secondary" />}
              <Droplets className="w-4 h-4 text-secondary" />
              <span className="flex-1 text-left">워터마크제거</span>
            </button>

            {/* 음원분리기 */}
            <button
              onClick={() => setCurrentStage('audio-separator')}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                currentStage === 'audio-separator'
                  ? 'neo-btn neo-btn-warning border-3 border-foreground shadow-neo-sm'
                  : 'neo-btn border-3 border-foreground/30 hover:border-foreground/60'
              }`}
            >
              {currentStage === 'audio-separator' && <div className="w-1.5 h-4 rounded-full bg-warning" />}
              <Music className="w-4 h-4 text-warning" />
              <span className="flex-1 text-left">음원분리기</span>
            </button>

            {/* Grok 바로가기 */}
            <a
              href="https://grok.com/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all neo-btn border-3 border-foreground/30 hover:border-foreground/60"
              title="새 탭에서 Grok 열기"
            >
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="flex-1 text-left text-foreground/70">Grok 바로가기</span>
            </a>

            {/* Google 번역기 */}
            <a
              href="https://translate.google.co.kr/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all neo-btn border-3 border-foreground/30 hover:border-foreground/60"
              title="새 탭에서 구글 번역기 열기"
            >
              <ExternalLink className="w-4 h-4 text-secondary" />
              <span className="flex-1 text-left text-foreground/70">Google 번역기 열기</span>
            </a>
          </div>

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

          {/* Watermark Remover Sidebar Content */}
          {currentStage === 'wm-remover' && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-secondary" />
                  <h3 className="text-sm font-black text-foreground uppercase">사용 방법</h3>
                </div>
                <div className="space-y-2 text-xs text-foreground/70">
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-secondary text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1</span>
                    <span>이미지를 업로드합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-secondary text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">2</span>
                    <span>브러시로 워터마크 영역을 칠합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-secondary text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">3</span>
                    <span>"완료" 버튼으로 인페인팅 실행</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-secondary text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">4</span>
                    <span>Before/After 비교 후 다운로드</span>
                  </div>
                </div>
              </div>
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground/80 uppercase">특징</h4>
                <ul className="space-y-1 text-xs text-foreground/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    Telea 인페인팅 알고리즘
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    브러시 기반 마스크 페인팅
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    줌/팬, Undo/Redo 지원
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    100% 클라이언트 처리 (서버 불필요)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Audio Separator Sidebar Content */}
          {currentStage === 'audio-separator' && (
            <div className="flex-1 overflow-y-auto p-2 md:p-3 space-y-2 md:space-y-2.5">
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-warning" />
                  <h3 className="text-sm font-black text-foreground uppercase">사용 방법</h3>
                </div>
                <div className="space-y-2 text-xs text-foreground/70">
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">1</span>
                    <span>오디오 파일을 드래그하거나 선택하여 업로드</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">2</span>
                    <span>AI가 자동으로 보컬과 반주를 분리합니다</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="memphis-badge-warning text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0">3</span>
                    <span>각 트랙을 미리듣기하고 WAV로 다운로드</span>
                  </div>
                </div>
              </div>
              <div className="neo-card-static rounded-xl p-3 md:p-4 space-y-2">
                <h4 className="text-xs font-bold text-foreground/80 uppercase">특징</h4>
                <ul className="space-y-1 text-xs text-foreground/60">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    UVR-MDX-NET AI 모델 기반
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    MP3, WAV, FLAC, OGG, M4A 지원
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    보컬/반주(MR) 분리
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary" />
                    100% 브라우저 내 처리 (서버 불필요)
                  </li>
                </ul>
              </div>
            </div>
          )}


        </aside>

        {/* RIGHT PANEL: Editor & Output */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {currentStage === 'audio-separator' ? (
          /* Audio Separator */
          <AudioSeparatorContent />
          ) : currentStage === 'wm-remover' ? (
          /* Watermark Remover */
          <WatermarkRemoverContent />
          ) : currentStage === 'bg-remover' ? (
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
          ) : stage2SubPage === 'concept' ? (
          /* Stage 2: Concept Art Viewer */
          <ConceptArtContent
            conceptArtData={conceptArtData}
            setConceptArtData={setConceptArtData}
            onUpload={() => {
              setStage2UploadError(null);
              setStage2UploadInput(imagePrompts.length === 0 && videoPrompts.length === 0 ? SAMPLE_STORYBOARD : '');
              setIsStage2UploadOpen(true);
            }}
          />
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
              setStage2UploadInput(imagePrompts.length === 0 && videoPrompts.length === 0 ? SAMPLE_STORYBOARD : '');
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
                <p className="font-bold text-foreground/80">스토리보드 전체 형식 (컨셉아트+씬 동시):</p>
                <p>{"{"} "project": {"{"} ... {"}"}, "characters": [...], "environments": [...], "scenes": [...] {"}"}</p>
                <p className="font-bold text-foreground/80 mt-1">통합 형식 (이미지+영상 동시):</p>
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
