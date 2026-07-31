"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, KeyRound, Link2, RefreshCw, Save, Search, XCircle } from "lucide-react";

type ProviderStatus = "not_tested" | "passed" | "failed";

interface ProviderConfig {
  provider: "grsai" | "apimart";
  display_name: string;
  default_base_url: string;
  default_models_path: string;
  environment_variable: string;
  base_url: string;
  models_path: string;
  api_key_set: boolean;
  api_key_last4: string | null;
  is_active: boolean;
  source: "database" | "environment";
  last_tested_at: string | null;
  last_test_status: ProviderStatus;
  last_test_message: string | null;
}

interface CatalogModel {
  id: string;
  suggested_id: string;
  name: string;
  description: string;
  type: "video" | "image";
  capabilities: string[];
}

export default function AdminProviderConfigManager() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [catalogs, setCatalogs] = useState<Record<string, CatalogModel[]>>({});
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadProviders();
  }, []);

  async function loadProviders() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/provider-configs", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载供应商配置失败");
      setProviders(data.providers || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "加载供应商配置失败");
    } finally {
      setLoading(false);
    }
  }

  async function save(provider: ProviderConfig, form: HTMLFormElement) {
    setBusyProvider(provider.provider);
    setMessage(null);
    setError(null);
    const formData = new FormData(form);
    try {
      const response = await fetch(provider.source === "database"
        ? `/api/admin/provider-configs/${provider.provider}`
        : "/api/admin/provider-configs", {
        method: provider.source === "database" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.provider,
          base_url: String(formData.get("base_url") || ""),
          models_path: String(formData.get("models_path") || ""),
          api_key: String(formData.get("api_key") || ""),
          clear_api_key: formData.get("clear_api_key") === "on",
          is_active: formData.get("is_active") === "on",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存供应商配置失败");
      setMessage(`${provider.display_name} 配置已保存`);
      await loadProviders();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存供应商配置失败");
    } finally {
      setBusyProvider(null);
    }
  }

  async function test(provider: ProviderConfig) {
    setBusyProvider(provider.provider);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/provider-configs/${provider.provider}/test`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "供应商连接测试失败");
      setMessage(`${provider.display_name} 连接测试通过`);
      await loadProviders();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "供应商连接测试失败");
      await loadProviders();
    } finally {
      setBusyProvider(null);
    }
  }

  async function loadCatalog(provider: ProviderConfig) {
    setBusyProvider(provider.provider);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/provider-configs/${provider.provider}/models`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "查询供应商模型失败");
      const models = data.models || [];
      setCatalogs((current) => ({ ...current, [provider.provider]: models }));
      setSelected((current) => ({ ...current, [provider.provider]: models.map((model: CatalogModel) => model.id) }));
      setMessage(`${provider.display_name} 返回 ${models.length} 个模型`);
    } catch (catalogError) {
      setError(catalogError instanceof Error ? catalogError.message : "查询供应商模型失败");
    } finally {
      setBusyProvider(null);
    }
  }

  async function importModels(provider: ProviderConfig) {
    const ids = selected[provider.provider] || [];
    if (ids.length === 0) {
      setError("请先选择至少一个模型");
      return;
    }
    setBusyProvider(provider.provider);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/provider-configs/${provider.provider}/models/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider_model_ids: ids }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "导入模型失败");
      setMessage(`已导入 ${data.count || 0} 个模型，请在下方模型列表调整 Credits 和启用状态`);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "导入模型失败");
    } finally {
      setBusyProvider(null);
    }
  }

  function toggleSelected(provider: string, modelId: string) {
    setSelected((current) => {
      const values = current[provider] || [];
      return { ...current, [provider]: values.includes(modelId) ? values.filter((id) => id !== modelId) : [...values, modelId] };
    });
  }

  return (
    <section className="admin-provider-section">
      <div className="admin-section-heading">
        <div>
          <span className="admin-eyebrow">Provider control · 01-03</span>
          <h2>供应商连接与模型发现</h2>
          <p>API Key 只在服务端使用并以密文保存；模型生成优先读取数据库配置，未配置时继续回退到环境变量。</p>
        </div>
        <div className="admin-model-summary"><span><KeyRound size={13} /> 数据库配置</span><span><Link2 size={13} /> 连接测试</span><span><Search size={13} /> 模型发现</span></div>
      </div>

      {message && <div className="admin-inline-message admin-inline-message--success">{message}</div>}
      {error && <div className="admin-inline-message admin-inline-message--error">{error}</div>}

      {loading ? <p className="admin-empty">正在加载供应商配置…</p> : (
        <div className="admin-provider-grid">
          {providers.map((provider) => {
            const catalog = catalogs[provider.provider] || [];
            const currentSelected = selected[provider.provider] || [];
            const busy = busyProvider === provider.provider;
            return (
              <article className="admin-provider-card" key={provider.provider}>
                <div className="admin-provider-card__head">
                  <div><span className="admin-eyebrow">{provider.provider}</span><h3>{provider.display_name}</h3></div>
                  <span className={`admin-status admin-status--${provider.api_key_set ? "active" : "failed"}`}>{provider.api_key_set ? "已配置" : "缺少 Key"}</span>
                </div>
                <form className="admin-provider-form" onSubmit={(event) => { event.preventDefault(); void save(provider, event.currentTarget); }}>
                  <label>Base URL<input className="input" name="base_url" defaultValue={provider.base_url} required /></label>
                  <label>模型列表路径<input className="input" name="models_path" defaultValue={provider.models_path} required /></label>
                  <label>API Key <span className="admin-form-help">{provider.api_key_set ? `已设置，末四位 ${provider.api_key_last4 || "****"}；留空保持不变` : `当前回退变量：${provider.environment_variable}`}</span><input className="input" name="api_key" type="password" autoComplete="new-password" placeholder={provider.api_key_set ? "留空保持现有 Key" : "输入供应商 API Key"} /></label>
                  <label className="admin-provider-check"><input name="is_active" type="checkbox" defaultChecked={provider.is_active} />启用此供应商</label>
                  {provider.source === "database" && <label className="admin-provider-check"><input name="clear_api_key" type="checkbox" />清除数据库中的 Key（改用环境变量）</label>}
                  <div className="admin-provider-actions">
                    <button className="admin-action-button admin-action-button--primary" type="submit" disabled={busy}><Save size={14} />保存</button>
                    <button className="admin-action-button" type="button" onClick={() => void test(provider)} disabled={busy}><RefreshCw size={14} className={busy ? "admin-spin" : ""} />测试连接</button>
                    <button className="admin-action-button" type="button" onClick={() => void loadCatalog(provider)} disabled={busy}><Search size={14} />查询模型</button>
                  </div>
                </form>
                {provider.last_test_message && <div className={`admin-provider-test admin-provider-test--${provider.last_test_status}`}><span>{provider.last_test_status === "passed" ? <CheckCircle2 size={14} /> : <XCircle size={14} />}{provider.last_test_message}</span></div>}
                {catalog.length > 0 && <div className="admin-provider-catalog"><div className="admin-provider-catalog__head"><strong>供应商模型（已选 {currentSelected.length} 个）</strong><button className="admin-action-button" type="button" onClick={() => void importModels(provider)} disabled={busy}><Download size={14} />一键导入</button></div><div className="admin-provider-catalog__list">{catalog.map((model) => <label key={model.id}><input type="checkbox" checked={currentSelected.includes(model.id)} onChange={() => toggleSelected(provider.provider, model.id)} /><span><strong>{model.name}</strong><small>{model.id} · {model.type}</small></span></label>)}</div></div>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
