"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/app/actions/auth";
// import { login } from "@/app/auth/signin/action";
import { SignInInput, signInSchema } from "@/lib/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Social from "./Social";

export function LogInForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    const result = await signIn(data);
    if ("error" in result) {
      setServerError(
        typeof result.error === "string" ? result.error : "An error occurred"
      );
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Sign in to GYB AI
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("email")}
              type="email"
              placeholder="Email"
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("password")}
              type="password"
              placeholder="Password"
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="text-red-500">{serverError}</p>}

          <button
            type="submit"
            className="w-full bg-slate-800 text-white rounded-full py-3 px-4 font-semibold"
          >
            Log In
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Social />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p>
            {`Don't have an account? `}
            <Link href="/auth/signup" className="text-navy-blue">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
