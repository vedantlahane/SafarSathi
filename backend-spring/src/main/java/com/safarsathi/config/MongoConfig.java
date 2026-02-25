package com.safarsathi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables automatic @CreatedDate and @LastModifiedDate population.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
