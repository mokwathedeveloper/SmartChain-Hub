import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const isAppRoute = ['/dashboard', '/features', '/history', '/revenue', '/profile', '/console'].includes(router.pathname);
  const isAuthRoute = ['/login', '/signup'].includes(router.pathname);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (isAppRoute) {
    return (
      <div className="flex min-h-screen bg-soft-white font-sans overflow-hidden">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-deep-blue/50 backdrop-blur-sm z-[60] lg:hidden"
            onClick={toggleSidebar}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`fixed lg:relative z-[70] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col h-screen overflow-y-auto">
          <Header onMenuClick={toggleSidebar} />
          <main className="flex-grow p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {!isAuthRoute && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
};

export default Layout;
