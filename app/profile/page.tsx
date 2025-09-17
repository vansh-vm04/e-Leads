"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import PageLoader from "@/components/PageLoader";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      if (session?.user?.name) {
        router.push("/buyers");
      }
    } else {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleContinue = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { name } }),
      });

      if (!res.ok) {
        throw new Error("Failed to update name");
      }

      router.push("/buyers");
    } catch (err) {
      console.error("Error updating name:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <PageLoader />;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full"
              onClick={handleContinue}
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
