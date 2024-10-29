import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { signInWithGoogle } from "@/app/actions/auth";
// import { createClient as createSupabaseBrowser } from "@/utils/supabase/client";

export const Social = () => {
  const [isLoading, setIsLoading] = useState(false);
  const loginWithProvider = async (provider: "github" | "google") => {
    // const supbase = createSupabaseBrowser();
    // await supbase.auth.signInWithOAuth({
    //   provider,
    //   options: {
    //     redirectTo:
    //       window.location.origin + `/auth/callback?next=` + redirectTo,
    //   },
    // });

    if (provider === "google") {
      setIsLoading(true);
      await signInWithGoogle(window.location.origin);
    }
  };

  //   async function GoogleSignInButton() {
  //     const handleGoogleSignIn = async () => {
  //       try {
  //         setIsLoading(true);
  //         await signInWithGoogle();
  //       } catch (error) {
  //         console.error("Google sign-in error:", error);
  //         // Handle error appropriately
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //       function loginWithProvider(arg0: string): void {
  //           throw new Error("Function not implemented.");
  //       }

  return (
    <Button
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={() => loginWithProvider("google")}
      className="w-full"
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" />
      )}
      Continue with Google
    </Button>
  );
};

export default Social;
