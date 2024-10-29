// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { signOut } from "@/app/actions/auth";
import NewChat from "@/components/NewChat";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return <div>error...</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  // const handleSignOut = async () => {
  //   await signOut();
  // };

  return <NewChat />;
}
