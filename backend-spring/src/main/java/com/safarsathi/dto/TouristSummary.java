package com.safarsathi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TouristSummary {
    private String id;
    private String name;
    private String status;
    private Double safetyScore;
    private String lastPing;
    private Double lat;
    private Double lng;
    private String lastKnownArea;
}
