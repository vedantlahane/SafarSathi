package com.safarsathi.backendapi.models;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blockchain_logs")
public class BlockchainLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private UUID touristId; // Link to the tourist
    
    @Column(unique = true, nullable = false)
    private String dataHash; // The Tourist's Digital ID Hash
    
    private String transactionId; // Mocked: e.g., "0xabc12345..."
    private Instant timestamp = Instant.now();
    private String status; // SUCCESS_ISSUED_ON_TESTNET | FAILED
    
    // Constructors, Getters, and Setters...
    
    // (Lombok usage is recommended here for brevity in a real project)
    public BlockchainLog() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UUID getTouristId() { return touristId; }
    public void setTouristId(UUID touristId) { this.touristId = touristId; }
    public String getDataHash() { return dataHash; }
    public void setDataHash(String dataHash) { this.dataHash = dataHash; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}