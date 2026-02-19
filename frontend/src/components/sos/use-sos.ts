import { useContext } from "react";
import { SOSContext, type SOSContextValue } from "./sos-context";

/** Hook to access SOS state and trigger functions */
export function useSOS(): SOSContextValue {
    return useContext(SOSContext);
}
