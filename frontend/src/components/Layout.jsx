import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import FloatingChatButton from './FloatingChatButton';

const Layout = () => {
  const location = useLocation();
  // Don't show chat button on chat page itself
  const showChatButton = location.pathname !== '/chat';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      {showChatButton && <FloatingChatButton />}
    </div>
  );
};

export default Layout;

