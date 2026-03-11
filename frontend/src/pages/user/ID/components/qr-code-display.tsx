import { memo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Shield } from "lucide-react";

interface QRCodeDisplayProps {
    touristId: string;
    size?: number;
}

/** QR code with center logo for the ID card back face */
function QRCodeDisplayInner({ touristId, size = 120 }: QRCodeDisplayProps) {
    const qrData = touristId
        ? `https://yatrax.app/id/${touristId}?emergency=true`
        : "https://yatrax.app";

    return (
        <div className="bg-white p-2 rounded-lg inline-flex items-center justify-center">
            <QRCodeSVG
                value={qrData}
                size={size}
                level="M"
                bgColor="#ffffff"
                fgColor="#1e293b"
            />
            {/* Center logo overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-7 w-7 rounded-md bg-white shadow-sm flex items-center justify-center">
                    <Shield className="h-4 w-4 text-emerald-600" />
                </div>
            </div>
        </div>
    );
}

export const QRCodeDisplay = memo(QRCodeDisplayInner);
