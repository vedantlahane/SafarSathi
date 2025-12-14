import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import Home from "@/pages/Home";
import Map from "@/pages/Map";
import Identity from "@/pages/Identity";
import Settings from "@/pages/Settings";

const MobileLayout = () => {
  return (
    <>
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <Tabs defaultValue="home" className="flex flex-1">
        <TabsContent value="home">
          <Home />
        </TabsContent>
        <TabsContent value="map">
          <Map />
        </TabsContent>
        <TabsContent value="identity">
          <Identity />
        </TabsContent>
        <TabsContent value="setting">
          <Settings />
        </TabsContent>
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="identity">ID</TabsTrigger>
          <TabsTrigger value="setting">Settings</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

      
    </>
  );
};

export default MobileLayout;
