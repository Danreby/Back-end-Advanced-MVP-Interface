import { useState } from "react";
import { register, login } from "../../API/auth";
import { toast } from "react-toastify";

export default function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({ name, email, password });

      toast.success("Conta criada com sucesso! Fazendo login...");

      const data = await login({ email, password });
      localStorage.setItem("token", data.access_token);

      window.location.href = "/";
    } catch (err) {
      console.error(err);

      if (err.response?.status === 400 && err.response?.data?.detail?.includes("email")) {
        toast.error("Email já está em uso.");
      } else if (err.response?.status === 422) {
        toast.error("Dados inválidos. Verifique os campos.");
      } else {
        toast.error("Erro ao registrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = () => {
    if (typeof onSwitch === "function") {
      onSwitch();
    } else {
      window.location.href = "/Login";
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden
      bg-gradient-to-br from-white via-gray-50 to-gray-100
      dark:from-slate-900 dark:via-indigo-950 dark:to-black
      transition-colors duration-300"
    >
      <div className="flex items-center justify-center h-full px-4">
        <div className="relative z-20 w-full max-w-md">
          <div
            className="backdrop-blur-md bg-white/95 text-gray-900 border border-gray-200
            dark:bg-gray-900/60 dark:text-white dark:border-gray-700
            rounded-3xl p-8 shadow-2xl transition-colors duration-300"
          >
            <h2 className="text-2xl font-extrabold mb-4 text-center">Registrar</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome de usuário"
                maxLength={255}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300
                dark:bg-gray-800 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400"
                required
              />
              <input
                type="email"
                placeholder="Email"
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300
                dark:bg-gray-800 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                maxLength={255}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300
                dark:bg-gray-800 dark:border-gray-700
                focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold tracking-wide
                bg-emerald-500 text-white shadow-lg
                hover:bg-emerald-600 disabled:opacity-60"
              >
                {loading ? "Processando..." : "Registrar"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              Já tem conta?{" "}
              <button type="button" onClick={handleSwitch} className="underline hover:opacity-90">
                Entrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
