package com.safarsathi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "riskzones")
@CompoundIndex(def = "{'centerLat': 1, 'centerLng': 1}")
public class RiskZone {

    private String id;

    @Indexed(unique = true)
    private Integer zoneId;

    private String name;
    private String description;
    private Double centerLat;
    private Double centerLng;
    private Double radiusMeters;

    @Builder.Default
    private String riskLevel = "MEDIUM";

    @Builder.Default
    private Boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
