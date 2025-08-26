import { useState } from "react";
import { register } from "../../API/auth";

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password });
      setMessage("Registro realizado! Verifique seu email.");
      // window.location.href = "/Login";
    } catch (err) {
      setMessage("Erro ao registrar usuário.");
    }
  };

  const handleSwitch = () => {
    console.log("[Register] handleSwitch - onSwitch type:", typeof onSwitch);
    if (typeof onSwitch === "function") {
      onSwitch();
    } else {
      window.location.href = "/Login";
    }
  };

  const isError = message && message.toLowerCase().includes("erro");

  return (
    <div
      className={`
        relative w-full h-screen overflow-hidden
        bg-gradient-to-br
          from-white via-gray-50 to-gray-100
          dark:from-slate-900 dark:via-indigo-950 dark:to-black
        transition-colors duration-300
      `}
    >
      <div className="absolute -left-20 -top-12 w-72 h-72 rounded-full filter blur-3xl opacity-40 bg-indigo-200/30 dark:bg-indigo-900/60" />
      <div className="absolute right-20 -bottom-20 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" />
      <div className="absolute left-1/2 top-8 w-60 h-60 rounded-full filter blur-2xl opacity-25 bg-pink-200/25 dark:bg-violet-900/30 transform -translate-x-1/2" />

      <div className="flex items-center justify-center h-full px-4">
        <div className="relative z-20 w-full max-w-md">
          <div
            className="
              backdrop-blur-md
              bg-white/95 text-gray-900 border border-gray-200
              dark:bg-gray-900/60 dark:text-white dark:border-gray-700
              rounded-3xl p-8 shadow-2xl
              transition-colors duration-300
            "
          >
            <h2 className="text-2xl font-extrabold mb-4 text-gray-900 dark:text-white text-center">Registrar</h2>

            {message && (
              <p
                className={`mb-3 text-sm font-medium px-3 py-2 rounded-lg ${
                  isError ? "bg-red-600/90 text-white" : "bg-emerald-600/90 text-white"
                }`}
                role="status"
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-label="formulário de registro">
              <label className="block">
                <span className="sr-only">Nome</span>
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`
                    w-full p-3 rounded-xl border border-gray-300
                    bg-white placeholder:text-gray-500 text-gray-900
                    dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400
                    transition
                  `}
                  required
                  aria-label="nome"
                />
              </label>

              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`
                    w-full p-3 rounded-xl border border-gray-300
                    bg-white placeholder:text-gray-500 text-gray-900
                    dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400
                    transition
                  `}
                  required
                  aria-label="email"
                />
              </label>

              <label className="block">
                <span className="sr-only">Senha</span>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`
                    w-full p-3 rounded-xl border border-gray-300
                    bg-white placeholder:text-gray-500 text-gray-900
                    dark:bg-gray-800 dark:border-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100
                    focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400
                    transition
                  `}
                  required
                  aria-label="senha"
                />
              </label>

              <button
                type="submit"
                className={`
                  w-full py-3 rounded-xl font-semibold tracking-wide
                  bg-emerald-500 text-white shadow-lg
                  hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed
                  dark:bg-gradient-to-r dark:from-indigo-800 dark:to-cyan-900 dark:text-white
                  transition
                `}
              >
                Registrar
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
              Já tem conta?{" "}
              <button type="button" onClick={handleSwitch} className="underline hover:opacity-90">
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm" />
        <div className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm" />
      </div>
    </div>
  );
}
