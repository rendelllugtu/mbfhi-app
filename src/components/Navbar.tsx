// src/components/Navbar.tsx
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  // 🔥 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) =>
    location.pathname === path ? "underline font-semibold" : "";

  const logout = async () => {
  await signOut(auth);

  localStorage.removeItem("user"); 

  setUser(null);

  navigate("/login");
};

  return (
    <nav className="bg-[#F38CB8] text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-2">

        <div className="flex justify-between items-center">

          {/* LEFT MENU */}
          <div className="hidden md:flex gap-6 items-center text-sm font-medium" ref={ref}>

            <Link to="/" className={`hover:underline ${isActive("/")}`}>
              Home
            </Link>

            <Link to="/about" className={`hover:underline ${isActive("/about")}`}>
              About
            </Link>

            {/* MBFHI DROPDOWN */}
            <div className="relative">
              <button
                onClick={() =>
                  setDropdown(dropdown === "mbfhi" ? null : "mbfhi")
                }
                className="hover:underline"
              >
                Mother-Baby Friendly ▾
              </button>

              {dropdown === "mbfhi" && (
                <div className="absolute left-0 mt-2 bg-white text-gray-700 rounded shadow-lg w-48 z-50 animate-fadeIn">
                  <Link
                    to="/apply"
                    onClick={() => setDropdown(null)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Apply
                  </Link>
                  <Link
                    to="/requirements"
                    onClick={() => setDropdown(null)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Requirements
                  </Link>
                  <Link
                    to="/about"
                    onClick={() => setDropdown(null)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    About
                  </Link>
                </div>
              )}
            </div>

            {/* NUTRITION DROPDOWN */}
            <div className="relative">
              <button
                onClick={() =>
                  setDropdown(dropdown === "nutrition" ? null : "nutrition")
                }
                className="hover:underline"
              >
                Nutrition ▾
              </button>

              {dropdown === "nutrition" && (
                <div className="absolute left-0 mt-2 bg-white text-gray-700 rounded shadow-lg w-48 z-50 animate-fadeIn">
                  <Link
                    to="/pimam"
                    onClick={() => setDropdown(null)}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    PIMAM
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT MENU */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">

          {/* LOGIN (if not logged in) */}
          {!user?.email && (
  <Link
    to="/login"
    className="bg-white text-pink-500 px-3 py-1 rounded hover:bg-gray-100 text-xs font-semibold"
  >
    Login
  </Link>
)}

            <Link to="/contact" className="hover:underline">
              Contact
            </Link>

            {user?.roles?.includes("admin") && (
              <Link to="/admin" className="hover:underline">
                Admin
              </Link>
            )}

            {user?.roles?.includes("assessor") && (
              <Link to="/assessor" className="hover:underline">
                Assessor
              </Link>
            )}

            {/* USER AVATAR */}
            {user && (
              <div className="flex items-center gap-2 ml-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${user.email}`}
                  alt="avatar"
                  className="h-8 w-8 rounded-full border"
                />
                <button
                  onClick={logout}
                  className="text-xs bg-white text-pink-500 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}

          </div>

          {/* MOBILE BUTTON */}
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="mt-4 flex flex-col gap-3 md:hidden text-sm animate-fadeIn">

            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setOpen(false)}>About</Link>

            <div>
              <p className="font-semibold">Mother-Baby Friendly</p>
              <Link to="/apply" className="ml-3" onClick={() => setOpen(false)}>
                Apply
              </Link>
              <Link to="/requirements" className="ml-3" onClick={() => setOpen(false)}>
                Requirements
              </Link>
            </div>

            <div>
              <p className="font-semibold">Nutrition</p>
              <Link to="/pimam" className="ml-3" onClick={() => setOpen(false)}>
                PIMAM
              </Link>
            </div>

            <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>

            {user?.roles?.includes("admin") && (
              <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
            )}

            {user?.roles?.includes("assessor") && (
              <Link to="/assessor" onClick={() => setOpen(false)}>Assessor</Link>
            )}

            {user && (
              <button onClick={logout} className="text-left">
                Logout
              </button>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}