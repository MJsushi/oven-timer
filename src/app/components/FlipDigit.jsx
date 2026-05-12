"use client";

export default function FlipDigit({
  value,
}) {
  return (
    <div
      className="
        relative
        flex
        items-center
        justify-center

        w-[42px]
        h-[64px]

        sm:w-[52px]
        sm:h-[78px]

        md:w-[64px]
        md:h-[96px]

        rounded-xl
        border
        border-red-950

        bg-black

        overflow-hidden

        shadow-[0_0_20px_rgba(255,0,0,0.15)]
      "
    >
      {/* glow */}
      <div className="absolute inset-0 bg-red-500/5" />

      {/* number */}
      <div
        className="
          relative
          z-10

          led-text
          led-pulse

          text-[34px]
          sm:text-[42px]
          md:text-[54px]

          font-black
          leading-none
        "
      >
        {value}
      </div>

      {/* center line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-red-950/70" />

      {/* scanline */}
      <div
        className="
          absolute
          inset-0
          opacity-20
          pointer-events-none
          bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.05)_51%)]
          bg-[size:100%_4px]
        "
      />
    </div>
  );
}