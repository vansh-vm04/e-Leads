"use client";

import PageLoader from "@/components/PageLoader";
import Logo from "@/components/ui/logo";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/buyers");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await signIn("email", {
        email,
        callbackUrl: session?.user?.name ? "/buyers" : "/profile",
      });

      if (res?.ok) {
        setMessage("Check your email for a login link!");
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Error signing in. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4 w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <Logo />
        <span className="text-2xl font-bold text-center mb-6">
          Sign in to continue
        </span>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full text-black px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Continue"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
}
