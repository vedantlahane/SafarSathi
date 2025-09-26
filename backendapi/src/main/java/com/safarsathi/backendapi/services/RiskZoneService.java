package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.RiskZone;

import java.util.List;

public interface RiskZoneService {

    RiskZone createZone(RiskZone zone);

    RiskZone updateZone(Long zoneId, RiskZone zoneUpdates);

    void deleteZone(Long zoneId);

    List<RiskZone> getAllZones();

    List<RiskZone> getActiveZones();

    RiskZone getZone(Long id);
}
