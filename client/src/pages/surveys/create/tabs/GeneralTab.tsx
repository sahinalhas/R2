import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SurveyFormValues } from "@/features/surveys/hooks/useSurveyForm";
import { UseFormReturn } from "react-hook-form";

interface GeneralTabProps {
  form: UseFormReturn<SurveyFormValues>;
  onNext: () => void;
}

export const GeneralTab = ({ form, onNext }: GeneralTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Anket Bilgileri</CardTitle>
        <CardDescription>
          Anket ile ilgili temel bilgileri doldurun.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anket Başlığı</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Anket başlığını girin" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Anket hakkında kısa bir açıklama yazın"
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anket Türü</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Anket türünü seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ÖğrenciAnketi">Öğrenci Anketi</SelectItem>
                      <SelectItem value="VeliAnketi">Veli Anketi</SelectItem>
                      <SelectItem value="ÖğretmenAnketi">Öğretmen Anketi</SelectItem>
                      <SelectItem value="RehberlikAnketi">Rehberlik Anketi</SelectItem>
                      <SelectItem value="MemnuniyetAnketi">Memnuniyet Anketi</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAudience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hedef Kitle</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hedef kitleyi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Öğrenci">Öğrenci</SelectItem>
                      <SelectItem value="Veli">Veli</SelectItem>
                      <SelectItem value="Öğretmen">Öğretmen</SelectItem>
                      <SelectItem value="Yönetici">Yönetici</SelectItem>
                      <SelectItem value="Rehberlik">Rehberlik</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Başlangıç Tarihi</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bitiş Tarihi (Opsiyonel)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Aktif Anket</FormLabel>
                  <div className="text-[0.8rem] text-muted-foreground">
                    Anket oluşturulduğunda aktif olsun mu?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="anonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>İsimsiz Anket</FormLabel>
                  <div className="text-[0.8rem] text-muted-foreground">
                    Yanıtlayanların kimliği gizlensin mi?
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="button"
          onClick={onNext}
        >
          İleri
        </Button>
      </CardFooter>
    </Card>
  );
};