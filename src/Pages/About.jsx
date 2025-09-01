// src/pages/About.jsx
import React from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/common/NavBar";
import { logout } from "../API/auth";

export default function About() {
  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 280, damping: 26 },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      {/* BG Blobs animados */}
      <motion.div
        className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60"
        animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40"
        animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25 bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      {/* Navbar */}
      <Navbar onLogout={logout} />

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sobre Nós
        </motion.h1>

        <motion.div
          className="rounded-3xl p-6 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700"
          variants={cardVariants}
          initial="hidden"
          animate="show"
        >
          <p className="text-lg leading-relaxed">
            Este projeto foi desenvolvido para <span className="font-semibold">[seu objetivo aqui]</span>.  
            Nosso foco é oferecer uma experiência simples, moderna e acessível, utilizando as melhores práticas de desenvolvimento web.
          </p>

          <p className="mt-4 text-lg leading-relaxed">
            Tecnologias principais: <span className="font-semibold">React</span>,{" "}
            <span className="font-semibold">Tailwind</span>,{" "}
            <span className="font-semibold">Framer Motion</span> e{" "}
            <span className="font-semibold">Laravel</span>.
          </p>

          <p className="mt-4 text-lg leading-relaxed">
            Criado por <span className="font-semibold">[Seu Nome]</span> e sempre em constante evolução 🚀.
          </p>
        </motion.div>
      </main>

      {/* Elementos de detalhe no fundo */}
      <div className="pointer-events-none absolute inset-0 z-30">
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm"
        />
        <motion.div
          animate={{ x: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm"
        />
      </div>
    </div>
  );
}
