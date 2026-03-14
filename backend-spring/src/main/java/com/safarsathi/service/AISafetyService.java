package com.safarsathi.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class AISafetyService {

    private static final Logger logger = LoggerFactory.getLogger(AISafetyService.class);
    private static final String PREDICT_SAFETY_URL =
            "http://localhost:5000/predict-safety?lat={lat}&lon={lon}&hour={hour}";

    private final RestTemplateBuilder restTemplateBuilder;

    public double getRealTimeSafetyScore(double lat, double lon, int hour) {
        try {
            RestTemplate restTemplate = restTemplateBuilder.build();
            JsonNode response = restTemplate.getForObject(
                    PREDICT_SAFETY_URL,
                    JsonNode.class,
                    lat,
                    lon,
                    hour
            );

            Double dangerScore = extractDangerScore(response);
            if (dangerScore != null) {
                return dangerScore;
            }

            logger.warn("Python AI API returned an invalid response for lat={}, lon={}, hour={}", lat, lon, hour);
        } catch (Exception ex) {
            logger.warn("Python AI API unavailable. Returning default safety score for lat={}, lon={}, hour={}",
                    lat, lon, hour, ex);
        }

        return 0.0;
    }

    private Double extractDangerScore(JsonNode response) {
        if (response == null) {
            return null;
        }

        if (response.has("dangerScore") && !response.get("dangerScore").isNull()) {
            return response.get("dangerScore").asDouble();
        }

        if (response.has("danger_score") && !response.get("danger_score").isNull()) {
            return response.get("danger_score").asDouble();
        }

        JsonNode dataNode = response.get("data");
        if (dataNode != null && dataNode.isObject()) {
            if (dataNode.has("dangerScore") && !dataNode.get("dangerScore").isNull()) {
                return dataNode.get("dangerScore").asDouble();
            }
            if (dataNode.has("danger_score") && !dataNode.get("danger_score").isNull()) {
                return dataNode.get("danger_score").asDouble();
            }
        }

        return null;
    }
}
