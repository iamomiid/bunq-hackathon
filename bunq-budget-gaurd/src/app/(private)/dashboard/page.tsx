import Dashboard from "./Dashboard";
import { isAccountLimited } from "@/actions/account-limit";

export default async function DashboardPage() {
  const isUsersAccountLimited = await isAccountLimited();
  return <Dashboard isAccountLimited={isUsersAccountLimited} />;
}
