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
public class AlertView {
    private Integer id;
    private String touristId;
    private String touristName;
    private String alertType;
    private String priority;
    private String status;
    private String description;
    private String timestamp;
    private Double lat;
    private Double lng;
    private String assignedUnit;
}
