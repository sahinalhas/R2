import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  onNavigateBack: () => void;
}

export const ErrorState = ({ onNavigateBack }: ErrorStateProps) => {
  return (
    <div className="container mx-auto py-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">Anket bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.</p>
          <Button onClick={onNavigateBack} variant="outline" className="mt-4 mx-auto">
            Anketlere Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};