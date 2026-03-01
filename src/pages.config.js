/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminResourceManager from './pages/AdminResourceManager';
import AdminResources from './pages/AdminResources';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Community from './pages/Community';
import ComplianceReports from './pages/ComplianceReports';
import ContentfulSetup from './pages/ContentfulSetup';
import CounselorPortal from './pages/CounselorPortal';
import DailyCheckIn from './pages/DailyCheckIn';
import Discover from './pages/Discover';
import FacilityDashboard from './pages/FacilityDashboard';
import FacilitySignup from './pages/FacilitySignup';
import ForwardPlan from './pages/ForwardPlan';
import Goals from './pages/Goals';
import Home from './pages/Home';
import IdentityBridge from './pages/IdentityBridge';
import Journal from './pages/Journal';
import Meditation from './pages/Meditation';
import MentorOnboarding from './pages/MentorOnboarding';
import Mentors from './pages/Mentors';
import Messages from './pages/Messages';
import Onboarding from './pages/Onboarding';
import ParticipantDashboard from './pages/ParticipantDashboard';
import ParticipantMessages from './pages/ParticipantMessages';
import PlatformAdmin from './pages/PlatformAdmin';
import Profile from './pages/Profile';
import ReintegrationMap from './pages/ReintegrationMap';
import ResourceDirectory from './pages/ResourceDirectory';
import Resources from './pages/Resources';
import SavedResources from './pages/SavedResources';
import Splash from './pages/Splash';
import StateManagement from './pages/StateManagement';
import SupportChat from './pages/SupportChat';
import utils from './pages/utils';
import Lifeline from './pages/Lifeline';
import Meetings from './pages/Meetings';
import PrivacyControls from './pages/PrivacyControls';
import ModerationQueue from './pages/ModerationQueue';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminResourceManager": AdminResourceManager,
    "AdminResources": AdminResources,
    "AnalyticsDashboard": AnalyticsDashboard,
    "Community": Community,
    "ComplianceReports": ComplianceReports,
    "ContentfulSetup": ContentfulSetup,
    "CounselorPortal": CounselorPortal,
    "DailyCheckIn": DailyCheckIn,
    "Discover": Discover,
    "FacilityDashboard": FacilityDashboard,
    "FacilitySignup": FacilitySignup,
    "ForwardPlan": ForwardPlan,
    "Goals": Goals,
    "Home": Home,
    "IdentityBridge": IdentityBridge,
    "Journal": Journal,
    "Meditation": Meditation,
    "MentorOnboarding": MentorOnboarding,
    "Mentors": Mentors,
    "Messages": Messages,
    "Onboarding": Onboarding,
    "ParticipantDashboard": ParticipantDashboard,
    "ParticipantMessages": ParticipantMessages,
    "PlatformAdmin": PlatformAdmin,
    "Profile": Profile,
    "ReintegrationMap": ReintegrationMap,
    "ResourceDirectory": ResourceDirectory,
    "Resources": Resources,
    "SavedResources": SavedResources,
    "Splash": Splash,
    "StateManagement": StateManagement,
    "SupportChat": SupportChat,
    "utils": utils,
    "Lifeline": Lifeline,
    "Meetings": Meetings,
    "PrivacyControls": PrivacyControls,
    "ModerationQueue": ModerationQueue,
}

export const pagesConfig = {
    mainPage: "AdminResources",
    Pages: PAGES,
    Layout: __Layout,
};