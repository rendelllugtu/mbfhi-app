// src/components/Layout.tsx
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Chatbot from "./Chatbot";
import { useAuth } from "../auth/useAuth";
import { apiCall } from "../api/api";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [assignedAssessor, setAssignedAssessor] = useState<string>("admin");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.email) return;

    // Check if user has an application assigned to an assessor
    apiCall("getUserApplicationStatus", { email: user.email })
      .then((res: any) => {
        if (res.assessor) {
          // User has an assigned assessor - route chat to that assessor (email)
          setAssignedAssessor(res.assessor);
        } else {
          // No assessor assigned - route chat to admin
          setAssignedAssessor("admin");
        }
      })
      .catch(() => {
        // Default to admin if API fails
        setAssignedAssessor("admin");
      });

    // Fetch unread message count
    apiCall("getUnreadMessageCount", { email: user.email })
      .then((res: any) => {
        if (res && res.unreadCount !== undefined) {
          setUnreadCount(res.unreadCount);
        }
      })
      .catch(() => {
        // Ignore errors
      });
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* HEADER */}
      <header className="bg-[#2EB8C4] text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4 px-4">

          {/* LOGO */}
          <img
          src="/logo.jpg"
          alt="logo"
          className="h-12 w-12 rounded-full"
        />

          {/* TITLE */}
          <h1 className="text-lg md:text-xl font-semibold text-center leading-tight">
            Nutrition and Breastfeeding Program CALABARZON
          </h1>
        </div>
      </header>

      <Navbar />

      {/* MAIN */}
      <main className="grow bg-gray-100 p-6 text-center max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#2EB8C4] text-white text-center py-4 mt-10">
        © 2026 Mother-Baby Friendly Calabarzon
      </footer>

      {/* 🤖 FLOATING CHATBOT */}
      <Chatbot targetRecipient={assignedAssessor} userEmail={user?.email || ""} unreadCount={unreadCount} />

    </div>
  );
}