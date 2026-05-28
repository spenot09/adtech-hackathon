"use client";

import type { Ad, Brand } from "@/lib/types/agent";

type Props = {
  ad: Ad;
  brand: Brand;
};

function AccentShape({
  shape,
}: {
  shape: "circle" | "diamond" | "wave" | "burst";
}) {
  const base =
    "absolute opacity-20 pointer-events-none";

  if (shape === "circle") {
    return (
      <div
        className={`${base} w-32 h-32 rounded-full bg-white -right-6 -top-6`}
      />
    );
  }
  if (shape === "diamond") {
    return (
      <div
        className={`${base} w-24 h-24 bg-white rotate-45 -right-8 top-4`}
      />
    );
  }
  if (shape === "burst") {
    return (
      <div
        className={`${base} w-40 h-40 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
        }}
      />
    );
  }
  // wave — SVG
  return (
    <svg
      className={`${base} w-full bottom-12 left-0 opacity-10`}
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
    >
      <path
        d="M0,30 C100,0 200,60 300,30 C350,15 380,25 400,30 L400,60 L0,60 Z"
        fill="white"
      />
    </svg>
  );
}

function motionClass(hint?: "pulse" | "float" | "shimmer"): string {
  if (hint === "pulse") return "animate-pulse";
  if (hint === "float") return "animate-float";
  if (hint === "shimmer") return "animate-shimmer";
  return "";
}

export default function AdCard({ ad, brand }: Props) {
  return (
    <div
      className="relative rounded-2xl shadow-lg overflow-hidden border"
      style={{
        borderColor: brand.color,
        background: ad.imageStyle.background,
        aspectRatio: "4/3",
      }}
    >
      {/* Accent shape */}
      <AccentShape shape={ad.imageStyle.accentShape} />

      {/* Brand wordmark */}
      <div className="absolute top-3 left-3 z-10">
        <span className="text-white font-bold text-xs tracking-widest uppercase opacity-90 drop-shadow">
          {brand.name}
        </span>
      </div>

      {/* Fallback tag */}
      {ad.source === "fallback" && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs bg-black/40 text-white/70 px-1.5 py-0.5 rounded">
            fallback
          </span>
        </div>
      )}

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <span className={`text-6xl drop-shadow-lg ${motionClass(ad.imageStyle.motionHint)}`}>
          {ad.imageStyle.iconEmoji}
        </span>
      </div>

      {/* Bottom content panel */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 p-3"
        style={{ backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.45)" }}
      >
        <p className="text-white font-bold text-sm leading-tight mb-0.5">
          {ad.headline}
        </p>
        <p className="text-white/80 text-xs leading-snug mb-2 line-clamp-2">
          {ad.body}
        </p>
        <button
          className="text-xs font-semibold px-3 py-1 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: brand.color }}
        >
          {ad.cta}
        </button>
      </div>
    </div>
  );
}
