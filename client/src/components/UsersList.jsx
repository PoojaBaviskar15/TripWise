import { useEffect, useState } from "react";
import { fetchUsers } from "../../../api/controllers/auth.controller";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(setError);
  }, []);

  return (
    <div>
      <h2>User List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {users.length > 0 ? (
        users.map(user => <p key={user.id}>{user.email}</p>)
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
}
