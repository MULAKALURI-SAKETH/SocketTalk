package com.saketh.websocket.session;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SessionServiceTest {

    private final SessionService sessionService = new SessionService();

    @Test
    void createSession_returnsTokenAndMapsToUser() {
        String token = sessionService.createSession("alice");

        assertThat(token).isNotBlank();
        assertThat(sessionService.findUserByToken(token)).contains("alice");
    }

    @Test
    void createSession_generatesUniqueTokens() {
        String first = sessionService.createSession("alice");
        String second = sessionService.createSession("alice");

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void findUserByToken_returnsEmptyForUnknownToken() {
        assertThat(sessionService.findUserByToken("nope")).isEmpty();
    }

    @Test
    void findUserByToken_returnsEmptyForNullOrBlank() {
        assertThat(sessionService.findUserByToken(null)).isEmpty();
        assertThat(sessionService.findUserByToken("  ")).isEmpty();
    }

    @Test
    void removeSession_invalidatesTheToken() {
        String token = sessionService.createSession("alice");

        sessionService.removeSession(token);

        assertThat(sessionService.findUserByToken(token)).isEmpty();
    }

    @Test
    void removeSession_ignoresNull() {
        sessionService.removeSession(null);
    }
}