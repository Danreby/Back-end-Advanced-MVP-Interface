import { useEffect, useState } from "react";

export function Navbar({ user, onLogout, onNavigate }) {
  const [navOpen, setNavOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
      } else {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setTheme(initial);
        document.documentElement.classList.toggle("dark", initial === "dark");
      }
    } catch (e) {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  function handleNavClick(href) {
    setNavOpen(false);
    if (typeof onNavigate === "function") return onNavigate(href);
    window.location.href = href;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavClick("/")}
              className="flex items-center gap-3 focus:outline-none"
              aria-label="Ir para Home"
            >
              <div className="h-9 w-9 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold">
                GC
              </div>
              <span className="font-semibold text-lg text-gray-900 dark:text-gray-100">CatGame</span>
            </button>

            <nav className="hidden sm:flex gap-2 items-center" aria-label="Navegação principal">
              <button onClick={() => handleNavClick("/dashboard")} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                Dashboard
              </button>
              <button onClick={() => handleNavClick("/games")} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                Meus Jogos
              </button>
              <button onClick={() => handleNavClick("/games/new")} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                Adicionar
              </button>
              <button onClick={() => handleNavClick("/games?filter=wishlist")} className="px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">
                Wishlist
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
                onClick={toggleTheme}
                className="relative w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`absolute w-5 h-5 text-gray-700 transition-all duration-500 transform ${theme === "dark" ? "opacity-0 scale-75 rotate-90" : "opacity-100 scale-100 rotate-0"}`} viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" className={`absolute w-5 h-5 text-blue-400 transition-all duration-500 transform ${theme === "dark" ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-75 -rotate-90"}`} viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
                </svg>
            </button>

            <div className="hidden sm:flex items-center text-sm text-gray-700 dark:text-gray-200">
              {user ? user.name : ""}
            </div>

            <div className="relative">
              <button
                onClick={() => setUserOpen((s) => !s)}
                className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                aria-expanded={userOpen}
                aria-label="Abrir menu do usuário"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200">
                  {user && user.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <svg className={`w-4 h-4 transition-transform ${userOpen ? "rotate-180" : ""} dark:text-white`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.355a.75.75 0 011.14.98l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border rounded shadow-md py-1">
                  <button onClick={() => handleNavClick("/profile")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Perfil</button>
                  <button onClick={() => handleNavClick("/settings")} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Configurações</button>
                  <button onClick={() => { setUserOpen(false); onLogout && onLogout(); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">Sair</button>
                </div>
              )}
            </div>

            <button
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={() => setNavOpen((s) => !s)}
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={navOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {navOpen && (
          <div className="sm:hidden mt-2 pb-3 space-y-1">
            <button onClick={() => handleNavClick("/dashboard")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">Dashboard</button>
            <button onClick={() => handleNavClick("/games")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">Meus Jogos</button>
            <button onClick={() => handleNavClick("/games/new")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">Adicionar</button>
            <button onClick={() => handleNavClick("/games?filter=wishlist")} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white">Wishlist</button>
          </div>
        )}
      </div>
    </header>
  );
}
