// src/components/Chatbot.tsx

import { useState, useRef, useEffect } from "react";
import Picker from "emoji-picker-react"; // For Emoji Picker
import { apiCall } from "../api/api";

export default function Chatbot({
  messages: externalMessages = [],
  sendMessage: externalSendMessage,
  handleDrop: externalHandleDrop,
  file: externalFile,
  input: externalInput,
  setInput: externalSetInput,
  userEmail = "",
  typing: externalTyping = false, // Added: Typing indicator
  setTyping: externalSetTyping = () => {}, // Added: Set typing state
  targetRecipient = "admin", // New: Target recipient (admin or assigned assessor)
  unreadCount = 0, // Number of unread messages
}: any) {
  // Internal state for chat functionality
  const [open, setOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use external props if provided, otherwise use internal state
  const chatMessages = externalMessages.length > 0 ? externalMessages : messages;
  const chatInput = externalInput !== undefined ? externalInput : input;
  const chatSetInput = externalSetInput || setInput;
  const chatFile = externalFile !== undefined ? externalFile : file;
  const chatTyping = externalTyping || isTyping;

  // ✅ auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Load chat history from backend
  useEffect(() => {
    if (!userEmail) return;
    
    const loadChatHistory = async () => {
      try {
        const res = await apiCall("getUserChatMessages", {
          email: userEmail,
          targetRecipient: targetRecipient
        });
        
        if (res && Array.isArray(res) && res.length > 0) {
          // Add id and seen fields to each message
          const formattedMessages = res.map((m: any, index: number) => ({
            id: index + 1,
            from: m.from,
            to: m.to,
            message: m.message,
            time: m.time,
            seen: false
          }));
          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    
    loadChatHistory();
  }, [userEmail, targetRecipient]);

  const handleEmojiClick = (emoji: { emoji: string }) => {
    chatSetInput(chatInput + emoji.emoji); // Add emoji to input field
    setShowEmojiPicker(false); // Close emoji picker after selection
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return; // Don't send empty messages

    const messageText = chatInput;
    const fromEmail = userEmail || "user";
    // Use actual targetRecipient (could be "admin" or an email address)
    const toRecipient = targetRecipient || "admin";

    // Add message to local state immediately (optimistic update)
    setMessages((prev: any) => [
      ...prev,
      {
        id: prev.length + 1,
        message: messageText,
        from: fromEmail,
        to: toRecipient,
        time: new Date().toISOString(),
        seen: false,
      },
    ]);

    chatSetInput(""); // Clear input

    try {
      // Save message to backend (Sheet3)
      await apiCall("saveChatMessage", {
        from: fromEmail,
        to: toRecipient,
        message: messageText,
      });
    } catch (err) {
      console.error("Failed to save message:", err);
    }

    // Show auto-reply after a delay
    // For admin chats, reply is from "admin"; for assessor chats, reply is from their email
    const replyFrom = toRecipient === "admin" ? "admin" : toRecipient;
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev: any) => [
        ...prev,
        {
          id: prev.length + 1,
          message: getAutoReply(messageText),
          from: replyFrom,
          time: new Date().toISOString(),
          seen: false,
        },
      ]);
    }, 2000);
  };

  // Simple auto-reply responses
  const getAutoReply = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      return "Hello! How can I help you today with your MBFHI application?";
    }
    if (lowerMsg.includes("apply") || lowerMsg.includes("application")) {
      return "To apply for MBFHI certification, go to the Apply page and fill out the form. Our team will review your application.";
    }
    if (lowerMsg.includes("requirement") || lowerMsg.includes("documents")) {
      return "The requirements include: valid PRC license, facility compliance checklist, and supporting documents. You can find the full list on the About page.";
    }
    if (lowerMsg.includes("status") || lowerMsg.includes("check")) {
      return "You can check your application status by logging in and viewing your dashboard. Our assessors will update you once the assessment is complete.";
    }
    if (lowerMsg.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    return "Thank you for your message! Our team will get back to you shortly. For urgent inquiries, please contact us directly.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (externalHandleDrop) {
        externalHandleDrop();
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Default handlers when not provided externally
  const handleDrop = externalHandleDrop || (() => {});

  // Format timestamp
  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">

      {/* =============================
          FLOAT BUTTON
      ============================= */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#2EB8C4] p-2 rounded-full shadow-lg hover:scale-105 transition-transform duration-200 hover:shadow-xl relative"
        title="Open MBFHI Assistant"
      >
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663453286137/fm4CbqEeDTmvKMP2tfgiZu/mbfhi-logo-2xgCJNTNscbXsHCSx9jSUx.webp"
          alt="MBFHI Assistant"
          className="h-10 w-10 rounded-full object-cover"
        />
        {/* Notification badge */}
        {(unreadCount > 0 || (chatMessages.length > 0 && !open)) && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 0 ? unreadCount : '!'}
          </span>
        )}
      </button>

      {/* =============================
          CHAT WINDOW
      ============================= */}
      {open && (
        <div
          className="mt-4 w-95 h-130 bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-200 animate-slide-up"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >

          {/* CHAT HEADER */}
          <div className="bg-[#2EB8C4] text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663453286137/fm4CbqEeDTmvKMP2tfgiZu/mbfhi-logo-2xgCJNTNscbXsHCSx9jSUx.webp"
                alt="MBFHI"
                className="h-6 w-6 rounded object-cover"
              />
              <h3 className="font-semibold">MBFHI Assistant</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* =============================
              MESSAGES
          ============================= */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-linear-to-b from-gray-50 to-gray-100">

            {/* Welcome message */}
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 mb-1">Welcome to MBFHI!</h3>
                <p className="text-sm text-gray-500 px-4">Send us a message and we'll get back to you as soon as possible.</p>
              </div>
            )}

            {chatMessages.map((m: any, index: number) => {
              // Check if message is from current user (compare with userEmail)
              const currentUserEmail = userEmail?.toLowerCase() || "";
              const messageFrom = (m.from || "").toLowerCase();
              // Message is from me if it's from my email or not from the target recipient
              const isMe = messageFrom === currentUserEmail || (messageFrom !== "admin" && messageFrom !== targetRecipient?.toLowerCase());
              const showTimestamp = index === 0 || (messages[index - 1] && new Date(m.time).getTime() - new Date(messages[index - 1].time).getTime() > 300000);

              return (
                <div key={m.id || index}>
                  {/* Time separator */}
                  {showTimestamp && (
                    <div className="flex justify-center my-4">
                      <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                        {m.time ? formatTime(m.time) : 'Just now'}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {/* Avatar for received messages */}
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-semibold mr-2 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group
                        ${isMe 
                          ? "bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-br-md" 
                          : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                        }`}
                    >
                      {/* TEXT */}
                      {m.message && <div className="wrap-break-words">{m.message}</div>}

                      {/* IMAGE */}
                      {m.fileUrl && m.fileType?.startsWith("image") && (
                        <img
                          src={m.fileUrl}
                          className="mt-2 rounded-lg w-full max-w-50"
                          alt="Shared image"
                        />
                      )}

                      {/* FILE */}
                      {m.fileUrl && !m.fileType?.startsWith("image") && (
                        <a
                          href={m.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 mt-2 p-2 rounded-lg ${
                            isMe ? "bg-white/20 hover:bg-white/30" : "bg-gray-100 hover:bg-gray-200"
                          } transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-sm underline">View File</span>
                        </a>
                      )}

                      {/* Timestamp */}
                      <div className={`text-[10px] mt-1 ${isMe ? "text-teal-100" : "text-gray-400"}`}>
                        {m.time ? formatTime(m.time) : ''}
                        {isMe && (
                          <span className="ml-1">
                            {m.seen ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                              </svg>
                            ) : "✓"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Avatar for sent messages */}
                    {isMe && (
                      <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold ml-2 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {chatTyping && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-semibold mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* =============================
              FILE PREVIEW
          ============================= */}
          {file && (
            <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span className="truncate max-w-50">{file.name}</span>
              </div>
              <button onClick={() => handleDrop()} className="text-gray-400 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* =============================
              INPUT AREA
          ============================= */}
          <div className="p-3 border-t bg-white">

            {/* Quick actions */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setInput("Hello! I need help with my MBFHI application.")}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                👋 Say Hello
              </button>
              <button
                onClick={() => setInput("I have a question about my application status.")}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
              >
                ❓ Application Status
              </button>
            </div>

            <div className="flex gap-2 items-center">
              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Attach Button */}
              <label className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer text-gray-500 hover:text-gray-700" title="Attach file">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  title="Attach file"
                />
              </label>

              {/* Text Input */}
              <input
                value={chatInput}
                onChange={(e) => chatSetInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!chatInput.trim()}
                aria-label="Send message"
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  input.trim()
                    ? "bg-linear-to-r from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

          {/* =============================
              EMOJI PICKER
          ============================= */}
          {showEmojiPicker && (
            <div className="absolute bottom-24 right-20 bg-white shadow-2xl z-50 rounded-xl overflow-hidden border border-gray-200">
              <Picker 
                onEmojiClick={handleEmojiClick} 
                width={300}
                height={400}
                previewConfig={{ showPreview: false }}
              />
            </div>
          )}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
