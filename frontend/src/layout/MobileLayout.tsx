import { Tabs,TabsList ,TabsTrigger} from "../components/ui/tabs"


const MobileLayout = () =>{
    return(
        <Tabs>
            <TabsList>
                <TabsTrigger value="home">
                    Home
                </TabsTrigger>
            </TabsList>
        </Tabs>
    )
}

export default MobileLayout;