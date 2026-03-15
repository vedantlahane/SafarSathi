package com.safarsathi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Vercel production URL, e.g. https://safarsathi.vercel.app
     * Set via the FRONTEND_URL environment variable in Cloud Run.
     * Leave unset (or empty) for local development — falls back to wildcard.
     */
    @Value("${FRONTEND_URL:}")
    private String frontendUrl;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOriginPatterns(buildAllowedOrigins());
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("*"));
                    config.setAllowCredentials(true);
                    return config;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            new ObjectMapper().writeValue(response.getOutputStream(),
                                    Map.of("success", false, "message", "Missing or invalid token"));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            new ObjectMapper().writeValue(response.getOutputStream(),
                                    Map.of("success", false, "message", "Admin access required"));
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/password-reset/**").permitAll()
                        .requestMatchers("/api/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/safety/**").permitAll()
                        .requestMatchers("/api/risk-zones/active").permitAll()
                        .requestMatchers("/api/police-stations").permitAll()
                        .requestMatchers("/api/hospitals").permitAll()
                        .requestMatchers("/api/admin/login").permitAll()
                        .requestMatchers("/api/admin/id/verify").permitAll()
                        .requestMatchers("/ws-connect/**").permitAll()

                        // Admin-only endpoints
                        .requestMatchers("/api/admin/dashboard/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/alerts/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/tourists").hasRole("ADMIN")
                        .requestMatchers("/api/admin/police/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/risk-zones/**").hasRole("ADMIN")

                        // Authenticated endpoints (tourist or admin)
                        .requestMatchers("/api/auth/profile/**").authenticated()
                        .requestMatchers("/api/tourist/**").authenticated()
                        .requestMatchers("/api/action/**").authenticated()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Builds the allowed-origins list for CORS:
     * - Local dev origins are always included.
     * - When FRONTEND_URL is set (production), it is added and the wildcard is dropped.
     * - When FRONTEND_URL is absent, "*" is used so local dev works without any config.
     */
    private List<String> buildAllowedOrigins() {
        List<String> origins = new ArrayList<>();
        origins.add("https://yatrax.vercel.app");  // production frontend
        origins.add("http://localhost:5173");        // Vite dev server
        origins.add("https://localhost:5173");
        origins.add("http://localhost:3000");        // fallback CRA / Next dev
        if (frontendUrl != null && !frontendUrl.isBlank()) {
            origins.add(frontendUrl.strip());        // any additional override via FRONTEND_URL
        }
        return origins;
    }
}
