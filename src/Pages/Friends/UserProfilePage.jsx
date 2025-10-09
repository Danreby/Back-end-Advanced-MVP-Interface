import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../components/common/NavBar";
import { Footer } from "../components/common/Footer";
import LoadingOverlay from "../components/common/LoadingOverlay";
import userApi from "../API/user";
import { getProfile, listMyFriends, sendFriendRequest, blockUser } from "../API/user";
import FriendButtons from "../components/users/FriendButtons";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [u, me, myFriends] = await Promise.allSettled([
          userApi.getUserById(id),
          getProfile(),
          userApi.listMyFriends ? userApi.listMyFriends() : userApi.listMyFriends 
        ]);

        if (!mounted) return;

        if (u.status === "fulfilled") setUser(u.value);
        else {
          setError("Usuário não encontrado");
          return;
        }

        if (me.status === "fulfilled") setMyProfile(me.value);
        if (myFriends.status === "fulfilled") setFriends(myFriends.value || []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar página");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <div className="rounded bg-white p-6 shadow">Carregando perfil...</div>
        </main>
        <Footer />
        <LoadingOverlay open />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <div className="rounded bg-white p-6 shadow">{error || "Usuário não encontrado"}</div>
          <button className="mt-4" onClick={() => navigate(-1)}>Voltar</button>
        </main>
        <Footer />
      </div>
    );
  }

  const isMe = myProfile && myProfile.id === user.id;
  const isFriend = friends.some((f) => f.id === user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6">
        <div className="rounded p-6 bg-white dark:bg-gray-800 shadow">
          <div className="flex gap-6 items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
              {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" /> : (user.name ? user.name.charAt(0).toUpperCase() : "U")}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.name || user.email}</h2>
              <div className="text-sm text-gray-600 dark:text-gray-300">{user.email}</div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{user.bio || "—"}</div>
              <div className="mt-3 flex gap-2 items-center">
                <div className="text-sm text-gray-500">Membro desde: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</div>
                <div className="text-sm text-gray-500">• Jogos: {user.games_count ?? "-"}</div>
              </div>
            </div>

            <div>
              {!isMe && (
                <FriendButtons
                  targetUserId={user.id}
                  initialIsFriend={isFriend}
                  onFriendshipChange={(newState) => {
                    if (newState === "accepted") {
                      setFriends((s) => [...s, { id: user.id, name: user.name, avatar_url: user.avatar_url }]);
                    } else if (newState === "blocked") {
                      setFriends((s) => s.filter((f) => f.id !== user.id));
                    }
                  }}
                />
              )}
            </div>
          </div>

          <div className="mt-6">
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
