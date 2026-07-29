import { getAdminModels } from "@/lib/admin-data";
import AdminModelManager from "@/components/admin/AdminModelManager";

export default async function AdminModelsPage() {
  const models = await getAdminModels();

  return <AdminModelManager initialModels={models} />;
}
