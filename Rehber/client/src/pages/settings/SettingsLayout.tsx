import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Container } from "@/components/ui/container";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Calendar, 
  BookOpen, 
  Database,
  MessageSquare
} from "lucide-react";
import AppSettings from "./tabs/AppSettings";
import CalendarSettings from "./tabs/CalendarSettings";
import LessonHoursSettingsPage from "./tabs/LessonHoursSettings";
import DataManagementSettings from "./tabs/DataManagementSettings";
import ConversationTopicsSettingsPage from "./tabs/ConversationTopicsSettings";

// Tab değerlerini ve başlıklarını tek bir yerde tanımlayalım
const TAB_CONFIG = [
  { value: "app", label: "Uygulama Ayarları", icon: SettingsIcon, color: "indigo" },
  { value: "calendar", label: "Takvim Ayarları", icon: Calendar, color: "blue" },
  { value: "lessonHours", label: "Ders Saatleri", icon: BookOpen, color: "green" },
  { value: "conversationTopics", label: "Görüşme Konuları", icon: MessageSquare, color: "purple" },
  { value: "data", label: "Veri Yönetimi", icon: Database, color: "amber" }
];

const SettingsLayout = () => {
  const [location, setLocation] = useLocation();
  const [_, params] = useRoute("/ayarlar/:tab");
  const currentTab = params?.tab || "app";
  
  // Sekmeyi değiştirdiğimizde URL'i güncelleyelim
  const handleTabChange = (value: string) => {
    setLocation(`/ayarlar/${value}`);
  };

  return (
    <Container>
      <div className="max-w-5xl mx-auto py-8">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
            <p className="text-gray-500 mt-1">
              Uygulama ayarlarınızı, tercihlerinizi ve veri yönetimini buradan yapabilirsiniz.
            </p>
          </div>
          
          <Tabs 
            value={currentTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="bg-white/75 backdrop-blur-sm w-full justify-start p-1 rounded-xl shadow-sm border border-gray-100">
              {TAB_CONFIG.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.value}
                    value={tab.value} 
                    className={`data-[state=active]:bg-${tab.color}-500/10 data-[state=active]:text-${tab.color}-500`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <TabsContent value="app">
              <AppSettings />
            </TabsContent>
            
            <TabsContent value="calendar">
              <CalendarSettings />
            </TabsContent>
            
            <TabsContent value="lessonHours">
              <LessonHoursSettingsPage />
            </TabsContent>
            
            <TabsContent value="conversationTopics">
              <ConversationTopicsSettingsPage />
            </TabsContent>
            
            <TabsContent value="data">
              <DataManagementSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>
  );
};

export default SettingsLayout;