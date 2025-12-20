import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Identity = () => {
    return (
        <div className="space-y-3 text-[13px]">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Digital ID</CardTitle>
                    <CardDescription className="text-[12px]">Coming soon: QR, verification, and blockchain log.</CardDescription>
                </CardHeader>
                <CardContent className="text-[12px] text-muted-foreground">
                    This screen will show your tourist ID, validity, and a scannable code once backend wiring is complete.
                </CardContent>
            </Card>
        </div>
    );
};

export default Identity;