// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { signOut } from "@/app/actions/auth";
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
    <div>
      <h1>Welcome, {user.user_metadata.name || user.email}</h1>

      {/* <button onClick={handleSignOut} type="submit">
        Sign Out
      </button> */}
    </div>
  );
}
