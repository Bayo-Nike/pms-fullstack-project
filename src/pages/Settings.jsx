import React from 'react';

const Settings = () => {
    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-500 text-sm">Update your personal information and preferences.</p>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                        <input type="text" defaultValue="Elias" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0284C7]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Last Name</label>
                        <input type="text" defaultValue="Debelo" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0284C7]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                    <input type="email" defaultValue="elias@company.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0284C7]" />
                </div>

                <div className="pt-6">
                    <button className="bg-[#0284C7] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Settings;