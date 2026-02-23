// src/pages/user/map/components/map-icons.ts
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export const PoliceIcon = L.divIcon({
  html: `<div class="bg-blue-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export const HospitalIcon = L.divIcon({
  html: `<div class="bg-rose-600 p-1.5 rounded-full border-2 border-white shadow-lg text-white flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 2v4"/><path d="M16 2v4"/><path d="M12 10v6"/><path d="M9 13h6"/>
      <rect x="4" y="6" width="16" height="16" rx="2"/>
    </svg>
  </div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export function createUserIcon(heading: number | null): L.DivIcon {
  const arrow =
    heading !== null
      ? `<div class="absolute -top-2 left-1/2 -translate-x-1/2" style="transform:translateX(-50%) rotate(${heading}deg)">
           <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-blue-600"></div>
         </div>`
      : "";
  return L.divIcon({
    html: `<div class="relative">
      <div class="absolute -inset-3 bg-blue-500 rounded-full animate-ping opacity-20"></div>
      <div class="absolute -inset-1.5 bg-blue-400 rounded-full opacity-30"></div>
      <div class="relative bg-blue-600 p-2 rounded-full border-[3px] border-white shadow-xl">
        <div class="w-3 h-3 bg-white rounded-full"></div>
      </div>
      ${arrow}
    </div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export const DestinationIcon = L.divIcon({
  html: `<div class="relative">
    <div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="#10b981"/>
      </svg>
    </div>
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
