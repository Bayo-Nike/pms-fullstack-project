import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Notifications,
  Menu as BurgerMenu,
  Logout,
  Person,
  KeyboardArrowDown
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext"; // Ensure this path is 100% correct

export default function Navbar({ onMenuClick }) {
  // Defensive check: handle case where useAuth() might be null during init
  const auth = useAuth();
  const { user, logout } = auth || {};

  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowDropdown(false);
    if (logout) logout();
    navigate("/login");
  };

  // Helper to get initials from username safely
  const getInitials = (name) => {
    if (!name) return "??";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-[#0284C7] text-white h-20 w-full flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 z-50 shadow-lg">

      {/* Left Section: Mobile Menu & Brand */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg md:hidden transition-all"
        >
          <BurgerMenu />
        </button>
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black tracking-tighter leading-none">
            SCCO <span className="text-[#FBAF1E]">PMS</span>
          </span>
          <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1 hidden md:block">
            Project Management System
          </span>
        </div>
      </div>

      {/* Right Section: Notifications & User Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* Notifications Icon */}
        <button className="p-2 relative hover:bg-white/10 rounded-full transition-colors group">
          <Notifications className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-1.5 right-1.5 bg-[#FBAF1E] border-2 border-[#0284C7] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
            3
          </span>
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 bg-white/10 pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-white/20 transition-all border border-transparent active:scale-95"
          >
            <div className="w-8 h-8 rounded-full bg-[#FBAF1E] flex items-center justify-center font-bold text-white text-xs uppercase shadow-sm">
              {getInitials(user?.fullName || user?.username)}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold hidden sm:inline-block">
                {user?.fullName || user?.username || "Loading..."}
              </span>
              <KeyboardArrowDown
                className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`}
                style={{ fontSize: 18 }}
              />
            </div>
          </button>

          {/* Actual Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Signed in as</p>
                <p className="text-sm font-bold text-slate-700 truncate">
                  {user?.email || user?.username}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {user?.roles?.map((role, i) => (
                    <span key={i} className="bg-sky-50 text-[#0284C7] text-[9px] font-bold px-1.5 py-0.5 rounded border border-sky-100 uppercase">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                onClick={() => setShowDropdown(false)}
              >
                <Person style={{ fontSize: 18, color: '#94a3b8' }} /> Account Settings
              </button>

              <div className="border-t border-slate-50 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 transition-colors text-sm font-bold"
                >
                  <Logout style={{ fontSize: 18 }} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}