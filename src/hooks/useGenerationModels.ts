"use client";

import { useEffect, useState } from "react";
import { FALLBACK_MODELS, type GenerationModel, type GenerationModelType } from "@/lib/models";

export function useGenerationModels(type: GenerationModelType) {
  const [models, setModels] = useState<GenerationModel[]>(() =>
    FALLBACK_MODELS.filter((model) => model.type === type),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      try {
        const response = await fetch(`/api/models?type=${type}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { models?: GenerationModel[] };
        if (!cancelled && Array.isArray(data.models)) {
          setModels(data.models);
        }
      } catch {
        // 首屏保留本地兜底模型，避免接口短暂不可用时页面无法操作。
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadModels();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return { models, loading };
}
