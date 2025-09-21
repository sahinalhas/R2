// Re-export components from the dashboard feature
import Calendar from "./components/Calendar";
import RecentActivities from "./components/RecentActivities";
import StatCards from "./components/StatCards";
import TodayAppointments from "./components/TodayAppointments";
import QuickActions from "./components/QuickActions";

// Re-export hooks
import { getActivityIcon } from "./hooks/useActivities";
import { useRecentActivities } from "./hooks/useRecentActivities";

// Export all components and hooks
export {
  // Components
  Calendar,
  RecentActivities,
  StatCards,
  TodayAppointments,
  QuickActions,
  
  // Hooks
  getActivityIcon,
  useRecentActivities
};