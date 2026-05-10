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
      }, 90);

      return () =>
        clearTimeout(timeout);
    }
  }, [value, display]);

  return (
    <div
      className="
        relative
        w-10 h-14
        md:w-14 md:h-20
        overflow-hidden
        rounded-xl
        border border-red-900/30
        bg-black
        flex items-center justify-center
      "
    >
      {/* scanline */}
      <div
        className="
          absolute inset-0
          pointer-events-none
          opacity-30
          bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.03)_51%)]
          bg-[size:100%_4px]
        "
      />

      {/* digit */}
      <div
        className={`
          absolute
          inset-0
          flex
          items-center
          justify-center
          text-3xl
          md:text-5xl
          font-black
          leading-none
          timer-digit
          font-['var(--font-dot)']
          led-red
          transition-all
          duration-100
          ease-linear
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