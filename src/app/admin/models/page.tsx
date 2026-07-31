import { getAdminModels } from "@/lib/admin-data";
import AdminModelManager from "@/components/admin/AdminModelManager";
import AdminProviderConfigManager from "@/components/admin/AdminProviderConfigManager";

export default async function AdminModelsPage() {
  const models = await getAdminModels();

  return (
    <div className="admin-page">
      <AdminProviderConfigManager />
      <AdminModelManager initialModels={models} />
    </div>
  );
}
