import { useEffect, useRef, useState } from "react";
import { getApiError, getOnlineUsers } from "../../api/authApi";
import type { ChatUser } from "../../types";
import useAdminDashboard from "../../hooks/useAdminDashboard"; // Assuming this hook exists

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getOnlineUsers();
      setUsers(response.data);
    } catch (cause) {
      setError(getApiError(cause));
    } finally {
      setIsLoading(false);
    }
  };
  // Pass loadUsers as a callback to the hook so it can refresh the list
  const { handleUserLogout } = useAdminDashboard(loadUsers);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    void loadUsers();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-800">
      <section className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Socket Talk
            </p>
            <h1 className="mt-1 text-2xl font-bold">Online users</h1>
          </div>
          <button
            onClick={() => void loadUsers()}
            disabled={isLoading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
        {error && (
          <p className="mt-5 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </p>
        )}
        {!isLoading && !error && users.length === 0 && (
          <p className="mt-6 text-slate-500">No users are currently online.</p>
        )}
        <ul className="mt-5 divide-y divide-slate-100">
          {users.map((user) => (
            <li key={user.slug} className="flex items-center gap-3 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <div className="flex w-full justify-between">
                <div className="grow">
                  <p className="font-semibold">{user.fullName}</p>
                  <p className="text-sm text-slate-500">@{user.slug}</p>
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-md bg-red-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    onClick={() => void handleUserLogout(user.slug)} // Pass the user's slug
                  >
                    Logout
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default AdminDashboard;
