import { Home as HomeIcon, Map as MapIcon, User, Settings as SettingsIcon } from 'lucide-react'


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
      <div className="h-screen w-full flex flex-col overflow-hidden bg-background">


        <Tabs defaultValue="home" className="flex flex-1 flex-col">



          {/* Desktop Header*/}
          <header className='hidden md:flex items-center justify-between px-6 py-4'>
            <h1 className='text-xl font-bold'>Safar Sathi</h1>
            <TabsList className='bg-transparent'>
              <TabsTrigger value="home">
                <HomeIcon className='h-5 w-5' />
                <span className="text-xs">Home</span>
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapIcon className='h-5 w-5' />
                <span className="text-xs">Map</span>
              </TabsTrigger>
              <TabsTrigger value="identity">
                <User className='h-5 w-5' />
                <span className="text-xs">Identity</span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className='h-5 w-5' />
                <span className="text-xs">Settings</span>
              </TabsTrigger>

            </TabsList>
          </header>
          <div className='flex-1 overflow-y-auto p-2 content-container'>
            <TabsContent value="home">
            <Home />
          </TabsContent>
          <TabsContent value="map">
            <Map />
          </TabsContent>
          <TabsContent value="identity">
            <Identity />
          </TabsContent>
          <TabsContent value="settings">
            <Settings />
          </TabsContent>
          </div>
          


          {/*Mobile Bottom Navigation */}
          <TabsList className='md:hidden flex w-full justify-around m-1'>
            <TabsTrigger value="home">
              <HomeIcon className='h-5 w-5' />
              {/* <span className="text-xs">Home</span> */}
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapIcon className='h-5 w-5' />
              {/* <span className="text-xs">Map</span> */}
            </TabsTrigger>
            <TabsTrigger value="identity">
              <User className='h-5 w-5' />
              {/* <span className="text-xs">Identity</span> */}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className='h-5 w-5' />
              {/* <span className="text-xs">Settings</span> */}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>


    </>
  );
};

export default MobileLayout;
