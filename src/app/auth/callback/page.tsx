"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();

        if (!error) {
          setStatus("success");
          // 延迟跳转，让用户看到成功状态
          setTimeout(() => {
            router.push("/generate");
          }, 1500);
        } else {
          console.error("Auth error:", error);
          setStatus("error");
        }
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Signing you in...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✓</div>
            <p className="text-neutral-100 font-medium">Successfully signed in!</p>
            <p className="text-neutral-400 text-sm mt-2">Redirecting to generate page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl mb-4">✗</div>
            <p className="text-neutral-100 font-medium">Sign in failed</p>
            <button
              onClick={() => router.push("/login")}
              className="btn-primary mt-4"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}