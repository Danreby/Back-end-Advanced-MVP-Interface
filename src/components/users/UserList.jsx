import React from "react";
import UserListItem from "../../Pages/Friends/UserListItem";

export default function UserList({ items = [], onItemClick = () => {}, emptyMessage = "Nenhum item." }) {
  if (!items || items.length === 0) {
    return <div className="p-4 text-sm text-gray-600 dark:text-gray-300">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-2">
      {items.map((u) => (
        <UserListItem key={u.id} user={u} onClick={() => onItemClick(u)} />
      ))}
    </div>
  );
}
