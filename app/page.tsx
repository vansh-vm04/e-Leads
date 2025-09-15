'use client'

import PageLoader from "@/components/PageLoader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else {
      router.push("/buyers");
    }
  }, [status, router]);
  return (
    <div>
      <PageLoader />
    </div>
  );
}
