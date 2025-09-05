import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Navbar } from "../components/common/NavBar";
import { getProfile, updateProfile } from "../API/user";
import api from "../API/axios"; 
import { logout } from "../API/auth";
import LoadingOverlay from "../components/common/LoadingOverlay";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", bio: "", avatar_url: null });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const fileInputRef = useRef(null);

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
        setAvatarBroken(false);
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
    setAvatarBroken(false);
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

    const maxSize = 5 * 1024 * 1024; 
    if (!f.type.startsWith("image/")) {
      alert("Por favor selecione um arquivo de imagem.");
      return;
    }
    if (f.size > maxSize) {
      alert("Imagem muito grande. Máx 5MB.");
      return;
    }

    setAvatarFile(f);
    setEditing(true);
    setAvatarBroken(false);
  }

  async function handleRemoveAvatar() {
    const ok = window.confirm("Remover avatar do perfil?");
    if (!ok) return;
    setSaving(true);
    try {
      try {
        await api.delete("/users/me/avatar");
      } catch (err) {
        await updateProfile({ avatar_url: null });
      }

      const profile = await getProfile();
      setUser(profile);
      setForm((s) => ({ ...s, avatar_url: profile?.avatar_url || null }));
      setAvatarFile(null);
      setAvatarPreview(null);
      setAvatarBroken(false);
    } catch (err) {
      console.error(err);
      const msg = parseApiError(err);
      alert("Falha ao remover avatar: " + msg);
    } finally {
      setSaving(false);
    }
  }

  function parseApiError(err) {
    try {
      const data = err?.response?.data;
      if (!data) return err?.message || String(err);
      if (Array.isArray(data?.detail)) {
        return data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
      }
      if (typeof data === "string") return data;
      if (data?.message) return data.message;
      return JSON.stringify(data);
    } catch (e) {
      return err?.message || String(err);
    }
  }

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

  async function handleSave() {
    setSaving(true);
    setUploadProgress(0);
    setAvatarBroken(false);
    try {
      const payload = { name: form.name, bio: form.bio };
      let updated = null;
      try {
        updated = await updateProfile(payload);
      } catch (err) {
        console.warn("updateProfile falhou (continua fluxo):", err);
      }

      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);

        const resp = await api.post("/users/me/avatar", fd, {
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(percent);
          },
        });

        const body = resp?.data || {};

        if (body.avatar_url) {
          const avatarUrlRaw = body.avatar_url;
          const bust = `t=${Date.now()}`;
          const newAvatarUrl = avatarUrlRaw.includes("?") ? `${avatarUrlRaw}&${bust}` : `${avatarUrlRaw}?${bust}`;

          setForm((f) => ({ ...f, avatar_url: newAvatarUrl }));
          setUser((u) => ({ ...u, avatar_url: newAvatarUrl }));

          if (body.user) {
            updated = body.user;
          } else {
            updated = await getProfile();
          }
        } else if (body.user) {
          updated = body.user;
          if (updated?.avatar_url) {
            const av = updated.avatar_url;
            const bust = `t=${Date.now()}`;
            const newAvatarUrl = av.includes("?") ? `${av}&${bust}` : `${av}?${bust}`;
            setForm((f) => ({ ...f, avatar_url: newAvatarUrl }));
            setUser((u) => ({ ...u, avatar_url: newAvatarUrl }));
          }
        } else {
          updated = await getProfile();
          if (updated?.avatar_url) {
            const av = updated.avatar_url;
            const bust = `t=${Date.now()}`;
            const newAvatarUrl = av.includes("?") ? `${av}&${bust}` : `${av}?${bust}`;
            setForm((f) => ({ ...f, avatar_url: newAvatarUrl }));
            setUser((u) => ({ ...u, avatar_url: newAvatarUrl }));
          }
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
      const msg = parseApiError(err);
      alert("Erro ao salvar: " + msg);
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
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

  const avatarSrc = avatarPreview || (form.avatar_url ? resolveAvatarUrl(form.avatar_url) : null);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-slate-900 dark:via-indigo-950 dark:to-black transition-colors duration-300">
      <motion.div className="absolute -left-20 -top-12 w-80 h-80 rounded-full filter blur-3xl opacity-40 bg-indigo-200/40 dark:bg-indigo-900/60" animate={{ y: [0, -18, 0], x: [0, 8, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 8, repeat: Infinity }} />
      <motion.div className="absolute right-20 -bottom-24 w-96 h-96 rounded-full filter blur-3xl opacity-30 bg-emerald-200/30 dark:bg-sky-900/40" animate={{ x: [0, -30, 0], y: [0, -15, 0] }} transition={{ duration: 10, repeat: Infinity }} />
      <motion.div className="absolute left-1/2 top-8 w-64 h-64 rounded-full filter blur-2xl opacity-25 bg-pink-200/30 dark:bg-violet-900/30 transform -translate-x-1/2" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 7, repeat: Infinity }} />

      <Navbar user={user} onLogout={logout} />

      <main className="max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
        <motion.div variants={cardVariants} initial="hidden" animate="show" className={`relative rounded-3xl p-6 shadow-2xl bg-white/95 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700`}>
          <div className="flex gap-6 flex-col md:flex-row items-center md:items-start">
            <div className="flex-shrink-0">
              <div className={`w-32 h-32 rounded-full relative overflow-hidden flex items-center justify-center text-3xl font-bold bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700`}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                  aria-label="Alterar avatar"
                  className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer focus:outline-none"
                >
                  {avatarSrc && !avatarBroken ? (
                    <img
                      src={avatarSrc}
                      alt={user?.name || user?.email || "Avatar"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.warn("Erro ao carregar avatar:", avatarSrc, e);
                        setAvatarBroken(true);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              {editing && (
                <div className="mt-3 flex flex-col items-center gap-2">
                  {form.avatar_url && !avatarPreview && (
                    <button type="button" onClick={handleRemoveAvatar} className="text-xs text-red-600 hover:underline mt-1">Remover avatar</button>
                  )}
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 w-32">
                  <div className="h-2 bg-gray-200 rounded overflow-hidden">
                    <div style={{ width: `${uploadProgress}%` }} className="h-full bg-indigo-600 transition-all" />
                  </div>
                  <div className="text-xs mt-1 text-gray-600">{uploadProgress}%</div>
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
                      <button onClick={() => { setEditing(false); setForm({ name: user?.name || "", email: user?.email || "", bio: user?.bio || "", avatar_url: user?.avatar_url || null }); setAvatarFile(null); setAvatarPreview(null); setAvatarBroken(false); }} className="px-3 py-2 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-white dark:border-gray-700">Cancelar</button>
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
