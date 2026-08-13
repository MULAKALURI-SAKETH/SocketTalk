package com.saketh.websocket.session;

public record Session(String token, String username, long expiresAt) {
}