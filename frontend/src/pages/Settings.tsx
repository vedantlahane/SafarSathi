import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
    return (
        <div className="space-y-3 text-[13px]">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Settings</CardTitle>
                    <CardDescription className="text-[12px]">Lightweight controls for the prototype.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-[12px] text-muted-foreground">
                    <p>Future items: offline cache status, simulation toggles, data export.</p>
                    <Button size="sm" variant="secondary" className="text-[12px]">
                        Download logs (coming soon)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Settings;