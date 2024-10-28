"use server";

import {
  SignUpInput,
  SignInInput,
  signUpSchema,
  signInSchema,
} from "@/lib/schemas";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function signUp(input: SignUpInput) {
  const supabase = await createClient();
  const result = signUpSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { error } = await supabase.auth.signUp({
    email: input.email as string,
    password: input.password as string,
    options: {
      data: {
        name: input.fullname,
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
  const supabase = await createClient();
  const result = signInSchema.safeParse(input);
  if (!result.success) {
    return { error: result.error.format() };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: input.email as string,
    password: input.password as string,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
