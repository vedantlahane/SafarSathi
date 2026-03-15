package com.safarsathi.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.SocketTimeoutException;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AISafetyService {

    private static final Logger logger = LoggerFactory.getLogger(AISafetyService.class);

    @Value("${AI_API_URL:http://localhost:5000}")
    private String aiApiUrl;

    private final RestTemplateBuilder restTemplateBuilder;

    public double getRealTimeSafetyScore(double lat, double lon, int hour) {
        try {
            String url = aiApiUrl + "/predict-safety?lat={lat}&lon={lon}&hour={hour}";
            RestTemplate restTemplate = restTemplateBuilder
                    .connectTimeout(Duration.ofMillis(5000))
                    .readTimeout(Duration.ofMillis(5000))
                    .build();
            JsonNode response = restTemplate.getForObject(
                    url,
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
        } catch (ResourceAccessException ex) {
            if (ex.getCause() instanceof SocketTimeoutException) {
                logger.warn("Python AI API timed out (5s). Returning default safety score for lat={}, lon={}, hour={}", lat, lon, hour);
            } else {
                logger.warn("Python AI API unreachable. Returning default safety score for lat={}, lon={}, hour={}", lat, lon, hour, ex);
            }
        } catch (Exception ex) {
            logger.warn("Python AI API error. Returning default safety score for lat={}, lon={}, hour={}", lat, lon, hour, ex);
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
