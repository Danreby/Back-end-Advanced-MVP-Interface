import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getProfile } from "../API/user";
import { Navbar } from "../components/common/NavBar";
import { logout, isAuthenticated } from "../API/auth";
import LoadingOverlay from "../components/common/LoadingOverlay";

export default function About() {
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;

    const token = isAuthenticated();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    getProfile()
      .then((u) => {
        if (!mounted) return;
        setUser(u);
      })
      .catch(() => {
        if (mounted) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      })
      .finally(() => mounted && setLoadingProfile(false));

    return () => {
      mounted = false;
    };
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 280, damping: 26 },
    },
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
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

        <LoadingOverlay open={true} text={"Carregando perfil..."} />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
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

      <Navbar user={user} onLogout={logout} />

      <main className="max-w-5xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Sobre
        </motion.h1>

        <motion.div
          className="rounded-3xl p-6 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700"
          variants={cardVariants}
          initial="hidden"
          animate="show"
        >
          <p className="text-lg leading-relaxed">
            Olá, <span className="font-semibold">{user?.name}</span> 👋  
            Deixe eu contar um pouco sobre este projeto.
          </p>

          <p className="mt-4 text-lg leading-relaxed">
            Este projeto acadêmico foi desenvolvido para a entrega do MVP da disciplina de {" "}
            <span className="font-semibold">Back-End Avançado</span> na <span className="font-semibold">PUC-RIO</span>. {" "}  
            A ideia surgiu da minha paixão por jogos e a necessidade de organizar minha coleção.  
            Assim, nasceu o <span className="font-semibold">CatGame</span>, um catálogo pessoal de jogos com avaliações e filtros.
          </p>

          <p className="mt-4 text-lg leading-relaxed">
            Ele utiliza as tecnologias:
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                <ul className="list-disc list-inside mt-2 border rounded-lg p-2">Front-End:
                    <li>React para a interface do usuário;</li>
                    <li>Tailwind CSS para estilização;</li>
                    <li>Node.js com Express no backend;</li>
                    <li>JWT para autenticação segura.</li>
                </ul>
                <ul className="list-disc list-inside mt-2 border rounded-lg p-2">Back-End:
                    <li>Python com Flask para a API;</li>
                    <li>SQLAlchemy para ORM;</li>
                    <li>MySQL como banco de dados;</li>
                    <li>Docker para conteinerização.</li>
                </ul>
            </div>
          </p>

          <p className="mt-4 text-lg leading-relaxed">
            Criado por <span className="font-semibold">Bernardo Santos Rolim</span>, sempre
            buscando evoluir 🚀
          </p>
          <p className="mt-1 text-sm leading-relaxed">
            Pode acessar meu portifólio e me contatar clicando <a href="https://danreby.github.io/danreby-portifolio/" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">aqui</a>
          </p>
        </motion.div>
      </main>

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
