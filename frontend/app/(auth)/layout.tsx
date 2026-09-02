import Link from "next/link";

import { DotGridBackground } from "@/components/DotGridBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12">
      <DotGridBackground />

      <Link href="/" className="mb-8 text-lg font-semibold tracking-tight text-foreground">
        UBRA
      </Link>

      {children}
    </div>
  );
}
