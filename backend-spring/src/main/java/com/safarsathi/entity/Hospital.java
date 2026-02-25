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
@Document(collection = "hospitals")
@CompoundIndex(def = "{'latitude': 1, 'longitude': 1}")
public class Hospital {

    private String id;

    @Indexed(unique = true)
    private Integer hospitalId;

    private String name;
    private Double latitude;
    private Double longitude;
    private String contact;

    @Builder.Default
    private String type = "hospital";

    @Builder.Default
    private Boolean emergency = false;

    private String city;
    private String district;
    private String state;

    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
