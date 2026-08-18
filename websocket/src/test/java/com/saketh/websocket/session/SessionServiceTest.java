package com.saketh.websocket.session;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SessionServiceTest {

    private final SessionRepository repository = mock(SessionRepository.class);
    private final SessionService sessionService = new SessionService(repository);

    @BeforeEach
    void setUp() {
        when(repository.save(any(Session.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void createSession_returnsTokenAndMapsToUser() {
        String token = sessionService.createSession("alice");
        when(repository.findById(SessionService.hash(token)))
                .thenReturn(Optional.of(
                        new Session(SessionService.hash(token), "alice", System.currentTimeMillis() + 60_000)
                ));

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
    void createSession_storesHashedTokenAsId() {
        String token = sessionService.createSession("alice");

        ArgumentCaptor<Session> captor = ArgumentCaptor.forClass(Session.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(SessionService.hash(token));
        assertThat(captor.getValue().getId()).isNotEqualTo(token);
    }

    @Test
    void findUserByToken_returnsEmptyForUnknownToken() {
        when(repository.findById(any())).thenReturn(Optional.empty());

        assertThat(sessionService.findUserByToken("nope")).isEmpty();
    }

    @Test
    void findUserByToken_returnsEmptyForNullOrBlank() {
        assertThat(sessionService.findUserByToken(null)).isEmpty();
        assertThat(sessionService.findUserByToken("  ")).isEmpty();
    }

    @Test
    void findUserByToken_returnsEmptyForExpiredSession() {
        String token = "some-token";
        when(repository.findById(SessionService.hash(token)))
                .thenReturn(Optional.of(
                        new Session(SessionService.hash(token), "alice", System.currentTimeMillis() - 60_000)
                ));

        assertThat(sessionService.findUserByToken(token)).isEmpty();
    }

    @Test
    void removeSession_deletesByHashedToken() {
        String token = "some-token";

        sessionService.removeSession(token);

        verify(repository).deleteById(SessionService.hash(token));
    }

    @Test
    void removeSession_ignoresNull() {
        sessionService.removeSession(null);
    }
}