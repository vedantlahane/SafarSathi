package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.Tourist;

public interface AnomalyService {

    /**
     * Processes a new location ping to check for rule-based anomalies.
     * @param tourist The updated Tourist object containing the new location.
     * @param accuracy The GPS accuracy of the ping.
     */
    void processLocation(Tourist tourist, Integer accuracy);
}