package com.safarsathi.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "blockchainlogs")
public class BlockchainLog {

    private String id;

    @Indexed(unique = true)
    private Integer logId;

    @Indexed
    private String touristId;

    private String transactionId;

    @Builder.Default
    private String status = "PENDING";

    private String dataHash;

    @CreatedDate
    private Instant createdAt;
}
