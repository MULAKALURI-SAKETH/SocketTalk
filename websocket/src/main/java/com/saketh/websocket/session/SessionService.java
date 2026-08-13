package com.saketh.websocket.session;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    private static final long SESSION_TTL_MILLIS = 60 * 60 * 1000L;

    private final Map<String, Session> sessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    public String createSession(String username) {
        String token = generateToken();
        sessions.put(token, new Session(token, username, System.currentTimeMillis() + SESSION_TTL_MILLIS));
        return token;
    }

    public Optional<String> findUserByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        Session session = sessions.get(token);
        if (session == null) {
            return Optional.empty();
        }
        if (session.expiresAt() < System.currentTimeMillis()) {
            sessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(session.username());
    }

    public void removeSession(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }
}