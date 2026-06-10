import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userApi, { getProfile } from "../../API/user";
import { logout } from "../../API/auth";
import api from "../../API/axios";
import FriendButtons from "../users/FriendButtons";
import { Navbar } from "../common/NavBar";
import { Footer } from "../common/Footer";
import LoadingOverlay from "../common/LoadingOverlay";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      userApi.getUserById(id),
      getProfile(),
    ]).then(([uRes, meRes]) => {
      if (!mounted) return;

      if (uRes.status === "fulfilled") {
        setUser(uRes.value ?? null);
      } else {
        const httpStatus = uRes.reason?.response?.status;
        setError(httpStatus === 404 ? "Usuário não encontrado" : "Erro ao carregar usuário");
      }

      if (meRes.status === "fulfilled") {
        setMyProfile(meRes.value ?? null);
      }
    }).finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <Navbar user={myProfile} onLogout={logout} />
        <Footer variant="fixed" />
        <LoadingOverlay open text="Carregando perfil..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <Navbar user={myProfile} onLogout={logout} />
        <main className="max-w-4xl mx-auto p-6">
          <div className="rounded-3xl p-6 bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="text-lg font-medium text-gray-800 dark:text-gray-100">{error || "Usuário não encontrado"}</div>
            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-full bg-white/95 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                Voltar
              </button>
            </div>
          </div>
        </main>
        <Footer variant="fixed" />
      </div>
    );
  }

  const isMe = myProfile && String(myProfile.id) === String(user.id);

  function resolveAvatarUrl(avatar_url) {
    if (!avatar_url) return null;
    if (avatar_url.startsWith("http://") || avatar_url.startsWith("https://")) return avatar_url;

    const baseFromApi = api && api.defaults && api.defaults.baseURL ? String(api.defaults.baseURL).replace(/\/+$/, "") : null;
    const fallbackOrigin = typeof window !== "undefined" ? String(window.location.origin).replace(/\/+$/, "") : "";

    const base = (baseFromApi && (baseFromApi.startsWith("http://") || baseFromApi.startsWith("https://"))) ? baseFromApi : fallbackOrigin;

    if (!base) return avatar_url; 

    if (avatar_url.startsWith("/")) return `${base}${avatar_url}`;
    return `${base}/${avatar_url.replace(/^\/+/, "")}`;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <Navbar user={myProfile} onLogout={logout} />
      <main className="max-w-4xl mx-auto p-6">
        <div className="rounded-3xl p-6 bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 shadow-2xl">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
              {user.avatar_url ? (
              <img
                src={user?.avatar_url ? resolveAvatarUrl(user.avatar_url) : "/default-avatar.png"}
                alt={user && user.email ? user.email.charAt(0).toUpperCase() : "U"}
                className="rounded-full object-cover outline-dotted outline-1 outline-gray-400 dark:outline-gray-600"
              />
              ) : (
                (user.name ? user.name.charAt(0).toUpperCase() : "U")
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold dark:text-white">{user.name || user.email}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300 truncate">{user.email}</div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{user.bio || "—"}</div>
              <div className="mt-3 flex gap-2 items-center text-sm text-gray-500">
                <div>Membro desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</div>
                <div>• Jogos: {user.games_count ?? "-"}</div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {!isMe && (
                <FriendButtons targetUserId={user.id} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer variant="fixed" />
    </div>
  );
}
