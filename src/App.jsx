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
import Momentum from './pages/Momentum';
import BuildYourself from './pages/BuildYourself';
import LearnRecovery from './pages/LearnRecovery';
import Lifeline from './pages/Lifeline';
import FutureYou from './pages/FutureYou';
import SoberCalculator from './pages/SoberCalculator';
import AftercarePlan from './pages/AftercarePlan';
import AftercarePlanBuilder from './pages/AftercarePlanBuilder';
import Splash from './pages/Splash';
import HowDidYouDoIt from './pages/HowDidYouDoIt';
import SubmitTestimonial from './pages/SubmitTestimonial';
import TestimonialDetail from './pages/TestimonialDetail';
import AhHaMoment from './pages/AhHaMoment';
import SubmitAhHa from './pages/SubmitAhHa';
import AhHaDetail from './pages/AhHaDetail';
import AftercarePlanView from './pages/AftercarePlanView';
import HelpHub from './pages/HelpHub';
import RecoveryRoadmap from './pages/RecoveryRoadmap';
import MyAhHaStories from './pages/MyAhHaStories';
import AhHaCommunity from './pages/AhHaCommunity';
import HopeHub from './pages/HopeHub';
import HealingHub from './pages/HealingHub';
import Donate from './pages/Donate';
import NotificationSettings from './pages/NotificationSettings';
import CampaignAdmin from './pages/CampaignAdmin';
import SubscriptionPrompt from '@/components/subscription/SubscriptionPrompt';

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
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#F7F3EE" }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(184,130,58,0.15)",
          borderTopColor: "#B8823A",
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
    <>
    <SubscriptionPrompt />
    <Routes>
      {/* ── Splash ── */}
      <Route path="/splash" element={<Splash />} />

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
      <Route path="/Momentum"                  element={<LW name="Momentum"><Momentum /></LW>} />
      <Route path="/BuildYourself"             element={<LW name="BuildYourself"><BuildYourself /></LW>} />
      <Route path="/LearnRecovery"             element={<LW name="LearnRecovery"><LearnRecovery /></LW>} />
      <Route path="/Lifeline"                  element={<LW name="Lifeline"><Lifeline /></LW>} />
      <Route path="/FutureYou"                 element={<LW name="FutureYou"><FutureYou /></LW>} />
      <Route path="/SoberCalculator"            element={<LW name="SoberCalculator"><SoberCalculator /></LW>} />
      <Route path="/AftercarePlan"              element={<LW name="AftercarePlan"><AftercarePlan /></LW>} />
      <Route path="/AftercarePlanBuilder"       element={<LW name="AftercarePlanBuilder"><AftercarePlanBuilder /></LW>} />
      <Route path="/AftercarePlanView"          element={<LW name="AftercarePlanView"><AftercarePlanView /></LW>} />
      <Route path="/HowDidYouDoIt"              element={<LW name="HowDidYouDoIt"><HowDidYouDoIt /></LW>} />
      <Route path="/Splash"                      element={<Splash />} />
      <Route path="/SubmitTestimonial"          element={<LW name="SubmitTestimonial"><SubmitTestimonial /></LW>} />
      <Route path="/TestimonialDetail"          element={<LW name="TestimonialDetail"><TestimonialDetail /></LW>} />
      <Route path="/AhHaMoment"                 element={<LW name="AhHaMoment"><AhHaMoment /></LW>} />
      <Route path="/SubmitAhHa"                 element={<LW name="SubmitAhHa"><SubmitAhHa /></LW>} />
      <Route path="/AhHaDetail"                 element={<LW name="AhHaDetail"><AhHaDetail /></LW>} />
      <Route path="/HelpHub"                    element={<LW name="HelpHub"><HelpHub /></LW>} />
      <Route path="/HopeHub"                    element={<LW name="HopeHub"><HopeHub /></LW>} />
      <Route path="/HealingHub"                 element={<LW name="HealingHub"><HealingHub /></LW>} />
      <Route path="/RecoveryRoadmap"             element={<LW name="RecoveryRoadmap"><RecoveryRoadmap /></LW>} />
      <Route path="/MyAhHaStories"               element={<LW name="MyAhHaStories"><MyAhHaStories /></LW>} />
      <Route path="/AhHaCommunity"               element={<LW name="AhHaCommunity"><AhHaCommunity /></LW>} />
      <Route path="/Donate"                      element={<LW name="Donate"><Donate /></LW>} />
      <Route path="/NotificationSettings"        element={<LW name="NotificationSettings"><NotificationSettings /></LW>} />
      <Route path="/CampaignAdmin"               element={<AW name="CampaignAdmin"><CampaignAdmin /></AW>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </>
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