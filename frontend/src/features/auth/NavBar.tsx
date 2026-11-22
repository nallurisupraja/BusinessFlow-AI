import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

// Top navigation: shows the logged-in user's name and a logout button,
// or login and register links when nobody is logged in.
export function NavBar() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    await navigate({ to: "/login" });
  }

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <Link to="/" className="font-bold text-blue-700">
        BusinessFlow AI
      </Link>
      {status === "authenticated" && user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">Signed in as {user.full_name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
          >
            Log out
          </button>
        </div>
      ) : status === "anonymous" ? (
        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-gray-700 hover:underline">
            Log in
          </Link>
          <Link to="/register" className="text-gray-700 hover:underline">
            Register
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
