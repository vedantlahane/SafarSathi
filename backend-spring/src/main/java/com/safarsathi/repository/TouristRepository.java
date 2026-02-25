package com.safarsathi.repository;

import com.safarsathi.entity.Tourist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TouristRepository extends MongoRepository<Tourist, String> {

    Optional<Tourist> findByEmail(String email);

    Optional<Tourist> findByIdHash(String idHash);

    Optional<Tourist> findByResetTokenHashAndResetTokenExpiresAfter(String resetTokenHash, java.time.Instant now);
}
