// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { signOut } from "@/app/actions/auth";
import { Header } from "@/components/Header";
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto pt-20">
        <NewChat />
      </main>
    </div>
  );
}
