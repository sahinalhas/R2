import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Activity } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRecentActivities } from "../hooks/useRecentActivities";
import { ActivityItem } from "./activities/ActivityItem";

const RecentActivities = () => {
  const { data: activities, isLoading } = useRecentActivities();

  return (
    <div className="mb-6 relative">
      {/* Decorative background elements */}
      <div className="absolute -bottom-5 -left-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      
      <div className="relative space-y-1.5 bg-white/60 backdrop-blur-sm rounded-2xl p-2 transition-all duration-300 hover:shadow-md">
        {isLoading ? (
          // Loading indicator
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start p-3 animate-pulse">
              <Skeleton className="h-10 w-10 rounded-xl mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full max-w-[220px] mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          // Activity list
          <div className="space-y-1.5 transform transition-all duration-300">
            {activities.map((activity, index) => (
              <div key={activity.id} className="transform transition-all duration-500" style={{ 
                transitionDelay: `${index * 100}ms`
              }}>
                <ActivityItem activity={activity} />
              </div>
            ))}
          </div>
        ) : (
          // No activities
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white/80 rounded-xl">
            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-200/50 shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
              <div className="relative">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
            <p className="text-gray-700 font-semibold text-lg">Henüz etkinlik kaydı bulunmuyor</p>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">Yeni aktiviteler ekledikçe burada hızlıca görebileceksiniz.</p>
          </div>
        )}
        
        {activities && activities.length > 0 && (
          <div className="pt-3 pb-1 bg-gradient-to-b from-transparent to-white/50 backdrop-blur-sm rounded-b-xl">
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-primary hover:text-primary-700 hover:bg-primary/10 rounded-xl transition-all duration-500 group shadow-sm hover:shadow"
            >
              <span className="relative flex items-center font-medium">
                <span className="group-hover:pr-6 transition-all duration-500">Tüm etkinlikleri görüntüle</span>
                <ChevronRight className="w-4 h-4 absolute opacity-0 -right-4 group-hover:opacity-100 group-hover:right-0 transition-all duration-500" />
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;