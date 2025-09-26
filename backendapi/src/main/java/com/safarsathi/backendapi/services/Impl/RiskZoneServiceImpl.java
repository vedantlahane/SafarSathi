package com.safarsathi.backendapi.services.Impl;

import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.repo.RiskZoneRepository;
import com.safarsathi.backendapi.services.RiskZoneService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class RiskZoneServiceImpl implements RiskZoneService {

    @Autowired
    private RiskZoneRepository riskZoneRepository;

    @Override
    public RiskZone createZone(RiskZone zone) {
        zone.setId(null);
        return riskZoneRepository.save(zone);
    }

    @Override
    public RiskZone updateZone(Long zoneId, RiskZone zoneUpdates) {
        RiskZone existing = this.getZone(zoneId);
        BeanUtils.copyProperties(zoneUpdates, existing, "id", "createdAt");
        return riskZoneRepository.save(existing);
    }

    @Override
    public void deleteZone(Long zoneId) {
        RiskZone existing = this.getZone(zoneId);
        riskZoneRepository.delete(existing);
    }

    @Override
    public List<RiskZone> getAllZones() {
        return riskZoneRepository.findAll();
    }

    @Override
    public List<RiskZone> getActiveZones() {
        return riskZoneRepository.findByActiveTrue();
    }

    @Override
    public RiskZone getZone(Long id) {
        return riskZoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Risk zone not found"));
    }
}
