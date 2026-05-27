import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import NavigationTracker from '@/lib/NavigationTracker';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { RoleRoute } from '@/components/auth/ProtectedRoute';
import { getDashboardPathForRole, resolveRoleForUser, ROLES } from '@/lib/roles';

import PilotHome from './pages/PilotHome.jsx';
import RoleDashboard from './pages/RoleDashboard.jsx';
import RoleSelect from './pages/RoleSelect.jsx';
import JourneyRoadmap from './pages/JourneyRoadmap.jsx';
import ResourceHub from './pages/ResourceHub.jsx';
import CommunityHub from './pages/CommunityHub.jsx';
import Profile from './pages/Profile';
import MyMissionBoard from './pages/MyMissionBoard.jsx';
import Progress from './pages/Progress.jsx';
import WellnessCenter from './pages/WellnessCenter.jsx';
import AICompanion from './pages/AICompanion.jsx';
import TestimonialsHub from './pages/TestimonialsHub.jsx';
import TestimonialsAdmin from './pages/TestimonialsAdmin.jsx';

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

const RoleLanding = () => {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPathForRole(resolveRoleForUser(user))} replace />;
  }
  return <PilotHome />;
};

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
        <Route path="/" element={<RoleLanding />} />
        <Route path="/Home" element={<PilotHome />} />
        <Route path="/RoleSelect" element={<RoleSelect />} />
        <Route path="/Dashboard" element={<RoleDashboard />} />
        <Route path="/ClientDashboard" element={<RoleRoute roles={[ROLES.CLIENT]}><RoleDashboard forcedRole={ROLES.CLIENT} /></RoleRoute>} />
        <Route path="/CounselorDashboard" element={<RoleRoute roles={[ROLES.COUNSELOR]}><RoleDashboard forcedRole={ROLES.COUNSELOR} /></RoleRoute>} />
        <Route path="/ProfessionalPortal" element={<Navigate to="/CounselorDashboard" replace />} />
        <Route path="/SponsorDashboard" element={<RoleRoute roles={[ROLES.SPONSOR]}><RoleDashboard forcedRole={ROLES.SPONSOR} /></RoleRoute>} />
        <Route path="/SupportUserDashboard" element={<Navigate to="/SponsorDashboard" replace />} />
        <Route path="/MentorDashboard" element={<RoleRoute roles={[ROLES.MENTOR]}><RoleDashboard forcedRole={ROLES.MENTOR} /></RoleRoute>} />
        <Route path="/ProbationDashboard" element={<RoleRoute roles={[ROLES.PROBATION_OFFICER]}><RoleDashboard forcedRole={ROLES.PROBATION_OFFICER} /></RoleRoute>} />
        <Route path="/ProbationOfficerDashboard" element={<Navigate to="/ProbationDashboard" replace />} />
        <Route path="/VeteransDashboard" element={<RoleRoute roles={[ROLES.VETERAN]}><RoleDashboard forcedRole={ROLES.VETERAN} /></RoleRoute>} />
        <Route path="/FamilySupportDashboard" element={<RoleRoute roles={[ROLES.FAMILY_SUPPORT]}><RoleDashboard forcedRole={ROLES.FAMILY_SUPPORT} /></RoleRoute>} />
        <Route path="/FacilityAdminDashboard" element={<RoleRoute roles={[ROLES.FACILITY_ADMIN]}><RoleDashboard forcedRole={ROLES.FACILITY_ADMIN} /></RoleRoute>} />
        <Route path="/FacilityDashboard" element={<Navigate to="/FacilityAdminDashboard" replace />} />
        <Route path="/StaffDashboard" element={<Navigate to="/FacilityAdminDashboard" replace />} />
        <Route path="/JourneyRoadmap" element={<JourneyRoadmap />} />
        <Route path="/ResourceHub" element={<ResourceHub />} />
        <Route path="/Community" element={<CommunityHub />} />
        <Route path="/Testimonials" element={<TestimonialsHub />} />
        <Route path="/TestimonialsAdmin" element={<TestimonialsAdmin />} />
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