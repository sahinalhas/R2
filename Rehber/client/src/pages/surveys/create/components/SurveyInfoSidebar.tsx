import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const SurveyInfoSidebar = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-lg mb-3">Anket Türleri</h3>
        <p className="text-sm text-gray-500 mb-4">
          Anket türünü seçerken hedef kitlenizi göz önünde bulundurun.
        </p>
        <ul className="text-sm text-gray-500 space-y-2 mb-6">
          <li className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>Öğrenci Anketi: Öğrencilere yönelik</span>
          </li>
          <li className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>Veli Anketi: Velilere yönelik</span>
          </li>
          <li className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>Öğretmen Anketi: Öğretmenlere yönelik</span>
          </li>
          <li className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>Rehberlik Anketi: Rehberlik için özel</span>
          </li>
          <li className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>Memnuniyet Anketi: Geri bildirim anketleri</span>
          </li>
        </ul>

        <Separator />

        <div className="mt-6">
          <h3 className="font-medium text-sm">İpuçları</h3>
          <ul className="text-sm text-gray-500 mt-1 space-y-1">
            <li className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span>Kısa ve anlaşılır sorular hazırlayın</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span>Farklı soru türleri kullanın</span>
            </li>
            <li className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              <span>İsimsiz anketlerde daha dürüst yanıtlar alırsınız</span>
            </li>
          </ul>
        </div>

        <Separator className="my-6" />

        <div>
          <h3 className="font-medium text-sm">Anket Dağıtımı</h3>
          <p className="text-sm text-gray-500 mt-1">
            Anketinizi oluşturduktan sonra öğrenci veya velilere atayabilirsiniz. 
            Anket sonuçlarını analiz etmek için yanıtlar sayfasını kullanabilirsiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};