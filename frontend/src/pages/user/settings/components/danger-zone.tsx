import { memo, useState } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { hapticFeedback } from "@/lib/store";

interface DangerZoneProps {
    onLogout: () => void;
}

function DangerZoneInner({ onLogout }: DangerZoneProps) {
    const [showLogout, setShowLogout] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    return (
        <>
            <div className="space-y-3">
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold gap-2"
                    onClick={() => { hapticFeedback("light"); setShowLogout(true); }}
                >
                    <LogOut className="h-4 w-4" />Sign Out
                </Button>
                <Button
                    variant="outline"
                    className="w-full h-12 rounded-2xl border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium gap-2"
                    onClick={() => { hapticFeedback("light"); setShowDelete(true); }}
                >
                    <Trash2 className="h-4 w-4" />Delete Account
                </Button>
            </div>

            {/* Sign Out Confirmation */}
            <Dialog open={showLogout} onOpenChange={setShowLogout}>
                <DialogContent className="rounded-3xl max-w-[85vw] p-6">
                    <DialogHeader>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                            <LogOut className="h-7 w-7 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Sign Out?</DialogTitle>
                        <DialogDescription className="text-center">Are you sure you want to sign out of your YatraX account?</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => setShowLogout(false)}>Cancel</Button>
                        <Button variant="destructive" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => { onLogout(); setShowLogout(false); }}>Sign Out</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Account Confirmation */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
                <DialogContent className="rounded-3xl max-w-[85vw] p-6">
                    <DialogHeader>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
                            <Trash2 className="h-7 w-7 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-xl">Delete Account?</DialogTitle>
                        <DialogDescription className="text-center">This action is permanent. All your data will be irreversibly deleted.</DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => setShowDelete(false)}>Cancel</Button>
                        <Button variant="destructive" className="flex-1 h-12 rounded-xl font-semibold" onClick={() => setShowDelete(false)}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export const DangerZone = memo(DangerZoneInner);
