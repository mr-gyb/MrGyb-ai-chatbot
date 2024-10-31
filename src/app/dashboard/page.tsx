"use client";

import { useGetUserDetails } from "@/hooks/useGetUserDetails";
import { Header } from "@/components/Header";
import NewChat from "@/components/NewChat";

export default function DashboardPage() {
  const { user, isLoading, error } = useGetUserDetails();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto pt-20">
        <NewChat />
      </main>
    </div>
  );
}
