"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Power, RefreshCw, Save, X } from "lucide-react";

type ModelType = "video" | "image";

interface AdminModel {
  id: string;
  name: string;
  provider: string;
  provider_model_id?: string | null;
  type: ModelType;
  description?: string | null;
  icon_url?: string | null;
  parameters?: Record<string, unknown> | null;
  capabilities?: unknown[] | null;
  credits_cost?: number | null;
  sort_order?: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ModelForm {
  id: string;
  name: string;
  provider: string;
  provider_model_id: string;
  type: ModelType;
  description: string;
  credits_cost: string;
  sort_order: string;
  capabilities: string;
}

type HealthStatus = "ready" | "missing_key" | "unsupported";

interface ModelHealth {
  status: HealthStatus;
  environment_variable: string | null;
  checked_at: string;
}

const emptyForm: ModelForm = {
  id: "",
  name: "",
  provider: "grsai",
  provider_model_id: "",
  type: "video",
  description: "",
  credits_cost: "20",
  sort_order: "100",
  capabilities: "",
};

export default function AdminModelManager({ initialModels }: { initialModels: AdminModel[] }) {
  const [models, setModels] = useState(initialModels);
  const [form, setForm] = useState<ModelForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [healthById, setHealthById] = useState<Record<string, ModelHealth>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(() => models.filter((model) => model.is_active).length, [models]);

  function startCreate() {
    setError(null);
    setMessage(null);
    setForm(emptyForm);
  }

  function startEdit(model: AdminModel) {
    setError(null);
    setMessage(null);
    setForm({
      id: model.id,
      name: model.name,
      provider: model.provider,
      provider_model_id: model.provider_model_id || model.id,
      type: model.type,
      description: model.description || "",
      credits_cost: String(model.credits_cost ?? 20),
      sort_order: String(model.sort_order ?? 100),
      capabilities: Array.isArray(model.capabilities) ? model.capabilities.map(String).join(", ") : "",
    });
  }

  function updateForm<K extends keyof ModelForm>(key: K, value: ModelForm[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  async function saveModel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      provider: form.provider,
      provider_model_id: form.provider_model_id.trim() || form.id.trim(),
      type: form.type,
      description: form.description.trim(),
      credits_cost: Number(form.credits_cost),
      sort_order: Number(form.sort_order),
      capabilities: form.capabilities.split(",").map((item) => item.trim()).filter(Boolean),
    };
    const editing = models.some((model) => model.id === form.id);

    try {
      const response = await fetch(editing ? `/api/admin/models/${encodeURIComponent(form.id)}` : "/api/admin/models", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存模型失败");

      setModels((current) => editing
        ? current.map((model) => model.id === data.model.id ? data.model : model)
        : [...current, data.model].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)),
      );
      setForm(null);
      setMessage(editing ? "模型配置已更新" : "模型已添加");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存模型失败");
    } finally {
      setSaving(false);
    }
  }

  async function toggleModel(model: AdminModel) {
    setBusyId(model.id);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/models/${encodeURIComponent(model.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !model.is_active }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新模型状态失败");
      setModels((current) => current.map((item) => item.id === model.id ? data.model : item));
      setMessage(data.model.is_active ? `${model.name} 已启用` : `${model.name} 已停用`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "更新模型状态失败");
    } finally {
      setBusyId(null);
    }
  }

  async function checkModel(model: AdminModel) {
    setCheckingId(model.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/models/${encodeURIComponent(model.id)}/health`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "检查模型配置失败");
      setHealthById((current) => ({ ...current, [model.id]: data }));
    } catch (healthError) {
      setError(healthError instanceof Error ? healthError.message : "检查模型配置失败");
    } finally {
      setCheckingId(null);
    }
  }

  return (
    <div className="admin-page">
      <section className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Model registry · 05</span>
          <h1>模型管理</h1>
          <p>统一维护展示名称、供应商模型 ID、Credits 价格和启用状态。只有已配置适配器的供应商才允许保存。</p>
        </div>
        <div className="admin-model-summary">
          <span>{activeCount} 个启用</span>
          <span>{models.length} 个总计</span>
        </div>
      </section>

      <div className="admin-model-toolbar">
        <div>
          <strong>接入边界</strong>
          <span>当前适配器：Grsai / Apimart · API Key 仍保存在 Vercel 服务端环境变量</span>
        </div>
        <button type="button" className="admin-action-button admin-action-button--primary" onClick={startCreate}>
          <Plus size={15} /> 添加模型
        </button>
      </div>

      {message && <div className="admin-inline-message admin-inline-message--success">{message}</div>}
      {error && <div className="admin-inline-message admin-inline-message--error">{error}</div>}

      <section className="admin-model-grid">
        {models.map((model) => (
          <article key={model.id} className={`admin-model-card${model.is_active ? "" : " is-disabled"}`}>
            <div className="admin-model-card__head">
              <span className="admin-model-card__type">{model.type}</span>
              <div className="admin-model-card__flags"><span className={`admin-status admin-status--${model.is_active ? "active" : "disabled"}`}>{model.is_active ? "启用" : "停用"}</span><span className={`admin-status admin-status--${isSupportedProvider(model.provider) ? "active" : "failed"}`}>{isSupportedProvider(model.provider) ? "已适配" : "未适配"}</span></div>
            </div>
            <h2>{model.name}</h2>
            <code className="admin-code">{model.id}</code>
            <p>{model.description || "暂无模型描述"}</p>
            <div className="admin-model-meta">
              <span><small>供应商</small><strong>{model.provider}</strong></span>
              <span><small>Credits</small><strong>{model.credits_cost ?? 20}</strong></span>
            </div>
            {healthById[model.id] && <div className={`admin-model-health admin-model-health--${healthById[model.id].status}`}><strong>{healthLabel(healthById[model.id].status)}</strong><span>{healthById[model.id].environment_variable || "无对应环境变量"}</span></div>}
            <div className="admin-model-card__footer">
              <span className="admin-code">{model.provider_model_id || model.id}</span>
              <div className="admin-model-card__actions">
                <button type="button" className="admin-icon-action" onClick={() => checkModel(model)} disabled={checkingId === model.id} aria-label={`检查 ${model.name} 配置`} title="检查配置"><RefreshCw size={14} className={checkingId === model.id ? "admin-spin" : ""} /></button>
                <button type="button" className="admin-icon-action" onClick={() => startEdit(model)} aria-label={`编辑 ${model.name}`} title="编辑"><Pencil size={14} /></button>
                <button type="button" className={`admin-icon-action${model.is_active ? " admin-icon-action--danger" : " admin-icon-action--success"}`} onClick={() => toggleModel(model)} disabled={busyId === model.id} aria-label={model.is_active ? `停用 ${model.name}` : `启用 ${model.name}`} title={model.is_active ? "停用" : "启用"}><Power size={14} /></button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {models.length === 0 && <p className="admin-empty">暂无模型配置，请先添加一个模型。</p>}

      {form && (
        <div className="admin-model-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setForm(null); }}>
          <section className="admin-model-modal" role="dialog" aria-modal="true" aria-labelledby="model-form-title">
            <div className="admin-model-modal__header">
              <div><span className="admin-eyebrow">Configuration</span><h2 id="model-form-title">{models.some((model) => model.id === form.id) ? "编辑模型" : "添加模型"}</h2></div>
              <button type="button" className="admin-icon-action" onClick={() => setForm(null)} aria-label="关闭"><X size={16} /></button>
            </div>
            <form className="admin-model-form" onSubmit={saveModel}>
              <label>模型 ID<input className="input" value={form.id} disabled={models.some((model) => model.id === form.id)} onChange={(event) => updateForm("id", event.target.value)} placeholder="例如：gpt-image-2" required /></label>
              <label>展示名称<input className="input" value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="例如：GPT Image 2" required /></label>
              <div className="admin-form-row">
                <label>供应商<select className="input" value={form.provider} onChange={(event) => updateForm("provider", event.target.value)}>{form.provider !== "grsai" && form.provider !== "apimart" && <option value={form.provider}>{form.provider}（未适配）</option>}<option value="grsai">Grsai</option><option value="apimart">Apimart</option></select></label>
                <label>类型<select className="input" value={form.type} onChange={(event) => updateForm("type", event.target.value as ModelType)}><option value="video">视频</option><option value="image">图片</option></select></label>
              </div>
              <label>供应商模型 ID<input className="input" value={form.provider_model_id} onChange={(event) => updateForm("provider_model_id", event.target.value)} placeholder="上游 API 要求的模型名称" required /></label>
              <div className="admin-form-row">
                <label>单次 Credits<input className="input" type="number" min="0" step="1" value={form.credits_cost} onChange={(event) => updateForm("credits_cost", event.target.value)} required /></label>
                <label>排序值<input className="input" type="number" min="0" step="1" value={form.sort_order} onChange={(event) => updateForm("sort_order", event.target.value)} required /></label>
              </div>
              <label>模型描述<textarea className="input" rows={3} value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="给用户看的简短说明" /></label>
              <label>能力标签<span className="admin-form-help">用英文逗号分隔，例如：text-to-image, image-to-image</span><input className="input" value={form.capabilities} onChange={(event) => updateForm("capabilities", event.target.value)} placeholder="text-to-image, image-to-image" /></label>
              <div className="admin-model-modal__footer"><button type="button" className="admin-action-button" onClick={() => setForm(null)}>取消</button><button type="submit" className="admin-action-button admin-action-button--primary" disabled={saving}><Save size={15} />{saving ? "保存中…" : "保存配置"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function isSupportedProvider(provider: string) {
  const normalized = provider.trim().toLowerCase();
  return normalized === "grsai" || normalized === "apimart";
}

function healthLabel(status: HealthStatus) {
  if (status === "ready") return "配置就绪";
  if (status === "missing_key") return "缺少 API Key";
  return "供应商未适配";
}
