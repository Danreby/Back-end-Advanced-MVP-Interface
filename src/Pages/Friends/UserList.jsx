import React, { useState } from "react";

export default function UserList({
  items = [],
  onItemClick = () => {},
  emptyMessage = "Nenhum item.",
}) {
  if (!items || items.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-600 dark:text-gray-300">{emptyMessage}</div>
    );
  }

  return (
    <div className="grid gap-2">
      {items.map((u) => (
        <UserListItem key={u.id} user={u} onClick={() => onItemClick(u)} />
      ))}
    </div>
  );
}

function UserListItem({ user, onClick = () => {} }) {
  const [imgError, setImgError] = useState(false);
  const initials = ((user?.name || user?.email || "U").trim().charAt(0) || "U").toUpperCase();

  const showImage = !!user?.avatar_url && !imgError;

  return (
    <button
      onClick={onClick}
      aria-label={`Abrir usuário ${user?.name || user?.email}`}
      className="w-full flex items-center gap-4 p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm text-left transition-shadow"
    >
      <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-lg font-bold">
        {showImage ? (
          <img
            src={user.avatar_url}
            alt={user.name || user.email || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <span className="text-gray-700 dark:text-gray-100 select-none">{initials}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate dark:text-white">
          {user.name || user.email}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
          {user.bio ? user.bio.slice(0, 80) : user.email}
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <svg
          className="w-4 h-4 text-gray-400 dark:text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}
