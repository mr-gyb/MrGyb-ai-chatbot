import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { signOut } from "@/app/actions/auth";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.user_metadata.name || user.email}</h1>
      <form
        action={async () => {
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}
