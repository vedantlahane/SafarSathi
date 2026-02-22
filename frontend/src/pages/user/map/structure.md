src/pages/user/map/
├── Map.tsx                          ← Composition root (~120 lines)
├── types.ts                         ← All interfaces + utility functions
├── constants.ts                     ← Tile URLs, defaults, weights
├── hooks/
│   ├── use-map-data.ts              ← All data, GPS, geofence, network
│   └── use-map-navigation.ts        ← Destination, routes, safe scoring
└── components/
    ├── map-icons.ts                 ← Leaflet DivIcon factories
    ├── fly-to-location.tsx          ← Animated map pan
    ├── search-control.tsx           ← Debounced search with abort
    ├── stats-pill.tsx               ← Zone/station/hospital counts
    ├── map-controls.tsx             ← Zoom, locate, compass
    ├── zone-overlay.tsx             ← Risk zone circles + tooltips
    ├── station-markers.tsx          ← Police markers with ETA
    ├── hospital-markers.tsx         ← Hospital markers with ETA     [NEW]
    ├── user-marker.tsx              ← GPS dot + accuracy ring        [NEW]
    ├── destination-marker.tsx       ← Destination pin
    ├── route-lines.tsx              ← Safe/fast/alt route polylines  [NEW]
    ├── route-info-panel.tsx         ← Route comparison card          [NEW]
    ├── bottom-cards.tsx             ← Destination/station/hospital bars
    ├── layers-sheet.tsx             ← Full layer + filter controls
    ├── zone-dialog.tsx              ← Zone detail with distance
    ├── offline-map-banner.tsx       ← Offline warning                [NEW]
    └── map-loading.tsx              ← Skeleton/loading state         [NEW]