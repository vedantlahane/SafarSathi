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
public class ResponseUnitView {
    private String id;
    private String name;
    private String status;
    private String type;
    private String city;
    private String district;
    private String state;
    private Double lat;
    private Double lng;
    private Integer etaMinutes;
    private String contactNumber;
}
