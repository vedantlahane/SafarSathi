package com.safarsathi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "alerts")
public class Alert {

    private String id;

    @Indexed(unique = true)
    private Integer alertId;

    @Indexed
    private String touristId;

    private String alertType;

    @Builder.Default
    private String priority = "MEDIUM";

    @Builder.Default
    private String status = "OPEN";

    private String message;
    private Double latitude;
    private Double longitude;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
