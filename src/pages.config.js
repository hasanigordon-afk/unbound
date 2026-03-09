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
import AftercareMonitoring from './pages/AftercareMonitoring';
import ClientProgress from './pages/ClientProgress';
import ClientSettings from './pages/ClientSettings';
import Community from './pages/Community';
import ComplianceReports from './pages/ComplianceReports';
import ContentfulSetup from './pages/ContentfulSetup';
import CounselorDashboard from './pages/CounselorDashboard';
import CounselorMessaging from './pages/CounselorMessaging';
import CounselorPortal from './pages/CounselorPortal';
import DailyCheckIn from './pages/DailyCheckIn';
import Discover from './pages/Discover';
import FacilityDashboard from './pages/FacilityDashboard';
import FacilitySignup from './pages/FacilitySignup';
import FamilyView from './pages/FamilyView';
import FindHelpNow from './pages/FindHelpNow';
import ForwardPlan from './pages/ForwardPlan';
import GoalBoard from './pages/GoalBoard';
import Goals from './pages/Goals';
import Home from './pages/Home';
import IdentityBridge from './pages/IdentityBridge';
import Journal from './pages/Journal';
import Lifeline from './pages/Lifeline';
import Meditation from './pages/Meditation';
import Meetings from './pages/Meetings';
import MentorOnboarding from './pages/MentorOnboarding';
import Mentors from './pages/Mentors';
import Messages from './pages/Messages';
import ModerationQueue from './pages/ModerationQueue';
import MyGoals from './pages/MyGoals';
import NearbyResources from './pages/NearbyResources';
import Onboarding from './pages/Onboarding';
import ParticipantDashboard from './pages/ParticipantDashboard';
import ParticipantMessages from './pages/ParticipantMessages';
import PatientDashboard from './pages/PatientDashboard';
import PlatformAdmin from './pages/PlatformAdmin';
import PrivacyControls from './pages/PrivacyControls';
import ProbationDashboard from './pages/ProbationDashboard';
import ProbationOfficerDashboard from './pages/ProbationOfficerDashboard';
import ProfessionalPortal from './pages/ProfessionalPortal';
import Profile from './pages/Profile';
import ReintegrationMap from './pages/ReintegrationMap';
import ResourceDirectory from './pages/ResourceDirectory';
import Resources from './pages/Resources';
import ResourcesNearYou from './pages/ResourcesNearYou';
import RoleSelect from './pages/RoleSelect';
import SavedResources from './pages/SavedResources';
import Splash from './pages/Splash';
import StateManagement from './pages/StateManagement';
import SupportChat from './pages/SupportChat';
import UrgentHelp from './pages/UrgentHelp';
import utils from './pages/utils';
import CravingControlCenter from './pages/CravingControlCenter';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AftercareMonitoring": AftercareMonitoring,
    "ClientProgress": ClientProgress,
    "ClientSettings": ClientSettings,
    "Community": Community,
    "ComplianceReports": ComplianceReports,
    "ContentfulSetup": ContentfulSetup,
    "CounselorDashboard": CounselorDashboard,
    "CounselorMessaging": CounselorMessaging,
    "CounselorPortal": CounselorPortal,
    "DailyCheckIn": DailyCheckIn,
    "Discover": Discover,
    "FacilityDashboard": FacilityDashboard,
    "FacilitySignup": FacilitySignup,
    "FamilyView": FamilyView,
    "FindHelpNow": FindHelpNow,
    "ForwardPlan": ForwardPlan,
    "GoalBoard": GoalBoard,
    "Goals": Goals,
    "Home": Home,
    "IdentityBridge": IdentityBridge,
    "Journal": Journal,
    "Lifeline": Lifeline,
    "Meditation": Meditation,
    "Meetings": Meetings,
    "MentorOnboarding": MentorOnboarding,
    "Mentors": Mentors,
    "Messages": Messages,
    "ModerationQueue": ModerationQueue,
    "MyGoals": MyGoals,
    "NearbyResources": NearbyResources,
    "Onboarding": Onboarding,
    "ParticipantDashboard": ParticipantDashboard,
    "ParticipantMessages": ParticipantMessages,
    "PatientDashboard": PatientDashboard,
    "PlatformAdmin": PlatformAdmin,
    "PrivacyControls": PrivacyControls,
    "ProbationDashboard": ProbationDashboard,
    "ProbationOfficerDashboard": ProbationOfficerDashboard,
    "ProfessionalPortal": ProfessionalPortal,
    "Profile": Profile,
    "ReintegrationMap": ReintegrationMap,
    "ResourceDirectory": ResourceDirectory,
    "Resources": Resources,
    "ResourcesNearYou": ResourcesNearYou,
    "RoleSelect": RoleSelect,
    "SavedResources": SavedResources,
    "Splash": Splash,
    "StateManagement": StateManagement,
    "SupportChat": SupportChat,
    "UrgentHelp": UrgentHelp,
    "utils": utils,
    "CravingControlCenter": CravingControlCenter,
}

export const pagesConfig = {
    mainPage: "AftercareMonitoring",
    Pages: PAGES,
    Layout: __Layout,
};