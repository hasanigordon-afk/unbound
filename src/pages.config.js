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
import FacilityDashboard from './pages/FacilityDashboard';
import FacilitySignup from './pages/FacilitySignup';
import Home from './pages/Home';
import MentorOnboarding from './pages/MentorOnboarding';
import Mentors from './pages/Mentors';
import Messages from './pages/Messages';
import Onboarding from './pages/Onboarding';
import PlatformAdmin from './pages/PlatformAdmin';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import SavedResources from './pages/SavedResources';
import utils from './pages/utils';
import Achievements from './pages/Achievements';
import __Layout from './Layout.jsx';


export const PAGES = {
    "FacilityDashboard": FacilityDashboard,
    "FacilitySignup": FacilitySignup,
    "Home": Home,
    "MentorOnboarding": MentorOnboarding,
    "Mentors": Mentors,
    "Messages": Messages,
    "Onboarding": Onboarding,
    "PlatformAdmin": PlatformAdmin,
    "Profile": Profile,
    "Resources": Resources,
    "SavedResources": SavedResources,
    "utils": utils,
    "Achievements": Achievements,
}

export const pagesConfig = {
    mainPage: "Onboarding",
    Pages: PAGES,
    Layout: __Layout,
};