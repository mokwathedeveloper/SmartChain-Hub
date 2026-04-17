import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const APP_ROUTES = ['/dashboard', '/transactions', '/payments', '/onramp', '/console', '/history', '/revenue', '/profile'];
const AUTH_ROUTES = ['/login', '/signup'];

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAppRoute = APP_ROUTES.includes(router.pathname);
  const isAuthRoute = AUTH_ROUTES.includes(router.pathname);

  if (isAppRoute) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-[60] lg:hidden" onClick={() => setIsSidebarOpen(false)}/>
        )}
        {/* Sidebar */}
        <div className={`fixed lg:sticky lg:top-0 lg:h-screen z-[70] transition-transform duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthRoute && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAuthRoute && <Footer />}
    </div>
  );
};

export default Layout;
