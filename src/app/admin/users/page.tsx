import { getAdminUsers } from "@/lib/admin-data";
import AdminUserManager from "@/components/admin/AdminUserManager";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <AdminUserManager initialUsers={users} />;
}
