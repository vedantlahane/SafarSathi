package com.safarsathi.service;

import com.safarsathi.entity.RiskZone;
import com.safarsathi.repository.RiskZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RiskZoneService {

    private final RiskZoneRepository riskZoneRepository;
    private final SequenceService sequenceService;

    public List<RiskZone> listRiskZones() {
        return riskZoneRepository.findAll();
    }

    public List<RiskZone> listActiveRiskZones() {
        return riskZoneRepository.findByActiveTrue();
    }

    public RiskZone createRiskZone(RiskZone zone) {
        zone.setZoneId((int) sequenceService.getNextId("riskZoneId"));
        if (zone.getRiskLevel() == null) zone.setRiskLevel("MEDIUM");
        if (zone.getActive() == null) zone.setActive(true);
        return riskZoneRepository.save(zone);
    }

    public RiskZone updateRiskZone(int zoneId, RiskZone updates) {
        Optional<RiskZone> opt = riskZoneRepository.findByZoneId(zoneId);
        if (opt.isEmpty()) return null;

        RiskZone zone = opt.get();
        if (updates.getName() != null) zone.setName(updates.getName());
        if (updates.getDescription() != null) zone.setDescription(updates.getDescription());
        if (updates.getCenterLat() != null) zone.setCenterLat(updates.getCenterLat());
        if (updates.getCenterLng() != null) zone.setCenterLng(updates.getCenterLng());
        if (updates.getRadiusMeters() != null) zone.setRadiusMeters(updates.getRadiusMeters());
        if (updates.getRiskLevel() != null) zone.setRiskLevel(updates.getRiskLevel());
        if (updates.getActive() != null) zone.setActive(updates.getActive());

        return riskZoneRepository.save(zone);
    }

    public RiskZone toggleZoneStatus(int zoneId, boolean active) {
        Optional<RiskZone> opt = riskZoneRepository.findByZoneId(zoneId);
        if (opt.isEmpty()) return null;

        RiskZone zone = opt.get();
        zone.setActive(active);
        return riskZoneRepository.save(zone);
    }

    public boolean deleteRiskZone(int zoneId) {
        Optional<RiskZone> opt = riskZoneRepository.findByZoneId(zoneId);
        if (opt.isEmpty()) return false;
        riskZoneRepository.delete(opt.get());
        return true;
    }
}
