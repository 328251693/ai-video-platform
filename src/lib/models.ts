export type GenerationModelType = "video" | "image";

export interface GenerationModel {
  id: string;
  name: string;
  provider: string;
  type: GenerationModelType;
  description: string;
  credits: number;
  active?: boolean;
}

export const FALLBACK_MODELS: GenerationModel[] = [
  {
    id: "MiniMax-Hailuo-2.3",
    name: "Hailuo 2.3",
    provider: "Apimart",
    type: "video",
    description: "适合电影感和人物运动的视频生成",
    credits: 30,
  },
  {
    id: "MiniMax-Hailuo-2.3-Fast",
    name: "Hailuo 2.3 Fast",
    provider: "Apimart",
    type: "video",
    description: "更快的图片转视频工作流",
    credits: 30,
  },
  {
    id: "nano-banana",
    name: "Nano Banana",
    provider: "Grsai",
    type: "video",
    description: "适合快速尝试创意和动态场景",
    credits: 20,
  },
  {
    id: "gpt-image-2",
    name: "GPT Image 2",
    provider: "Grsai",
    type: "image",
    description: "高质量图片生成和视觉探索",
    credits: 5,
  },
];

export function getModelCredits(modelId: string): number {
  return FALLBACK_MODELS.find((model) => model.id === modelId)?.credits ?? 20;
}
