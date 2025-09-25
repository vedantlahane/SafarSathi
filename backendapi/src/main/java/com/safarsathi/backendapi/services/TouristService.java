// backend/src/main/java/com/safarsathi/backendapi/service/TouristService.java

package com.safarsathi.backendapi.services;

import com.safarsathi.backendapi.models.Tourist;
import java.util.UUID;

public interface TouristService {

    /**
     * Handles tourist registration, creates the Digital ID hash, and publishes the hash.
     * @param newTourist Tourist data from the registration form.
     * @return The newly registered Tourist object.
     */
    Tourist registerTourist(Tourist newTourist);

    /**
     * Retrieves a tourist by their ID hash (used for QR code verification).
     * @param idHash The SHA256 hash provided by the QR code scanner.
     * @return The found Tourist.
     */
    Tourist verifyIdHash(String idHash);

    /**
     * Updates the tourist's current location and triggers anomaly/geo-fence checks.
     * @param touristId ID of the tourist sending the ping.
     * @param lat New latitude.
     * @param lng New longitude.
     * @param accuracy GPS accuracy.
     * @return The updated Tourist object.
     */
    Tourist updateLocation(UUID touristId, Double lat, Double lng, Integer accuracy);
    
    /**
     * Placeholder for the login endpoint logic.
     * @param phone Tourist's phone number.
     * @return A mock security token (TBD).
     */
    String login(String phone);
}