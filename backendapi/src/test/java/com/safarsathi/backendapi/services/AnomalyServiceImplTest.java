package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.Alert;
import com.safarsathi.backendapi.models.RiskZone;
import com.safarsathi.backendapi.models.Tourist;
import com.safarsathi.backendapi.repo.TouristRepository;
import com.safarsathi.backendapi.services.Impl.AnomalyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnomalyServiceImplTest {

    @Mock
    private AlertService alertService;

    @Mock
    private RiskZoneService riskZoneService;

    @Mock
    private TouristRepository touristRepository;

    @InjectMocks
    private AnomalyServiceImpl anomalyService;

    private Tourist tourist;

    @BeforeEach
    void setUp() {
        tourist = new Tourist();
        tourist.setId(UUID.randomUUID());
        tourist.setName("Test Tourist");
        tourist.setCurrentLat(26.1668);
        tourist.setCurrentLng(91.7088);
        tourist.setLastSeen(Instant.now());
        tourist.setSafetyScore(100.0);
    }

    @Test
    void processLocationTriggersRiskZoneAlertAndAdjustsSafetyScore() {
        RiskZone zone = RiskZone.builder()
                .id(42L)
                .name("Test Zone")
                .centerLat(26.1667)
                .centerLng(91.7086)
                .radiusMeters(500.0)
                .riskLevel(RiskZone.RiskLevel.HIGH)
                .active(true)
                .build();

        when(riskZoneService.getActiveZones()).thenReturn(List.of(zone));
        when(touristRepository.save(any(Tourist.class))).thenAnswer(invocation -> invocation.getArgument(0));

        anomalyService.processLocation(tourist, null);

        ArgumentCaptor<Alert> alertCaptor = ArgumentCaptor.forClass(Alert.class);
        verify(alertService).createAlert(alertCaptor.capture());
        verify(touristRepository).save(tourist);

        Alert createdAlert = alertCaptor.getValue();
        assertThat(createdAlert.getAlertType()).isEqualTo("RISK_ZONE");
        assertThat(createdAlert.getTouristId()).isEqualTo(tourist.getId());
        assertThat(tourist.getSafetyScore()).isLessThan(100.0);
    }
}
