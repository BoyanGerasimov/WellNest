import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Navigation from './Navigation';
import FloatingChatButton from './FloatingChatButton';
import { useAuth } from '../context/AuthContext';
import WeightCheckinModal from './WeightCheckinModal';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  // Don't show chat button on chat page itself
  const showChatButton = location.pathname !== '/chat';

  const [showWeightModal, setShowWeightModal] = useState(false);

  const shouldPromptWeight = useMemo(() => {
    if (!user) return false;
    // If user hasn't finished onboarding (no starting/current weight), don't prompt yet
    const baseline = user.startingWeight ?? user.currentWeight;
    if (!baseline) return false;

    const dismissed = sessionStorage.getItem('weightCheckinDismissed') === '1';
    if (dismissed) return false;

    if (!user.lastWeightCheckinAt) return true;
    const last = new Date(user.lastWeightCheckinAt).getTime();
    if (Number.isNaN(last)) return true;
    return Date.now() - last >= 7 * 24 * 60 * 60 * 1000;
  }, [user]);

  useEffect(() => {
    if (shouldPromptWeight) {
      setShowWeightModal(true);
    }
  }, [shouldPromptWeight]);

  // Allow any page to open the weight check-in modal (e.g. Profile page button)
  useEffect(() => {
    const handler = () => setShowWeightModal(true);
    window.addEventListener('open-weight-checkin', handler);
    return () => window.removeEventListener('open-weight-checkin', handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      {showChatButton && <FloatingChatButton />}
      <WeightCheckinModal
        open={showWeightModal}
        onClose={(saved) => {
          setShowWeightModal(false);
          // Only dismiss for this session if user chose "Not now"
          if (!saved) sessionStorage.setItem('weightCheckinDismissed', '1');
        }}
      />
    </div>
  );
};

export default Layout;

