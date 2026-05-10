"use client";

import { motion } from "framer-motion";

export default function FlipDigit({ value }) {
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
      "
    >
      {/* soft glow */}
      <div className="absolute inset-0 bg-red-500/5" />

      <motion.div
        key={value}
        initial={{
          y: -20,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.16,
          ease: "easeOut",
        }}
        className="
          absolute inset-0
          flex items-center justify-center
          text-3xl md:text-5xl
          font-black font-mono
          led-red
          will-change-transform
        "
      >
        {value}
      </motion.div>

      {/* scan line */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.02)_51%)] bg-[size:100%_4px]" />
    </div>
  );
}