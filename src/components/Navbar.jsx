import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Notifications, Menu as BurgerMenu, Logout, KeyboardArrowDown,
  Circle, DoneAll, NavigateNext, ArrowBack, OpenInNew,
  Lock, Visibility, VisibilityOff, Close, VpnKey, CheckCircle, RadioButtonUnchecked
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import notificationApi from "../api/modules/notification";
import authApi from "../api/modules/auth";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();

  // --- Notifications States ---
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // --- Change Password States ---
  const [openChangePass, setOpenChangePass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState({ type: "", msg: "" });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // --- Password Policy Logic ---
  const passwordCriteria = {
    length: passData.newPassword.length >= 8,
    upper: /[A-Z]/.test(passData.newPassword),
    lower: /[a-z]/.test(passData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passData.newPassword),
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) return setPassStatus({ type: "error", msg: "Policy not met" });
    if (passData.newPassword !== passData.confirmPassword) {
      return setPassStatus({ type: "error", msg: "Confirmation does not match" });
    }

    setPassLoading(true);
    try {
      // Sends oldPassword, newPassword, and confirmPassword as required by DTO
      const res = await authApi.CHANGE_PASSWORD(passData);

      // Backend returns raw Boolean (true/false) in res.data
      if (res.data === true) {
        setPassStatus({ type: "success", msg: "Security Updated! Redirecting..." });
        setTimeout(() => {
          logout();
          navigate("/login");
        }, 2000);
      } else {
        setPassStatus({ type: "error", msg: "Update failed. Check current password." });
        setPassLoading(false);
      }
    } catch (err) {
      setPassStatus({ type: "error", msg: err.response?.data?.message || "Internal server error" });
      setPassLoading(false);
    }
  };

  // --- Notification Logic ---
  const checkIsUnread = useCallback((n) => {
    const status = n?.read ?? n?.isRead ?? n?.seen;
    return status === false || status === 0;
  }, []);

  const fetchData = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum > 0) setIsLoadingMore(true);
    try {
      const res = await notificationApi.getNotifications(pageNum, 5);
      const pageData = res?.data?.data;
      const content = pageData?.content || [];
      if (append) {
        setNotifications(prev => [...prev, ...content]);
      } else {
        setNotifications(content);
        setUnreadCount(content.filter(n => checkIsUnread(n)).length);
      }
      setPage(pageNum);
      setHasMore(!pageData?.last);
    } catch (err) { } finally { setIsLoadingMore(false); }
  }, [checkIsUnread]);

  useEffect(() => {
    fetchData(0, false);
    const interval = setInterval(() => fetchData(0, false), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 5 && hasMore && !isLoadingMore) {
      fetchData(page + 1, true);
    }
  };

  const handleItemClick = async (notif) => {
    setSelectedNotif(notif);
    if (checkIsUnread(notif)) {
      setIsMarkingRead(true);
      try {
        const res = await notificationApi.markAsRead(notif.id);
        if (res?.data?.data === true) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true, isRead: true } : n));
          setSelectedNotif(prev => ({ ...prev, read: true, isRead: true }));
        }
      } catch (err) { } finally { setIsMarkingRead(false); }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-[#0284C7] text-white h-20 w-full flex items-center justify-between px-4 md:px-8 fixed top-0 left-0 right-0 z-[100] shadow-lg">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 hover:bg-white/10 rounded-lg md:hidden" type="button"><BurgerMenu /></button>
          <div className="flex flex-col cursor-pointer select-none" onClick={() => navigate('/')}>
            <span className="text-xl md:text-2xl font-black tracking-tighter italic text-white">SCCO <span className="text-[#FBAF1E]">PMS</span></span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { if (!showNotifDropdown) { setSelectedNotif(null); fetchData(0, false); } setShowNotifDropdown(!showNotifDropdown); }}
              className={`p-2.5 relative rounded-full transition-all ${showNotifDropdown ? 'bg-white/20' : 'hover:bg-white/10'}`}
              type="button"
            >
              <Notifications className={unreadCount > 0 ? "animate-pulse" : "opacity-80"} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#FBAF1E] border-2 border-[#0284C7] text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-black">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifDropdown && (
              <div className="absolute right-[-60px] md:right-0 mt-3 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn z-50 text-slate-800">
                <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                  {selectedNotif && <button onClick={() => setSelectedNotif(null)} className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 transition-all"><ArrowBack style={{ fontSize: 18 }} /></button>}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px]">{selectedNotif ? "Detail View" : "Notifications"}</span>
                </div>
                <div onScroll={!selectedNotif ? handleScroll : undefined} className="max-h-[420px] overflow-y-auto no-scrollbar min-h-[250px] flex flex-col">
                  {selectedNotif ? (
                    <div className="p-8 flex-1 flex flex-col animate-fadeIn">
                      <p className="text-slate-800 text-sm font-medium leading-relaxed mb-8">{selectedNotif.message}</p>
                      <button disabled={isMarkingRead} onClick={() => { setShowNotifDropdown(false); navigate(selectedNotif.notificationUrl); }} className={`mt-auto w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${isMarkingRead ? 'bg-slate-100 text-slate-300' : 'bg-[#0284C7] text-white hover:bg-[#0369a1]'}`}>
                        {isMarkingRead ? <div className="w-4 h-4 border-2 border-slate-200 border-t-[#0284C7] rounded-full animate-spin" /> : <><OpenInNew style={{ fontSize: 16 }} /> Open Record</>}
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center px-10"><DoneAll className="text-emerald-500/10 mb-2" style={{ fontSize: 64 }} /><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">Everything up to date</p></div>
                  ) : (
                    <>
                      {notifications.map((notif) => (
                        <div key={notif.id} onClick={() => handleItemClick(notif)} className="p-5 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-all flex gap-4 group">
                          <div className="mt-1.5 flex-shrink-0"><Circle className={checkIsUnread(notif) ? "text-[#FBAF1E]" : "text-slate-100"} style={{ fontSize: 10 }} /></div>
                          <div className="flex-1"><p className={`text-[12px] line-clamp-2 ${checkIsUnread(notif) ? 'text-slate-800 font-black' : 'text-slate-400 font-medium'}`}>{notif.message}</p></div>
                          <NavigateNext className="text-slate-200 group-hover:text-[#0284C7] transition-colors self-center" />
                        </div>
                      ))}
                      {isLoadingMore && <div className="p-4 text-center text-[9px] font-black text-slate-400 animate-pulse uppercase tracking-widest">Loading more...</div>}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-3 bg-white/10 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-white/20 transition-all active:scale-95 shadow-inner" type="button">
              <div className="w-8 h-8 rounded-full bg-[#FBAF1E] flex items-center justify-center font-black text-white text-xs border-2 border-[#0284C7]">{(user?.fullName || "U").substring(0, 1).toUpperCase()}</div>
              <span className="text-sm font-bold hidden sm:inline-block tracking-tight max-w-[120px] truncate">{user?.fullName || "Personnel"}</span>
              <KeyboardArrowDown className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} style={{ fontSize: 18 }} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 animate-fadeIn py-2 z-50 overflow-hidden text-slate-800">
                <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-50 mb-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Signed in as</p>
                  <p className="text-sm font-black text-slate-800 truncate">{user?.email}</p>
                </div>
                <button onClick={() => { setShowDropdown(false); setOpenChangePass(true); }} className="w-full flex items-center gap-3 px-5 py-3 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest transition-colors" type="button"><Lock style={{ fontSize: 18, color: '#0284C7' }} /> Change Password</button>
                <button onClick={() => { logout(); navigate("/login"); }} className="w-full flex items-center gap-3 px-5 py-3 text-red-500 hover:bg-red-50 text-xs font-black uppercase tracking-widest transition-colors border-t border-slate-50" type="button"><Logout style={{ fontSize: 18 }} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- Change Password Dialog --- */}
      {openChangePass && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !passLoading && setOpenChangePass(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideUp">

            <div className="bg-[#0284C7] p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><VpnKey /></div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest leading-none">Access Policy</h3>
                  <p className="text-[9px] font-medium opacity-70 mt-1">Update Security Key</p>
                </div>
              </div>
              <button disabled={passLoading} onClick={() => setOpenChangePass(false)} className="p-1 hover:bg-white/10 rounded-full transition-all"><Close /></button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-8 space-y-4">
              {passStatus.msg && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-wider animate-slideDown ${passStatus.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {passStatus.type === "success" ? <CheckCircle style={{ fontSize: 18 }} /> : <Close style={{ fontSize: 18 }} />}
                  {passStatus.msg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                <div className="relative">
                  <input required type={showPass.old ? "text" : "password"} className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0284C7] focus:bg-white outline-none text-sm font-bold transition-all" value={passData.oldPassword} onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, old: !p.old }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{showPass.old ? <VisibilityOff /> : <Visibility />}</button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <input required type={showPass.new ? "text" : "password"} className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0284C7] focus:bg-white outline-none text-sm font-bold transition-all" value={passData.newPassword} onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, new: !p.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{showPass.new ? <VisibilityOff /> : <Visibility />}</button>
                </div>

                {/* Policy Checklist */}
                <div className="grid grid-cols-2 gap-2 mt-2 ml-1">
                  {[
                    { label: "8+ Char", met: passwordCriteria.length },
                    { label: "Uppercase", met: passwordCriteria.upper },
                    { label: "Lowercase", met: passwordCriteria.lower },
                    { label: "Special", met: passwordCriteria.special },
                  ].map((c, i) => (
                    <div key={i} className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider ${c.met ? "text-emerald-500" : "text-slate-300"}`}>
                      {c.met ? <CheckCircle style={{ fontSize: 10 }} /> : <RadioButtonUnchecked style={{ fontSize: 10 }} />}
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                <div className="relative">
                  <input required type={showPass.confirm ? "text" : "password"} className="w-full px-5 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#0284C7] focus:bg-white outline-none text-sm font-bold transition-all" value={passData.confirmPassword} onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">{showPass.confirm ? <VisibilityOff /> : <Visibility />}</button>
                </div>
              </div>

              <button disabled={passLoading || !isPasswordValid} type="submit" className="w-full py-4 bg-[#0284C7] text-white rounded-2xl font-black uppercase tracking-[2px] text-xs shadow-lg hover:bg-[#0369a1] active:scale-95 transition-all disabled:opacity-50 mt-4">
                {passLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : "Verify & Update"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}