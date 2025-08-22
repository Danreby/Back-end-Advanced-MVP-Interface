import { useEffect, useState } from "react";
import { getProfile } from "../API/user";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getProfile().then(setUser).catch(() => {
      window.location.href = "/login"; // se não autenticado
    });
  }, []);

  return (
    <div className="p-8">
      {user ? (
        <h1 className="text-2xl font-bold">Bem-vindo, {user.email}</h1>
      ) : (
        <p>Carregando...</p>
      )}
    </div>
  );
}
