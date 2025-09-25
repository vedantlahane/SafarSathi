package com.safarsathi.backendapi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Defines the prefix for destinations handled by the message broker (to clients)
        // Dashboard will subscribe to topics prefixed with /topic (e.g., /topic/alerts)
        config.enableSimpleBroker("/topic"); 
        
        // Defines the prefix for destinations handled by @MessageMapping methods (from clients to server)
        config.setApplicationDestinationPrefixes("/app"); 
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Registers the WebSocket endpoint for the client handshake.
        // Dashboard client connects to: ws://localhost:8080/ws-connect
        // .setAllowedOriginPatterns("*") is crucial for cross-domain communication (frontend/dashboard)
        registry.addEndpoint("/ws-connect").setAllowedOriginPatterns("*").withSockJS();
    }
}