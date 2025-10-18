import React, { useEffect, useState } from "react";
import userApi from "../../API/user";

export default function FriendButtons({ targetUserId, initialIsFriend = false, onFriendshipChange = () => {} }) {
  const [isFriend, setIsFriend] = useState(Boolean(initialIsFriend));
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    setIsFriend(Boolean(initialIsFriend));
  }, [initialIsFriend]);

  async function handleSendRequest() {
    setLoading(true);
    try {
      const payload = { friend_id: targetUserId };
      const resp = await userApi.sendFriendRequest(payload);
      if (resp && resp.status === "pending") {
        setPending(true);
        setRequestId(resp.id);
        onFriendshipChange("pending");
      } else if (resp && resp.status === "accepted") {
        setIsFriend(true);
        onFriendshipChange("accepted");
      } else {
        setPending(true);
        onFriendshipChange("pending");
      }
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      alert("Não foi possível enviar pedido de amizade.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBlock() {
    if (!window.confirm("Tem certeza que deseja bloquear este usuário?")) return;
    setLoading(true);
    try {
      const resp = await userApi.blockUser(targetUserId);
      if (resp) {
        setIsFriend(false);
        setPending(false);
        onFriendshipChange("blocked");
      }
    } catch (err) {
      console.error("Erro ao bloquear:", err);
      alert("Falha ao bloquear usuário.");
    } finally {
      setLoading(false);
    }
  }

  if (isFriend) {
    return (
      <div className="flex gap-2">
        <div className="px-2 py-1 rounded-md bg-green-100 text-green-800 border cursor-default">Amigos</div>
        {/* <button onClick={handleBlock} disabled={loading} className="px-4 py-2 rounded-md bg-white border text-sm">Bloquear</button> */}
      </div>
    );
  }

  if (pending) {
    return (
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 border">Pedido enviado</button>
        <button onClick={handleBlock} disabled={loading} className="px-4 py-2 rounded-md bg-white border text-sm">Bloquear</button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleSendRequest} disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
        {loading ? "Enviando..." : "Enviar pedido"}
      </button>
      <button onClick={handleBlock} disabled={loading} className="px-4 py-2 rounded-md bg-white border text-sm">Bloquear</button>
    </div>
  );
}
