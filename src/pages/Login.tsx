// src/pages/Login.tsx
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuth } from "../auth/useAuth";
import { apiCall } from "../api/api";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "assessor" | "user";

export default function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();

  const login = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;

    const res = await apiCall("getUserRole", { email }) as { role?: string; data?: { role?: string } };

    console.log("EMAIL:", email);
    console.log("FULL RESPONSE:", JSON.stringify(res));

    // ✅ SAFE EXTRACTION
    const role = res.role || res.data?.role || "user";

    console.log("EXTRACTED ROLE:", role);

    setUser({
      email: email!,
      roles: [role as Role],
    });

    // ✅ REDIRECT - All users go to Home page (/)
    // Admin and Assessor can still access their dashboards via navigation
    nav("/");

  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
};

  return (
    <div className="text-center mt-20">
      <button
        onClick={login}
        className="bg-[#2EB8C4] text-white px-6 py-3 rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}