"use client";

import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export function useGetUserDetails(): UseUserReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      return user;
    },
  });

  return {
    user: data ?? null,
    isLoading,
    error: error as Error | null,
  };
}
