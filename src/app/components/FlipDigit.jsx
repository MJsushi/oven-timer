"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function FlipDigit({ value }) {
  return (
    <div className="relative w-10 h-14 md:w-14 md:h-20 bg-black rounded-lg overflow-hidden border border-zinc-700 shadow-inner">
      
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center text-red-500 font-black text-3xl md:text-5xl font-mono"
          style={{ transformPerspective: 800 }}
        >
          {value}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}