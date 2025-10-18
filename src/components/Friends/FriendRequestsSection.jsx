import React from "react";

export default function FriendRequestsSection({ requests = [], loading = false, error = null, onAccept, onReject, onRefresh }) {
  if (!loading && (!requests || requests.length === 0)) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/60 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium dark:text-white">Solicitações de amizade</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">({requests.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs px-2 py-1 rounded-full bg-white/95 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 disabled:opacity-60"
          >
            Atualizar
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-3 text-sm text-gray-500">Carregando solicitações...</div>
      )}

      {!loading && error && (
        <div className="mt-3 text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="mt-3 flex flex-col gap-2">
          {requests.map((r) => {
            const who = r.from_user || r.user || r.sender || {};
            const id = r.id ?? r.request_id ?? r.requestId;

            return (
              <div key={id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                  {who?.avatar_url ? (
                    <img src={who.avatar_url} alt={who.name || who.email} className="object-cover w-full h-full" />
                  ) : (
                    (who?.name ? who.name.charAt(0).toUpperCase() : (who?.email ? who.email.charAt(0).toUpperCase() : "U"))
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium dark:text-white truncate">{who?.name || who?.email || "Usuário"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{who?.email || (r.created_at ? new Date(r.created_at).toLocaleString() : "")}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept && onAccept(r)}
                    className="px-3 py-1 rounded-full bg-emerald-600 text-white text-sm"
                  >
                    Aceitar
                  </button>
                  <button
                    onClick={() => onReject && onReject(r)}
                    className="px-3 py-1 rounded-full border text-sm"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
