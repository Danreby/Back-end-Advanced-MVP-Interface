import React, { useState } from "react";

export default function FriendRequestItem({ request, onAccept, onReject }) {
  const [busy, setBusy] = useState(false);
  const who = request.from_user || request.user || request.sender || request;

  async function handleAccept() {
    try {
      setBusy(true);
      await onAccept(request);
    } catch (e) {
      console.error("Erro ao aceitar:", e);
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    try {
      setBusy(true);
      await onReject(request);
    } catch (e) {
      console.error("Erro ao rejeitar:", e);
    } finally {
      setBusy(false);
    }
  }

  function avatarUrl() {
    return who.avatar_url || who.avatar || null;
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
        {avatarUrl() ? (
          <img src={avatarUrl()} alt={who.name || who.email || "U"} className="object-cover w-full h-full" />
        ) : (
          (who.name ? who.name.charAt(0).toUpperCase() : (who.email ? who.email.charAt(0).toUpperCase() : "U"))
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium dark:text-white truncate">{who.name || who.email || "Usuário"}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {who.email ? who.email : (request.created_at ? new Date(request.created_at).toLocaleString() : "")}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          disabled={busy}
          className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm disabled:opacity-60"
          title="Aceitar solicitação"
        >
          Aceitar
        </button>
        <button
          onClick={handleReject}
          disabled={busy}
          className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-sm disabled:opacity-60"
          title="Rejeitar solicitação"
        >
          Rejeitar
        </button>
      </div>
    </div>
  );
}
