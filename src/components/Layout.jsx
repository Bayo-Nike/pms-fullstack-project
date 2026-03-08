import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom'; // <--- THIS IS REQUIRED
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) setIsCollapsed(true);
      if (window.innerWidth >= 1024) setIsCollapsed(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

      <div className="flex flex-1 overflow-hidden mt-20">
        <Sidebar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          closeMobile={() => setIsMobileOpen(false)}
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 bg-[#F8FAFC] transition-all duration-300"
          style={{ marginLeft: !isMobile ? (isCollapsed ? '80px' : '265px') : '0px' }}
        >
          <div className="max-w-7xl mx-auto">
            {/* --- CONTENT AREA: This renders Dashboard, Users, etc. --- */}
            <Outlet />
          </div>
        </main>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}
    </div>
  );
};

export default Layout;