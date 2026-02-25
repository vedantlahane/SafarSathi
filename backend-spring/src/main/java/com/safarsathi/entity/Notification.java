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
@Document(collection = "notifications")
@CompoundIndex(def = "{'touristId': 1, 'createdAt': -1}")
public class Notification {

    private String id;

    @Indexed(unique = true)
    private Integer notificationId;

    @Indexed
    private String touristId;

    private String title;
    private String message;

    @Builder.Default
    private String type = "system";

    @Builder.Default
    private String sourceTab = "home";

    @Builder.Default
    private Boolean read = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
