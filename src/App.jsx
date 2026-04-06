import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { StaffRoute, AdminRoute } from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

// ── Pages not yet in pagesConfig ─────────────────────────────────────────────
import DischargePlan from './pages/DischargePlan';
import EachOneTeachOne from './pages/EachOneTeachOne';
import RecoveryMapFinder from './pages/RecoveryMapFinder';
import FacilityReviews from './pages/FacilityReviews';
import TruthAboutRecovery from './pages/TruthAboutRecovery';
import MySafetyPlan from './pages/MySafetyPlan';
import StaffDashboard from './pages/StaffDashboard';
import PrivacySettings from './pages/PrivacySettings';
import ParticipantDashboard from './pages/ParticipantDashboard';
import NJHousingSearch from './pages/NJHousingSearch';
import MentalReset from './pages/MentalReset';
import PatientSummaryDashboard from './pages/PatientSummaryDashboard';
import PayItForward from './pages/PayItForward';
import PayItForwardAdmin from './pages/PayItForwardAdmin';
import TopFiveFocus from './pages/TopFiveFocus';
import SupportUserDashboard from './pages/SupportUserDashboard';
import FacilityDashboard from './pages/FacilityDashboard';
import ClientConnectionsPage from './pages/ClientConnectionsPage';
import RecoveryPath from './pages/RecoveryPath';
import MyFoundation from './pages/MyFoundation';
import InnerCircle from './pages/InnerCircle';
import MyPath from './pages/MyPath';
import DailyFlow from './pages/DailyFlow';
import ResetButton from './pages/ResetButton';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// ── Layout wrapper ────────────────────────────────────────────────────────────
const LW = ({ name, children }) => Layout
  ? <Layout currentPageName={name}>{children}</Layout>
  : <>{children}</>;

// ── Staff-protected wrapper ───────────────────────────────────────────────────
const SW = ({ name, children }) => (
  <StaffRoute>
    <LW name={name}>{children}</LW>
  </StaffRoute>
);

// ── Admin-protected wrapper ───────────────────────────────────────────────────
const AW = ({ name, children }) => (
  <AdminRoute>
    <LW name={name}>{children}</LW>
  </AdminRoute>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#070D1C" }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(62,207,191,0.2)",
          borderTopColor: "#3ECFBF",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* ── Main page ── */}
      <Route path="/" element={<LW name={mainPageKey}><MainPage /></LW>} />

      {/* ── pagesConfig loop (existing pages) ── */}
      {Object.entries(Pages).map(([path, Page]) => (
        <Route key={path} path={`/${path}`} element={<LW name={path}><Page /></LW>} />
      ))}

      {/* ── Participant pages ── */}
      <Route path="/ParticipantDashboard"  element={<LW name="ParticipantDashboard"><ParticipantDashboard /></LW>} />
      <Route path="/DischargePlan"         element={<LW name="DischargePlan"><DischargePlan /></LW>} />
      <Route path="/EachOneTeachOne"       element={<LW name="EachOneTeachOne"><EachOneTeachOne /></LW>} />
      <Route path="/RecoveryMapFinder"     element={<LW name="RecoveryMapFinder"><RecoveryMapFinder /></LW>} />
      <Route path="/FacilityReviews"       element={<LW name="FacilityReviews"><FacilityReviews /></LW>} />
      <Route path="/TruthAboutRecovery"    element={<LW name="TruthAboutRecovery"><TruthAboutRecovery /></LW>} />
      <Route path="/MySafetyPlan"          element={<LW name="MySafetyPlan"><MySafetyPlan /></LW>} />
      <Route path="/PrivacySettings"       element={<LW name="PrivacySettings"><PrivacySettings /></LW>} />
      <Route path="/NJHousingSearch"       element={<LW name="NJHousingSearch"><NJHousingSearch /></LW>} />
      <Route path="/MentalReset"           element={<LW name="MentalReset"><MentalReset /></LW>} />

      {/* ── Staff-protected pages ── */}
      <Route path="/StaffDashboard"         element={<SW name="StaffDashboard"><StaffDashboard /></SW>} />
      <Route path="/PatientSummaryDashboard" element={<SW name="PatientSummaryDashboard"><PatientSummaryDashboard /></SW>} />
      <Route path="/PayItForward"            element={<LW name="PayItForward"><PayItForward /></LW>} />
      <Route path="/PayItForwardAdmin"       element={<AW name="PayItForwardAdmin"><PayItForwardAdmin /></AW>} />
      <Route path="/TopFiveFocus"             element={<LW name="TopFiveFocus"><TopFiveFocus /></LW>} />
      <Route path="/SupportUserDashboard"      element={<LW name="SupportUserDashboard"><SupportUserDashboard /></LW>} />
      <Route path="/FacilityDashboard"          element={<LW name="FacilityDashboard"><FacilityDashboard /></LW>} />
      <Route path="/ClientConnectionsPage"     element={<LW name="ClientConnectionsPage"><ClientConnectionsPage /></LW>} />
      <Route path="/RecoveryPath"              element={<LW name="RecoveryPath"><RecoveryPath /></LW>} />
      <Route path="/MyFoundation"              element={<LW name="MyFoundation"><MyFoundation /></LW>} />
      <Route path="/InnerCircle"               element={<LW name="InnerCircle"><InnerCircle /></LW>} />
      <Route path="/MyPath"                    element={<LW name="MyPath"><MyPath /></LW>} />
      <Route path="/DailyFlow"                 element={<LW name="DailyFlow"><DailyFlow /></LW>} />
      <Route path="/ResetButton"               element={<LW name="ResetButton"><ResetButton /></LW>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;