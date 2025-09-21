import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, Phone, BadgeCheck, ImagePlus } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    profilePhoto: ""
  });

  // Kullanıcı bilgilerini getir
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/users/1/settings/personal");
        
        if (response.ok) {
          const data = await response.json();
          const profileData = {
            fullName: data.find((item: any) => item.settingKey === "fullName")?.settingValue || "",
            title: data.find((item: any) => item.settingKey === "title")?.settingValue || "",
            email: data.find((item: any) => item.settingKey === "email")?.settingValue || "",
            phone: data.find((item: any) => item.settingKey === "phone")?.settingValue || "",
            profilePhoto: data.find((item: any) => item.settingKey === "profilePhoto")?.settingValue || ""
          };
          
          setPersonalInfo(profileData);
        }
      } catch (error) {
        console.error("Kullanıcı bilgileri alınırken hata:", error);
        toast({
          title: "Hata",
          description: "Kullanıcı bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [toast]);

  // Profil bilgilerini kaydet
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Her bir ayarı ayrı bir istek olarak gönder
      const settings = [
        { settingKey: "fullName", settingValue: personalInfo.fullName },
        { settingKey: "title", settingValue: personalInfo.title },
        { settingKey: "email", settingValue: personalInfo.email },
        { settingKey: "phone", settingValue: personalInfo.phone },
        { settingKey: "profilePhoto", settingValue: personalInfo.profilePhoto }
      ];
      
      const savePromises = settings.map(setting => 
        fetch("/api/users/1/settings/personal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(setting)
        })
      );
      
      await Promise.all(savePromises);
      
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz başarıyla güncellendi.",
        variant: "default"
      });
    } catch (error) {
      console.error("Profil kaydedilirken hata:", error);
      toast({
        title: "Hata",
        description: "Profil bilgileriniz kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <div className="py-10">
        <h1 className="text-3xl font-bold mb-2">Profilim</h1>
        <p className="text-muted-foreground mb-6">Kişisel bilgilerinizi buradan düzenleyebilirsiniz.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol kısım - Profil kartı */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/80 to-primary h-32 relative">
                <div className="absolute left-0 right-0 -bottom-16 flex justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-white dark:bg-gray-900">
                    {personalInfo.profilePhoto ? (
                      <img 
                        src={personalInfo.profilePhoto} 
                        alt="Profil Fotoğrafı" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <CardContent className="pt-20 pb-6 text-center">
                {isLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{personalInfo.fullName}</h2>
                    <p className="text-muted-foreground mt-1">{personalInfo.title}</p>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        <span className="text-sm text-muted-foreground">{personalInfo.email}</span>
                      </div>
                      {personalInfo.phone && (
                        <div className="flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">{personalInfo.phone}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-8">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        <BadgeCheck className="w-3 h-3 mr-1" />
                        Rehberlik Öğretmeni
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sağ kısım - Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profil Bilgileri</CardTitle>
                <CardDescription>
                  Kişisel bilgilerinizi güncelleyin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Ad Soyad</Label>
                      <Input 
                        id="fullName" 
                        name="fullName"
                        placeholder="Adınız Soyadınız" 
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Ünvan</Label>
                      <Input 
                        id="title" 
                        name="title"
                        placeholder="Ünvanınız" 
                        value={personalInfo.title}
                        onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        placeholder="E-posta adresiniz" 
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        placeholder="Telefon numaranız" 
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="profilePhoto">Profil Fotoğrafı URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="profilePhoto" 
                        name="profilePhoto"
                        placeholder="Profil fotoğrafı URL adresi" 
                        value={personalInfo.profilePhoto}
                        onChange={(e) => setPersonalInfo({...personalInfo, profilePhoto: e.target.value})}
                        disabled={isLoading}
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                        onClick={() => {
                          // Todo: Profil fotoğrafı yükleme işlemi eklenebilir
                          toast({
                            title: "Bilgi",
                            description: "Profil fotoğrafı yükleme özelliği yakında eklenecektir.",
                            variant: "default"
                          });
                        }}
                      >
                        <ImagePlus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Görsel bir URL adresi girin veya dosya yükleyin.</p>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Kaydediliyor...
                        </>
                      ) : "Bilgileri Kaydet"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Profile;