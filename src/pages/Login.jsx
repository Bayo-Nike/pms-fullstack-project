import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, LockOutlined, PersonOutline, LoginOutlined, ShieldOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/modules/auth';
import AlertMessage from '../components/Reusable/AlertMessage';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: 'info', message: '' });

    // If user is already logged in, don't show login page
    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard', { replace: true });
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setAlert({ show: true, type: 'error', message: 'Please enter your credentials.' });
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.LOGIN({ usernameOrEmail: username.trim(), password });
            console.log(res.data);
            // 1. Update Context (State + LocalStorage)
            login(res.data);

            // 2. Redirect
            navigate('/dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setAlert({ show: true, type: 'error', message: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
            <div className="max-w-[400px] w-full px-4">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-[24px] bg-[#0284C7] text-white shadow-xl mb-4">
                        <ShieldOutlined style={{ fontSize: 32 }} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">SCCO PMS</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Project Management Suite</p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/60">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-800">Secure Access</h2>
                        <p className="text-xs text-slate-400 mt-1">Enter your credentials to manage projects.</p>
                    </div>

                    <AlertMessage show={alert.show} type={alert.type} message={alert.message} onClose={() => setAlert({ ...alert, show: false })} />

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-wider">Username</label>
                            <div className="relative">
                                <PersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 20 }} />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] focus:bg-white transition-all text-sm font-semibold" placeholder="Username" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-wider">Password</label>
                            <div className="relative">
                                <LockOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" style={{ fontSize: 20 }} />
                                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-[#0284C7] focus:bg-white transition-all text-sm font-semibold" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                                    {showPassword ? <VisibilityOff style={{ fontSize: 18 }} /> : <Visibility style={{ fontSize: 18 }} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-[#0284C7] text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-[#016da3] transition-all disabled:opacity-50">
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <><LoginOutlined style={{ fontSize: 18 }} /> Sign In</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}