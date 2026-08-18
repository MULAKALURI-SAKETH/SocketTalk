package com.saketh.websocket.session;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SessionService {

    public static final long SESSION_TTL_MILLIS = 60 * 60 * 1000L;

    private final SessionRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();

    public String createSession(String username) {
        String token = generateToken();
        repository.save(new Session(hash(token), username, System.currentTimeMillis() + SESSION_TTL_MILLIS));
        return token;
    }

    public Optional<String> findUserByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return repository.findById(hash(token))
                .filter(session -> session.getExpiresAt().getTime() > System.currentTimeMillis())
                .map(Session::getUsername);
    }

    public void removeSession(String token) {
        if (token != null) {
            repository.deleteById(hash(token));
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}