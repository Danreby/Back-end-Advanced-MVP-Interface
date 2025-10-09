import React from "react";

export default function UserListItem({ user, onClick = () => {} }) {
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-3 rounded-md bg-white dark:bg-gray-800 border hover:shadow-sm text-left"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-lg font-bold">
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.name || user.email} className="w-full h-full object-cover rounded-full" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium">{user.name || user.email}</div>
        <div className="text-sm text-gray-500 dark:text-gray-300">{user.bio ? user.bio.slice(0, 80) : user.email}</div>
      </div>
      <div className="text-sm text-gray-400">{user.games_count ?? "-"}</div>
    </button>
  );
}
