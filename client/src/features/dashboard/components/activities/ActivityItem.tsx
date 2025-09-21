import React from "react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { MessageSquare, ClipboardList, UserPlus, Calendar } from "lucide-react";
import { Activity } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  // Select icon and color based on activity type
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'Yeni görüşme':
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'text-indigo-500',
          bgGradient: 'from-indigo-500 to-blue-500',
          bgLight: 'bg-indigo-50',
          border: 'border-indigo-100'
        };
      case 'Yeni rapor':
      case 'Rapor güncelleme':
        return {
          icon: <ClipboardList className="w-4 h-4" />,
          color: 'text-emerald-500',
          bgGradient: 'from-emerald-500 to-green-500',
          bgLight: 'bg-emerald-50',
          border: 'border-emerald-100'
        };
      case 'Yeni öğrenci':
      case 'Öğrenci güncelleme':
        return {
          icon: <UserPlus className="w-4 h-4" />,
          color: 'text-purple-500',
          bgGradient: 'from-purple-500 to-fuchsia-500',
          bgLight: 'bg-purple-50',
          border: 'border-purple-100'
        };
      case 'Yeni randevu':
      case 'Randevu güncelleme':
        return {
          icon: <Calendar className="w-4 h-4" />,
          color: 'text-blue-500',
          bgGradient: 'from-blue-500 to-sky-400',
          bgLight: 'bg-blue-50',
          border: 'border-blue-100'
        };
      default:
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          color: 'text-primary',
          bgGradient: 'from-primary to-primary/80',
          bgLight: 'bg-primary/5',
          border: 'border-primary/10'
        };
    }
  };
  
  const { icon, color, bgGradient, bgLight, border } = getActivityIcon();
  
  // Format date as "X time ago"
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: tr
  });

  return (
    <div className="flex items-start p-3.5 rounded-xl transition-all duration-500 hover:bg-white/90 group backdrop-blur-sm hover:shadow-sm">
      <div className={`
        relative flex-shrink-0
        w-10 h-10 flex items-center justify-center rounded-xl
        text-white overflow-hidden
        shadow-md group-hover:shadow-lg
        transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3
      `}>
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-90`}></div>
        {/* Glow effect */}
        <div className="absolute -inset-3 bg-white/20 rotate-45 translate-x-12 -translate-y-12 opacity-0 group-hover:opacity-100 group-hover:translate-x-16 group-hover:-translate-y-16 transition-all duration-1000"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/10 transition-opacity duration-500"></div>
        <div className="relative z-10">
          {icon}
        </div>
      </div>
      
      <div className="ml-4 flex-1 transform transition-transform duration-500 group-hover:translate-x-1">
        <p className="text-sm text-gray-800 font-medium line-clamp-2 group-hover:text-gray-900 transition-colors duration-300">{activity.description}</p>
        <div className="flex items-center mt-1.5">
          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 animate-pulse bg-gradient-to-r ${bgGradient}`}></span>
          <p className="text-xs text-gray-500 font-medium">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
};