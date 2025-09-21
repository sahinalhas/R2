import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";

/**
 * Hook to fetch the most recent activities
 * @returns Query result containing recent activities sorted by date
 */
export const useRecentActivities = () => {
  return useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    select: (activities: Activity[]) => {
      // Sort by date (newest to oldest)
      return [...activities].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5); // Last 5 activities
    },
    staleTime: 60 * 1000, // 1 minute
  });
};