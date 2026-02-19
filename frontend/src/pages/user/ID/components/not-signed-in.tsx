import { memo } from "react";
import { CreditCard, Fingerprint, Shield, QrCode, Zap } from "lucide-react";

function NotSignedInInner() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl" />
                <div className="absolute bottom-40 right-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl" />
            </div>
            <div className="relative mb-8">
                <div className="absolute inset-0 animate-ping rounded-3xl bg-primary/20" style={{ animationDuration: "3s" }} />
                <div className="absolute inset-2 animate-ping rounded-2xl bg-primary/10" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl shadow-blue-500/25">
                    <CreditCard className="h-14 w-14 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg border">
                    <Fingerprint className="h-6 w-6 text-primary" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Digital Identity</h1>
            <p className="text-muted-foreground max-w-75 leading-relaxed">Sign in to access your blockchain-verified tourist safety card</p>
            <div className="mt-8 flex flex-col gap-3 w-full max-w-70">
                {[
                    { icon: Shield, color: "emerald", title: "Verified Identity", desc: "Blockchain secured" },
                    { icon: QrCode, color: "blue", title: "Instant Verification", desc: "Scan QR to verify" },
                    { icon: Zap, color: "purple", title: "Works Offline", desc: "Access anytime" },
                ].map(({ icon: Icon, color, title, desc }) => (
                    <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-100`}><Icon className={`h-5 w-5 text-${color}-600`} /></div>
                        <div className="text-left"><p className="text-sm font-medium">{title}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-xs text-muted-foreground">Go to Settings to sign in or create account</p>
        </div>
    );
}

export const NotSignedIn = memo(NotSignedInInner);
