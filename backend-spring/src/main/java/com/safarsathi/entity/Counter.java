package com.safarsathi.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Auto-incrementing counter collection for generating sequential IDs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "counters")
public class Counter {

    @Id
    private String id;

    private long seq;
}
