"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#090b10] px-5 text-[#f5f6f2] selection:bg-[#d7f35b] selection:text-[#090b10]">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <span className="relative grid size-12 place-items-center rounded-2xl bg-[#d7f35b] text-[#090b10] shadow-[0_0_48px_rgba(215,243,91,.2)]">
            <span className="size-4 rotate-45 rounded-full border-[3px] border-[#090b10] border-r-transparent" />
            <span className="absolute size-7 -rotate-45 rounded-full border-[3px] border-[#090b10]/60 border-l-transparent" />
          </span>
        </div>
        <p className="text-xs font-bold uppercase tracking-[.25em] text-[#d7f35b]">
          Error 404
        </p>
        <h1 className="font-display mt-4 text-5xl font-bold tracking-[-.06em]">
          Page not found.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-[15px] leading-7 text-white/50">
          The page you're looking for doesn't exist — it may have been moved or
          deleted.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-9 inline-flex items-center gap-2 rounded-full bg-[#d7f35b] px-6 py-3.5 text-sm font-bold text-[#090b10] transition hover:-translate-y-1 hover:bg-[#e4fb7a] active:scale-[.97]"
        >
          Back to home <ArrowUpRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
