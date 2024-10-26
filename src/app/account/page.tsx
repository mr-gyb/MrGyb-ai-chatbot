import { redirect } from "next/navigation";
import { getUser } from "@/utils/supabase/server";

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <p>Welcome, {user.user_metadata.name || user.email}!</p>
      {/* Add more account-related content here */}
    </div>
  );
}
