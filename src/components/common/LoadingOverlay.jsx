import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingOverlay({ open = false, text = "Carregando..." }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-hidden={!open}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-gray-100/60 to-gray-200/40 dark:from-slate-900/90 dark:via-indigo-950/70 dark:to-black/80 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: [0.96, 1.02, 1], opacity: 1 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 w-full max-w-sm rounded-3xl p-6 bg-white/95 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-white/8 backdrop-blur-md"
                aria-hidden
              >
                <svg width="48" height="48" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#7C3AED" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <path fill="url(#g2)" d="M6.5 0A1.5 1.5 0 0 0 5 1.5v3a.5.5 0 0 1-.5.5h-3A1.5 1.5 0 0 0 0 6.5v3A1.5 1.5 0 0 0 1.5 11h3a.5.5 0 0 1 .5.5v3A1.5 1.5 0 0 0 6.5 16h3a1.5 1.5 0 0 0 1.5-1.5v-3a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 0 16 9.5v-3A1.5 1.5 0 0 0 14.5 5h-3a.5.5 0 0 1-.5-.5v-3A1.5 1.5 0 0 0 9.5 0z" />
                </svg>
              </motion.div>

              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{text}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Aguarde enquanto carregamos seus dados.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
