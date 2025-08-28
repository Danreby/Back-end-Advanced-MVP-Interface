import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "../components/common/NavBar";
import { getProfile, updateProfile } from "../API/user";
import { logout } from "../API/auth";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", bio: "", avatar_url: null });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getProfile();
        if (!mounted) return;
        setUser(res);
        setForm({
          name: res?.name || "",
          email: res?.email || "",
          bio: res?.bio || "",
          avatar_url: res?.avatar_url || null,
        });
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        try { localStorage.removeItem("token"); } catch (e) {}
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const cardVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.995 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 26 } },
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAvatarSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
  }

  async function handleRemoveAvatar() {
    const ok = window.confirm("Remover avatar do perfil?");
    if (!ok) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const base = process.env.REACT_APP_API_URL || "";
      const res = await fetch(`${base}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: null }),
      });
      if (!res.ok) throw new Error("Erro ao remover avatar");
      const profile = await getProfile();
      setUser(profile);
      setForm((s) => ({ ...s, avatar_url: profile?.avatar_url || null }));
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
      alert("Falha ao remover avatar: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { name: form.name, bio: form.bio };
      let updated;
      try {
        updated = await updateProfile(payload);
      } catch (err) {
        console.warn("updateProfile falhou ou não retornou usuário, will refetch profile after avatar upload", err);
      }

      if (avatarFile) {
        const base = process.env.REACT_APP_API_URL || "";
        const token = localStorage.getItem("token");
        const fd = new FormData();
        fd.append("file", avatarFile);
        const resp = await fetch(`${base}/users/me/avatar`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        });
        if (!resp.ok) {
          let text = await resp.text();
          throw new Error("Falha ao enviar avatar: " + (text || resp.statusText));
        }
        const body = await resp.json();
        if (body.user) {
          updated = body.user;
        } else if (body.avatar_url) {
          try { updated = await getProfile(); } catch (e) {}
        } else {
          updated = await getProfile();
        }
      }

      if (!updated) updated = await getProfile();

      setUser(updated);
      setForm({
        name: updated?.name || "",
        email: updated?.email || "",
        bio: updated?.bio || "",
        avatar_url: updated?.avatar_url || null,
      });
      setAvatarFile(null);
      setAvatarPreview(null);
      setEditing(false);
    } catch (err) {
      console.error("Erro ao salvar perfil:", err);
      alert("Erro ao salvar: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  }

  function resolveAvatarUrl(avatar_url) {
    if (!avatar_url) return null;
    if (avatar_url.startsWith("http://") || avatar_url.startsWith("https://")) return avatar_url;
    if (typeof window !== "undefined") return `${window.location.origin}${avatar_url}`;
    return avatar_url;
  }

  // --- Loading overlay (copied / matched to Dashboard) ---
  function LoadingOverlay({ open = false, text = "Carregando..." }) {
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

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
        <motion.div className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60" animate={{ y: [0, -18, 0] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.div className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" animate={{ x: [0, -30, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />

        <Navbar user={null} onLogout={logout} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="rounded-3xl p-6 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700">
            <div className="animate-pulse w-60 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="animate-pulse w-40 h-40 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">Carregando perfil...</div>
          </div>
        </div>
      </div>
    );
  }

  const avatarSrc = avatarPreview || resolveAvatarUrl(form.avatar_url);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <motion.div className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60" animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" animate={{ x: [0, -30, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25 bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity }} />

      <Navbar user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <motion.div variants={cardVariants} initial="hidden" animate="show" className={`relative rounded-3xl p-6 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700`}>
          <div className="flex gap-6 flex-col md:flex-row items-center md:items-start">
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name || user?.email} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              {editing && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  <label className="text-xs text-gray-600 dark:text-gray-300">Atualizar avatar</label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-sm">
                      <input type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                      Selecionar
                    </label>
                    <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="px-3 py-2 rounded-md border bg-gray-50 text-sm">Remover seleção</button>
                  </div>
                  {form.avatar_url && !avatarPreview && (
                    <button type="button" onClick={handleRemoveAvatar} className="text-xs text-red-600 hover:underline mt-1">Remover avatar atual</button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</div>
                </div>

                <div className="flex items-center gap-2">
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="px-3 py-2 rounded-md bg-white text-gray-800 border border-gray-200 shadow-sm hover:shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700">Editar</button>
                  ) : (
                    <>
                      <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-md bg-indigo-600 text-white font-medium hover:brightness-95 disabled:opacity-60">{saving ? "Salvando..." : "Salvar"}</button>
                      <button onClick={() => { setEditing(false); setForm({ name: user?.name || "", email: user?.email || "", bio: user?.bio || "", avatar_url: user?.avatar_url || null }); setAvatarFile(null); setAvatarPreview(null); }} className="px-3 py-2 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">Cancelar</button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                  <input name="name" maxLength={255} value={form.name} onChange={handleChange} disabled={!editing} className={`mt-1 block w-full rounded-md p-3 ${editing ? "bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input name="email" maxLength={255} value={form.email} onChange={handleChange} disabled className="mt-1 block w-full rounded-md p-3 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea name="bio" maxLength={255} value={form.bio} onChange={handleChange} disabled={!editing} rows={4} className={`mt-1 block w-full rounded-md p-3 resize-none ${editing ? "bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`} />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membro desde:</label>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Jogos</label>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{user?.games_count ?? "-"}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Segurança</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={() => window.location.href = "/change-password"} className="w-full px-3 py-2 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">Alterar senha</button>
              <button onClick={() => { localStorage.removeItem("token"); logout && logout(); }} className="w-full px-3 py-2 rounded-md border bg-red-50 text-red-600 hover:bg-red-100">Sair</button>
            </div>
          </div>
        </motion.div>
      </main>

      <div className="pointer-events-none absolute inset-0 z-30">
        <motion.div animate={{ rotate: [0, 6, -6, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute left-8 top-20 w-6 h-6 rounded-full bg-gray-200/20 dark:bg-white/6 blur-sm" />
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} className="absolute right-24 top-40 w-8 h-8 rounded-full bg-gray-100/20 dark:bg-white/8 blur-sm" />
      </div>

      <LoadingOverlay open={saving} text={saving ? "Salvando..." : "Carregando..."} />
    </div>
  );
}
