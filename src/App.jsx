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
import JourneyRoadmap from './pages/JourneyRoadmap.jsx';
import ResourceHub from './pages/ResourceHub.jsx';
import CommunityHub from './pages/CommunityHub.jsx';
import Profile from './pages/Profile';
import MyMissionBoard from './pages/MyMissionBoard.jsx';
import Progress from './pages/Progress.jsx';
import WellnessCenter from './pages/WellnessCenter.jsx';
import AICompanion from './pages/AICompanion.jsx';
import AhHaMomentsHub from './pages/TestimonialsHub.jsx';
import AhHaMomentsAdmin from './pages/TestimonialsAdmin.jsx';
import Onboarding from './pages/Onboarding.jsx';
import DailyCheckIn from './pages/DailyCheckIn.jsx';
import FacilityPilotDashboard from './pages/FacilityPilotDashboard.jsx';
import PilotClientIntake from './pages/PilotClientIntake.jsx';
import PilotTreatmentPlan from './pages/PilotTreatmentPlan.jsx';
import PilotFeedback from './pages/PilotFeedback.jsx';
import SEESuperAgent from './pages/SEESuperAgent.jsx';
import CounselorDashboard from './pages/CounselorDashboard.jsx';
import CounselorMessaging from './pages/CounselorMessaging.jsx';
import PositiveProgressHub from './pages/PositiveProgressHub.jsx';
import CravingControlCenter from './pages/CravingControlCenter.jsx';
import Lifeline from './pages/Lifeline.jsx';
import SuperAgentChat from './pages/SuperAgentChat.jsx';
import AhHaCommunity from './pages/AhHaCommunity.jsx';

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
        <Route path="/Home" element={<Navigate to="/" replace />} />
        <Route path="/Onboarding" element={<Onboarding />} />
        <Route path="/JourneyRoadmap" element={<JourneyRoadmap />} />
        <Route path="/ResourceHub" element={<ResourceHub />} />
        <Route path="/Community" element={<CommunityHub />} />
        <Route path="/AhHaMoments" element={<AhHaMomentsHub />} />
        <Route path="/Testimonials" element={<Navigate to="/AhHaMoments" replace />} />
        <Route path="/AhHaMomentsAdmin" element={<AhHaMomentsAdmin />} />
        <Route path="/TestimonialsAdmin" element={<Navigate to="/AhHaMomentsAdmin" replace />} />
        <Route path="/AhHaCommunity" element={<AhHaCommunity />} />
        <Route path="/Profile" element={<Profile />} />

        <Route path="/MyMissionBoard" element={<MyMissionBoard />} />
        <Route path="/Progress" element={<Progress />} />
        <Route path="/WellnessCenter" element={<WellnessCenter />} />
        <Route path="/AICompanion" element={<AICompanion />} />
        <Route path="/AskReZilientAI" element={<AICompanion />} />
        <Route path="/DailyCheckIn" element={<DailyCheckIn />} />
        <Route path="/SEESuperAgent" element={<SEESuperAgent />} />
        <Route path="/FacilityPilotDashboard" element={<FacilityPilotDashboard />} />
        <Route path="/PilotClientIntake" element={<PilotClientIntake />} />
        <Route path="/PilotTreatmentPlan" element={<PilotTreatmentPlan />} />
        <Route path="/PilotFeedback" element={<PilotFeedback />} />
        <Route path="/CounselorDashboard" element={<CounselorDashboard />} />
        <Route path="/CounselorMessaging" element={<CounselorMessaging />} />
        <Route path="/PositiveProgressHub" element={<PositiveProgressHub />} />
        <Route path="/CravingControlCenter" element={<CravingControlCenter />} />
        <Route path="/Lifeline" element={<Lifeline />} />
        <Route path="/SuperAgentChat" element={<SuperAgentChat />} />
        <Route path="/Meetings" element={<Navigate to="/ResourceHub?category=Recovery%20Programs" replace />} />
        <Route path="/Journal" element={<Navigate to="/DailyCheckIn" replace />} />
        <Route path="/ForwardPlan" element={<Navigate to="/JourneyRoadmap" replace />} />
        <Route path="/MentalReset" element={<Navigate to="/WellnessCenter" replace />} />
        <Route path="/InnerCircle" element={<Navigate to="/Profile#support" replace />} />

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