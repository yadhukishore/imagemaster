import { useUserContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import AppLogo from "../../assets/AppLogo";
import { LogOut, User } from "lucide-react";

function Header() {
  const { user, setUser } = useUserContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser({
      isUser: false,
      email: "",
    });
    navigate("/login");
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <AppLogo />
          </div>

          {/* User Section */}
          {user.isUser && (
            <div className="flex items-center space-x-3 sm:space-x-6">
              {/* User Email */}
              <div className="hidden sm:flex items-center gap-2">
                <User className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-200 font-medium">
                  {user.email}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline text-sm font-medium">
                  Logout
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;