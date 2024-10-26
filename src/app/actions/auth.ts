"use server";

import {
  SignUpInput,
  SignInInput,
  signUpSchema,
  signInSchema,
} from "@/lib/schemas";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function signUp(input: SignUpInput) {
  const result = signUpSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signIn(input: SignInInput) {
  const result = signInSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function createUser(data: SignUpInput) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: user, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  return { user, error };
}
