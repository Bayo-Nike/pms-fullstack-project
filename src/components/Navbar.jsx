import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Notifications, Menu as BurgerMenu, Logout, Person, KeyboardArrowDown,
  AccessTime, Circle, DoneAll, NavigateNext, ArrowBack, Add, History
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import notificationApi from "../api/modules/notification";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const fetchUnreadData = async () => {
    try {
      const res = await notificationApi.getNotifications();
      const allData = res.data.data || [];

      // Filter strictly for items that ARE NOT read
      const unreadOnly = allData.filter(n => n.isRead === false);
      setUnreadCount(unreadOnly.length);

      // If the user is currently looking at the Inbox, update the list
      if (!isHistoryMode) {
        setNotifications(unreadOnly);
      }
    } catch (err) { console.error(err); }
  };

  const loadHistory = async (reset = true) => {
    setNotifLoading(true);
    setIsHistoryMode(true);
    const targetPage = reset ? 0 : page + 1;

    try {
      const res = await notificationApi.getHistory(targetPage);
      const historyData = res.data.data || [];

      if (reset) {
        setNotifications(historyData);
        setPage(0);
      } else {
        setNotifications(prev => [...prev, ...historyData]);
        setPage(targetPage);
      }
      // If we received fewer than 10 items, assume no more pages exist
      setHasMore(historyData.length === 10);
    } catch (err) { console.error(err); }
    finally { setNotifLoading(false); }
  };

  const handleToggleInbox = () => {
    setIsHistoryMode(false);
    setShowNotifDropdown(!showNotifDropdown);
    if (!showNotifDropdown) fetchUnreadData();
  };

  useEffect(() => {
    fetchUnreadData();
    const interval = setInterval(fetchUnreadData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
        setIsHistoryMode(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await notificationApi.markAsRead(notif.id);
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (!isHistoryMode) {
          // Remove from Inbox view immediately
          setNotifications(prev => prev.filter(n => n.id !== notif.id));
        } else {
          // Just update visual status in History view
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        }
      } catch (err) { console.error(err); }
    }

    setShowNotifDropdown(false);
    if (notif.notificationUrl) navigate(notif.notificationUrl);
  };

  return (
    <header className="bg-[#0284C7] text-white h-20 w-full flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 z-[100] shadow-lg">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 hover:bg-white/10 rounded-lg md:hidden"><BurgerMenu /></button>
        <div className="flex flex-col cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-xl md:text-2xl font-black tracking-tighter leading-none">SCCO <span className="text-[#FBAF1E]">PMS</span></span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleInbox}
            className={`p-2.5 relative rounded-full transition-all ${showNotifDropdown ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <Notifications className={unreadCount > 0 ? "animate-pulse" : ""} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#FBAF1E] border-2 border-[#0284C7] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-black">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn z-50">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  {isHistoryMode && (
                    <button onClick={() => setIsHistoryMode(false)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-all">
                      <ArrowBack style={{ fontSize: 16 }} />
                    </button>
                  )}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">
                    {isHistoryMode ? "Personnel History" : `Unread Inbox (${unreadCount})`}
                  </span>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar relative min-h-[250px]">
                {notifLoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-slate-100 border-t-[#0284C7] rounded-full animate-spin"></div>
                  </div>
                )}

                {notifications.length === 0 && !notifLoading ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <DoneAll className="text-emerald-500/20 mb-2" style={{ fontSize: 48 }} />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No notifications to show</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notif) => (
                      <div
                        key={`${notif.id}-${isHistoryMode}`}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-5 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all flex gap-4"
                      >
                        <div className="mt-1.5 flex-shrink-0">
                          <Circle className={notif.isRead ? "text-slate-100" : "text-[#FBAF1E]"} style={{ fontSize: 10 }} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-[12px] leading-tight ${notif.isRead ? 'text-slate-400 font-medium' : 'text-slate-800 font-black'}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <AccessTime style={{ fontSize: 12 }} className="text-slate-300" />
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <NavigateNext className="text-slate-200 self-center" />
                      </div>
                    ))}

                    {isHistoryMode && hasMore && (
                      <button
                        onClick={() => loadHistory(false)}
                        className="w-full py-4 text-[10px] font-black text-[#0284C7] uppercase bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border-t border-slate-100"
                      >
                        {notifLoading ? "..." : <><Add style={{ fontSize: 14 }} /> View Older Notifications</>}
                      </button>
                    )}
                  </>
                )}
              </div>

              {!isHistoryMode && (
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
                  <button onClick={() => loadHistory(true)} className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] hover:text-[#0284C7] flex items-center justify-center gap-2 w-full transition-all">
                    <History style={{ fontSize: 14 }} /> Explore Full History
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 bg-white/10 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-white/20 transition-all active:scale-95">
            <div className="w-8 h-8 rounded-full bg-[#FBAF1E] flex items-center justify-center font-black text-white text-xs border-2 border-[#0284C7]">
              {(user?.fullName || "U").substring(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-bold hidden sm:inline-block tracking-tight">{user?.fullName || "User"}</span>
            <KeyboardArrowDown className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} style={{ fontSize: 18 }} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 animate-fadeIn py-2 z-50">
              <div className="px-5 py-4 border-b border-slate-50 mb-1">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Active Personnel</p>
                <p className="text-sm font-black text-slate-800 truncate">{user?.email}</p>
              </div>
              {/* <button className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest"><Person style={{ fontSize: 18, color: '#0284C7' }} /> Account</button> */}
              <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 text-xs font-black uppercase border-t border-slate-50 tracking-widest"><Logout style={{ fontSize: 18 }} /> Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}