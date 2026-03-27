import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Lock, Visibility, VisibilityOff, ArrowBack,
    CheckCircle, ErrorOutline, VpnKey
} from "@mui/icons-material";
import authApi from "../api/modules/auth"; // Adjusted based on your export

export default function ChangePassword() {
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // UI States
    const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status.message) setStatus({ type: "", message: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Client-side Validation
        if (formData.newPassword !== formData.confirmPassword) {
            return setStatus({ type: "error", message: "New passwords do not match" });
        }
        if (formData.newPassword.length < 6) {
            return setStatus({ type: "error", message: "Password must be at least 6 characters" });
        }

        setLoading(true);
        try {
            // Matches your authApi structure
            const res = await authApi.CHANGE_PASSWORD({
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            // Matches your ApiResponse<T> structure (res.data.success)
            if (res?.data?.success) {
                setStatus({ type: "success", message: "Password changed successfully!" });
                setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });

                // Redirect home after 2 seconds
                setTimeout(() => navigate("/"), 2000);
            }
        } catch (err) {
            setStatus({
                type: "error",
                message: err.response?.data?.message || "Failed to change password. Please verify your current password."
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleVisibility = (field) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-fadeIn">

                {/* Header Section */}
                <div className="bg-[#0284C7] p-8 text-white relative">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-6 top-8 p-2 hover:bg-white/10 rounded-full transition-all"
                    >
                        <ArrowBack />
                    </button>
                    <div className="text-center mt-4">
                        <div className="w-16 h-16 bg-[#FBAF1E] rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-12">
                            <VpnKey style={{ fontSize: 32, color: 'white' }} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Security Update</h2>
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[2px] mt-1">Change Personnel Password</p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="p-8 space-y-5">

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slideDown ${status.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                            }`}>
                            {status.type === "success" ? <CheckCircle /> : <ErrorOutline />}
                            <span className="text-xs font-black uppercase tracking-tight">{status.message}</span>
                        </div>
                    )}

                    {/* Current Password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0284C7] transition-colors" />
                            <input
                                required
                                type={showPass.old ? "text" : "password"}
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0284C7] transition-all outline-none text-sm font-bold"
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility('old')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                            >
                                {showPass.old ? <VisibilityOff style={{ fontSize: 20 }} /> : <Visibility style={{ fontSize: 20 }} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0284C7] transition-colors" />
                            <input
                                required
                                type={showPass.new ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0284C7] transition-all outline-none text-sm font-bold"
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility('new')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                            >
                                {showPass.new ? <VisibilityOff style={{ fontSize: 20 }} /> : <Visibility style={{ fontSize: 20 }} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0284C7] transition-colors" />
                            <input
                                required
                                type={showPass.confirm ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#0284C7] transition-all outline-none text-sm font-bold"
                            />
                            <button
                                type="button"
                                onClick={() => toggleVisibility('confirm')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                            >
                                {showPass.confirm ? <VisibilityOff style={{ fontSize: 20 }} /> : <Visibility style={{ fontSize: 20 }} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-4 bg-[#0284C7] text-white rounded-2xl font-black uppercase tracking-[2px] text-xs shadow-lg hover:bg-[#0369a1] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Update Security Key"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="p-6 bg-slate-50 text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        SCCO <span className="text-[#0284C7]">Personnel Management System</span> v1.0
                    </p>
                </div>
            </div>
        </div>
    );
}