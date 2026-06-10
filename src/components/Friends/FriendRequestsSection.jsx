import React from "react";
import FriendRequestItem from "./FriendRequestItem";

export default function FriendRequestsSection({
  requests = [],
  loading = false,
  error = null,
  onAccept,
  onReject,
  onRefresh,
}) {
  if (!loading && requests.length === 0 && !error) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/60 p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium dark:text-white">Solicitações recebidas</h3>
          {requests.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
              {requests.length}
            </span>
          )}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs px-2 py-1 rounded-full bg-white/95 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 disabled:opacity-60 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {loading && (
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">Carregando solicitações...</div>
      )}

      {!loading && error && (
        <div className="mt-3 text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {requests.map((r) => (
            <FriendRequestItem
              key={r.id ?? `${r.user_id}_${r.friend_id}`}
              request={r}
              onAccept={onAccept}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
