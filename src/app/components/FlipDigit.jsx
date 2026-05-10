"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function FlipDigit({ value }) {
  return (
    <div
      className="
        relative
        w-10 h-14
        md:w-14 md:h-20
        overflow-hidden
        rounded-xl
        border border-red-900/40
        bg-black
        shadow-inner
      "
    >
      {/* glow background */}
      <div className="absolute inset-0 bg-red-500/5 blur-xl" />

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{
            y: "-100%",
            opacity: 0,
            filter: "blur(4px)",
          }}
          animate={{
            y: "0%",
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{
            y: "100%",
            opacity: 0,
            filter: "blur(4px)",
          }}
          transition={{
            duration: 0.22,
            ease: "easeInOut",
          }}
          className="
            absolute inset-0
            flex items-center justify-center
            text-3xl md:text-5xl
            font-black font-mono
            led-red led-glow
          "
        >
          {value}
        </motion.div>
      </AnimatePresence>

      {/* scan line */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(255,255,255,0.03)_51%)] bg-[size:100%_4px]" />
    </div>
  );
}