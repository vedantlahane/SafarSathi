package com.safarsathi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminDashboardResponse {
    private DashboardStats stats;
    private List<AlertView> alerts;
    private List<TouristSummary> tourists;
    private List<ResponseUnitView> responseUnits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardStats {
        private long criticalAlerts;
        private long activeAlerts;
        private long monitoredTourists;
        private long totalTourists;
    }
}
