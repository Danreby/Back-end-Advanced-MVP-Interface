import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../../API/auth";
import MailIcon from "../../components/icons/MailIcon";
import LockIcon from "../../components/icons/LockIcon";
import CorpIcon from "../../components/icons/CorpIcon";

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      window.location.href = "/";
    } catch (err) {
      setError("Credenciais inválidas");
      setLoading(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
    shake: { x: [0, -8, 8, -6, 6, 0], transition: { duration: 0.6 } },
  };

  const blobAnim = {
    animate: {
      y: [0, -20, 0],
      x: [0, 10, -10, 0],
      rotate: [0, 2, -2, 0],
      transition: { repeat: Infinity, duration: 8, ease: "easeInOut" },
    },
  };

  const handleSwitch = () => {
    console.log("[Login] handleSwitch - onSwitch type:", typeof onSwitch, onSwitch);
    if (typeof onSwitch === "function") {
      onSwitch();
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <div className="
      relative w-full h-screen overflow-hidden
      bg-gradient-to-br
      from-white via-gray-50 to-gray-100
      dark:from-slate-900 dark:via-indigo-950 dark:to-black
      transition-colors duration-300
    ">
      <motion.div
        className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40
          bg-indigo-200/40 dark:bg-indigo-900/60"
        {...blobAnim}
      />
      <motion.div
        className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30
          bg-emerald-200/30 dark:bg-sky-900/40"
        animate={{ x: [0, -30, 0], y: [0, -15, 0], transition: { duration: 10, repeat: Infinity, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25
          bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2"
        animate={{ scale: [1, 1.08, 1], transition: { duration: 7, repeat: Infinity } }}
      />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <g className="opacity-10">
            <circle cx="5" cy="30" r="0.6" fill="white" />
            <circle cx="20" cy="10" r="0.5" fill="white" />
            <circle cx="80" cy="40" r="0.4" fill="white" />
            <circle cx="60" cy="80" r="0.5" fill="white" />
            <circle cx="90" cy="10" r="0.35" fill="white" />
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-center h-full px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={cardVariants}
          className="relative z-20 w-full max-w-md"
        >
          <motion.div
            layout
            className="
              backdrop-blur-md
              bg-white/95 text-gray-900 border border-gray-200
              dark:bg-gray-900/60 dark:text-white dark:border-gray-700
              rounded-3xl p-8 shadow-2xl
              transition-colors duration-300
            "
          >
            <div className="flex flex-col items-center mb-6">
              <motion.div
                initial={{ rotate: 0, scale: 0.9, opacity: 0 }}
                animate={{ rotate: [0, 360], scale: [0.9, 1], opacity: 1 }}
                transition={{ duration: 1.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center bg-white/8 backdrop-blur-md"
                aria-hidden
              >
                <svg width="48" height="48" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill="url(#g)" d="m7.788 2.34-.799 1.278A.25.25 0 0 0 7.201 4h1.598a.25.25 0 0 0 .212-.382l-.799-1.279a.25.25 0 0 0-.424 0Zm0 11.32-.799-1.277A.25.25 0 0 1 7.201 12h1.598a.25.25 0 0 1 .212.383l-.799 1.278a.25.25 0 0 1-.424 0ZM3.617 9.01 2.34 8.213a.25.25 0 0 1 0-.424l1.278-.799A.25.25 0 0 1 4 7.201V8.8a.25.25 0 0 1-.383.212Zm10.043-.798-1.277.799A.25.25 0 0 1 12 8.799V7.2a.25.25 0 0 1 .383-.212l1.278.799a.25.25 0 0 1 0 .424Z"/>
                  <path fill="url(#g)" d="M6.5 0A1.5 1.5 0 0 0 5 1.5v3a.5.5 0 0 1-.5.5h-3A1.5 1.5 0 0 0 0 6.5v3A1.5 1.5 0 0 0 1.5 11h3a.5.5 0 0 1 .5.5v3A1.5 1.5 0 0 0 6.5 16h3a1.5 1.5 0 0 0 1.5-1.5v-3a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 0 16 9.5v-3A1.5 1.5 0 0 0 14.5 5h-3a.5.5 0 0 1-.5-.5v-3A1.5 1.5 0 0 0 9.5 0zM6 1.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3A1.5 1.5 0 0 0 11.5 6h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a1.5 1.5 0 0 0-1.5 1.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3A1.5 1.5 0 0 0 4.5 10h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 0 6 4.5z"/>
                  <defs>

                    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0" stopColor="#7C3AED" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              <h2 className="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white text-center">Bem-vindo de volta</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Faça login para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="formulário de login">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => {}}
                  >
                    <motion.div
                      key={error}
                      variants={cardVariants}
                      animate="shake"
                      className="mb-1 bg-red-600/90 text-white px-3 py-2 rounded-lg text-sm font-medium"
                      role="alert"
                    >
                      {error}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="block">
                <span className="sr-only">Email</span>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full p-3 pl-11 rounded-xl
                      bg-white border border-gray-300 placeholder:text-gray-500 text-gray-900
                      dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400
                      transition
                    "
                    required
                    aria-required
                    aria-label="email"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-90">
                    <MailIcon type={1} className="text-gray-600 dark:text-white" />
                  </div>
                </div>
              </label>

              <label className="block">
                <span className="sr-only">Senha</span>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full p-3 pl-11 rounded-xl
                      bg-white border border-gray-300 placeholder:text-gray-500 text-gray-900
                      dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400
                      transition
                    "
                    required
                    aria-required
                    aria-label="senha"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 opacity-90">
                    <LockIcon type={1} className="text-gray-600 dark:text-white" />
                  </div>
                </div>
              </label>

              <div className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="accent-gray-700 dark:accent-white/90" />
                  <span>lembrar-me</span>
                </label>
                <a href="#" className="hover:underline text-gray-700 dark:text-gray-300">Esqueceu a senha?</a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -3 }}
                  disabled={loading}
                  className="
                    col-span-2 py-3 rounded-xl font-semibold tracking-wide
                    bg-white text-gray-900 border border-gray-200
                    dark:bg-gradient-to-r dark:from-indigo-800 dark:to-cyan-900 dark:text-white dark:border-transparent
                    shadow-lg disabled:opacity-60 disabled:cursor-not-allowed
                    transition
                  "
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" strokeOpacity="0.3" fill="none"></circle>
                        <path d="M22 12a10 10 0 0 1-10 10" strokeWidth="3" stroke="currentColor" strokeLinecap="round" fill="none"></path>
                      </svg>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    <span>Entrar</span>
                  )}
                </motion.button>

              </div>

              {/* <div className="mt-4 flex items-center justify-center gap-3">
                <button type="button" className="px-3 py-2 rounded-lg bg-white/6 backdrop-blur-sm hover:scale-105 transition">
                  <CorpIcon type={1} className="dark:text-white"/>
                </button>
                <button type="button" className="px-3 py-2 rounded-lg bg-white/6 backdrop-blur-sm hover:scale-105 transition">
                  <CorpIcon type={2} className="dark:text-white"/>
                </button>
              </div> */}
            </form>

            {/* <p className="mt-6 text-center text-xs text-gray-600 dark:text-gray-400">Ao continuar, você concorda com nossos termos e políticas.</p> */}
          </motion.div>

        <div className="mt-4 text-center text-white/60 text-sm">
          Não tem uma conta?{" "}
          <button type="button" onClick={handleSwitch} className="underline hover:opacity-90">
            Cadastre-se
          </button>
        </div>
        </motion.div>
      </div>

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
