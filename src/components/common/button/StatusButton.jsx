import React, { useMemo } from "react";

export default function StatusButtons({ status, onChange, updatingStatusTo }) {
  const STATUS_OPTIONS = useMemo(
    () => [
      { key: "wishlist", label: "Wishlist" },
      { key: "on_going", label: "On going" },
      { key: "stand_by", label: "Stand by" },
      { key: "dropped", label: "Dropped" },
      { key: "completed", label: "Completed" },
    ],
    []
  );

  const STATUS_STYLES = useMemo(
    () => ({
      wishlist: ["bg-gray-400 text-black", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
      on_going: ["bg-blue-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
      stand_by: ["bg-yellow-400 text-black", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
      dropped: ["bg-red-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
      completed: ["bg-green-600 text-white", "bg-transparent text-gray-700 dark:text-white border-gray-300 dark:border-gray-600"],
    }),
    []
  );

  return (
    <div className="mt-3 flex gap-2 items-center flex-wrap">
      {STATUS_OPTIONS.map((s) => {
        const isActive = String(status) === String(s.key);
        const [activeCls, inactiveCls] = STATUS_STYLES[s.key] || STATUS_STYLES.wishlist;
        const base = "text-xs px-3 py-1 rounded border flex items-center gap-2 transition-colors";
        const disabled = updatingStatusTo && String(updatingStatusTo) !== String(s.key);
        const cls = `${base} ${isActive ? `${activeCls} ring-2 ring-offset-1 ring-opacity-60` : inactiveCls} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`;
        return (
          <button key={s.key} onClick={() => onChange(s.key)} disabled={disabled} aria-pressed={isActive} title={`Alterar para ${s.label}`} className={cls}>
            {updatingStatusTo && String(updatingStatusTo) === String(s.key) ? `${s.label}...` : s.label}
          </button>
        );
      })}
    </div>
  );
}
