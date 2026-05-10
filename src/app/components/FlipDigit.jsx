"use client";

import { useEffect, useState } from "react";

export default function FlipDigit({
  value,
}) {
  const [display, setDisplay] =
    useState(value);

  const [animate, setAnimate] =
    useState(false);

  useEffect(() => {
    if (value !== display) {
      setAnimate(true);

      const timeout = setTimeout(() => {
        setDisplay(value);
        setAnimate(false);
      }, 120);

      return () =>
        clearTimeout(timeout);
    }
  }, [value, display]);

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-lg
        bg-black
        border border-red-950
        flex items-center justify-center
        shadow-inner
        w-9 h-12
        md:w-14 md:h-18
      "
    >
      {/* background glow */}
      <div className="absolute inset-0 pointer-events-none bg-red-500/5" />

      {/* scanline */}
      <div
        className="
          absolute
          inset-0
          opacity-20
          pointer-events-none
        "
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.05) 51%)",
          backgroundSize: "100% 4px",
        }}
      />

      <div
        className={`
          led-text
          font-black
          text-2xl
          md:text-5xl
          transition-all
          duration-100
          ${
            animate
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }
        `}
      >
        {display}
      </div>
    </div>
  );
}