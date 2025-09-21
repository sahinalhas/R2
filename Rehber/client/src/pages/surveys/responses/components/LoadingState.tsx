import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const LoadingState = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-8 w-80 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};