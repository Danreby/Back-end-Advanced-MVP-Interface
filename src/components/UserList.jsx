import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/users")
      .then(response => setUsers(response.data))
      .catch(error => console.error("Erro ao buscar usuários:", error));
  }, []);

  return (
    <div>
      <h2>Lista de Usuários</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}


// import { useEffect, useState } from "react";
// import { getUsers } from "../api/users";

// export default function UserList() {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     getUsers().then(res => setUsers(res.data));
//   }, []);

//   return (
//     <ul>
//       {users.map(u => <li key={u.id}>{u.name}</li>)}
//     </ul>
//   );
// }
