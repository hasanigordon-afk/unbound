import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

import PilotHome from './pages/PilotHome.jsx';
import JourneyHub from './pages/JourneyHub.jsx';
import JourneyRoadmap from './pages/JourneyRoadmap.jsx';
import ResourceHub from './pages/ResourceHub.jsx';
import CommunityHub from './pages/CommunityHub.jsx';
import Profile from './pages/Profile';
import MyMissionBoard from './pages/MyMissionBoard.jsx';
import Progress from './pages/Progress.jsx';
import WellnessCenter from './pages/WellnessCenter.jsx';
import AICompanion from './pages/AICompanion.jsx';

import AddToHomeScreen from './pages/AddToHomeScreen.jsx';
import AftercarePlanView from './pages/AftercarePlanView';
import MySafetyPlan from './pages/MySafetyPlan';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import Resiliant from './pages/Resiliant';
import Splash from './pages/Splash';

import SubscriptionPrompt from '@/components/subscription/SubscriptionPrompt';
import { ThemeProvider } from '@/lib/ThemeContext';
import AmbientBackground from '@/components/shared/AmbientBackground';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';
import Phase4PolishLayer from '@/components/shared/Phase4PolishLayer';
import EmergencyCalmMode from '@/components/commandCenter/EmergencyCalmMode';
import AIStein from '@/components/aistein/AIStein';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          boxShadow: 'var(--glow)',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') {
      const path = window.location.pathname.toLowerCase();
      const publicPaths = ['/resiliant', '/about'];
      if (!publicPaths.includes(path)) return <Navigate to="/Resiliant" replace />;
    }
  }

  return (
    <>
      <SubscriptionPrompt />
      <Routes>
        <Route path="/" element={<PilotHome />} />
        <Route path="/Journey" element={<JourneyHub />} />
        <Route path="/JourneyRoadmap" element={<JourneyRoadmap />} />
        <Route path="/ResourceHub" element={<ResourceHub />} />
        <Route path="/Community" element={<CommunityHub />} />
        <Route path="/Profile" element={<Profile />} />

        <Route path="/MyMissionBoard" element={<MyMissionBoard />} />
        <Route path="/Progress" element={<Progress />} />
        <Route path="/WellnessCenter" element={<WellnessCenter />} />
        <Route path="/AICompanion" element={<AICompanion />} />

        <Route path="/AddToHomeScreen" element={<AddToHomeScreen />} />
        <Route path="/AftercarePlanView" element={<AftercarePlanView />} />
        <Route path="/MySafetyPlan" element={<MySafetyPlan />} />
        <Route path="/NotificationSettings" element={<NotificationSettings />} />
        <Route path="/PrivacySettings" element={<PrivacySettings />} />
        <Route path="/Splash" element={<Splash />} />
        <Route path="/splash" element={<Splash />} />
        <Route path="/Resiliant" element={<Resiliant />} />
        <Route path="/about" element={<Resiliant />} />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AmbientBackground />
        <Phase4PolishLayer />
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <NavigationTracker />
              <AuthenticatedApp />
              <ThemeSwitcher />
              <EmergencyCalmMode />
              <AIStein />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;