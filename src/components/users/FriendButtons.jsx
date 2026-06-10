import React, { useEffect, useState } from "react";
import userApi from "../../API/user";

const STATUS = {
  LOADING: "loading",
  NONE: "none",
  PENDING_SENT: "pending_sent",
  PENDING_RECEIVED: "pending_received",
  ACCEPTED: "accepted",
  BLOCKED: "blocked",
  SELF: "self",
};

export default function FriendButtons({ targetUserId, onFriendshipChange = () => {} }) {
  const [status, setStatus] = useState(STATUS.LOADING);
  const [friendshipId, setFriendshipId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "unfriend" | "block"

  useEffect(() => {
    if (!targetUserId) return;
    let mounted = true;
    userApi.getFriendshipStatus(targetUserId)
      .then((data) => {
        if (!mounted) return;
        setStatus(data?.status ?? STATUS.NONE);
        setFriendshipId(data?.friendship_id ?? null);
      })
      .catch(() => mounted && setStatus(STATUS.NONE));
    return () => { mounted = false; };
  }, [targetUserId]);

  async function run(action) {
    setBusy(true);
    setConfirmAction(null);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    await run(async () => {
      const resp = await userApi.sendFriendRequest({ friend_id: targetUserId });
      if (resp?.status === "accepted") {
        setStatus(STATUS.ACCEPTED);
        setFriendshipId(resp.id);
        onFriendshipChange("accepted");
      } else {
        setStatus(STATUS.PENDING_SENT);
        setFriendshipId(resp?.id ?? null);
        onFriendshipChange("pending_sent");
      }
    });
  }

  async function handleCancel() {
    if (!friendshipId) return;
    await run(async () => {
      await userApi.cancelFriendRequest(friendshipId);
      setStatus(STATUS.NONE);
      setFriendshipId(null);
      onFriendshipChange("none");
    });
  }

  async function handleAccept() {
    if (!friendshipId) return;
    await run(async () => {
      await userApi.acceptFriendRequest(friendshipId);
      setStatus(STATUS.ACCEPTED);
      onFriendshipChange("accepted");
    });
  }

  async function handleReject() {
    if (!friendshipId) return;
    await run(async () => {
      await userApi.rejectFriendRequest(friendshipId);
      setStatus(STATUS.NONE);
      setFriendshipId(null);
      onFriendshipChange("none");
    });
  }

  async function handleUnfriend() {
    await run(async () => {
      await userApi.removeFriend(targetUserId);
      setStatus(STATUS.NONE);
      setFriendshipId(null);
      onFriendshipChange("none");
    });
  }

  async function handleBlock() {
    await run(async () => {
      const resp = await userApi.blockUser(targetUserId);
      setStatus(STATUS.BLOCKED);
      setFriendshipId(resp?.id ?? null);
      onFriendshipChange("blocked");
    });
  }

  const btn = "px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const primary = `${btn} bg-indigo-600 hover:bg-indigo-700 text-white`;
  const secondary = `${btn} border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700`;
  const danger = `${btn} border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30`;
  const success = `${btn} bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 cursor-default`;
  const warning = `${btn} bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300`;

  if (status === STATUS.LOADING) {
    return <div className={`${secondary} opacity-60`}>Carregando...</div>;
  }

  if (status === STATUS.SELF) return null;

  if (confirmAction === "unfriend") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Desfazer amizade?</span>
        <button onClick={handleUnfriend} disabled={busy} className={danger}>
          {busy ? "..." : "Confirmar"}
        </button>
        <button onClick={() => setConfirmAction(null)} disabled={busy} className={secondary}>
          Cancelar
        </button>
      </div>
    );
  }

  if (confirmAction === "block") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Bloquear usuário?</span>
        <button onClick={handleBlock} disabled={busy} className={danger}>
          {busy ? "..." : "Confirmar"}
        </button>
        <button onClick={() => setConfirmAction(null)} disabled={busy} className={secondary}>
          Cancelar
        </button>
      </div>
    );
  }

  if (status === STATUS.ACCEPTED) {
    return (
      <div className="flex items-center gap-2">
        <span className={success}>Amigos</span>
        <button onClick={() => setConfirmAction("unfriend")} disabled={busy} className={danger}>
          Desfazer
        </button>
      </div>
    );
  }

  if (status === STATUS.PENDING_SENT) {
    return (
      <div className="flex items-center gap-2">
        <span className={warning}>Pedido enviado</span>
        <button onClick={handleCancel} disabled={busy} className={secondary}>
          {busy ? "..." : "Cancelar pedido"}
        </button>
      </div>
    );
  }

  if (status === STATUS.PENDING_RECEIVED) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handleAccept} disabled={busy} className={primary}>
          {busy ? "..." : "Aceitar"}
        </button>
        <button onClick={handleReject} disabled={busy} className={secondary}>
          {busy ? "..." : "Rejeitar"}
        </button>
      </div>
    );
  }

  if (status === STATUS.BLOCKED) {
    return (
      <div className={`${btn} bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-500 cursor-default`}>
        Bloqueado
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleSend} disabled={busy} className={primary}>
        {busy ? "Enviando..." : "Adicionar amigo"}
      </button>
      <button onClick={() => setConfirmAction("block")} disabled={busy} className={danger}>
        Bloquear
      </button>
    </div>
  );
}
