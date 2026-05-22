import { ReactNode, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
}

const APP_ROUTES = ['/dashboard', '/transactions', '/payments', '/onramp', '/console', '/history', '/revenue', '/profile', '/marketplace', '/proof', '/activity'];
const AUTH_ROUTES = ['/login', '/signup'];

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAppRoute = APP_ROUTES.includes(router.pathname);
  const isAuthRoute = AUTH_ROUTES.includes(router.pathname);

  if (isAppRoute) {
    return (
      <div className="flex min-h-screen min-h-dvh bg-gray-950">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        {/* Mobile overlay — covers full viewport including iOS notch areas */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            style={{ touchAction: 'none' }}
          />
        )}
        {/* Sidebar */}
        <div
          className={`fixed lg:sticky lg:top-0 lg:h-screen z-[70] transition-transform duration-300 shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
          style={{ willChange: 'transform' }}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen min-h-dvh min-w-0 overflow-x-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main id="main-content" className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen min-h-dvh">
      {!isAuthRoute && <Header />}
      <main className="flex-grow overflow-x-hidden">{children}</main>
      {!isAuthRoute && <Footer />}
    </div>
  );
};

export default Layout;
