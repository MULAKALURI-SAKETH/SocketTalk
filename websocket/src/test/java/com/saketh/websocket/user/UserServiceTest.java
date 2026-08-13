package com.saketh.websocket.user;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static com.saketh.websocket.user.UserStatus.OFFLINE;
import static com.saketh.websocket.user.UserStatus.ONLINE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private AuthRequest authRequest(String username, String password) {
        return new AuthRequest(username, password);
    }

    @Test
    void register_encodesPasswordAndSavesOfflineUser() {
        when(userRepository.existsById("john123")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User saved = userService.register(authRequest("john123", "Password1"));

        assertThat(saved.getSlug()).isEqualTo("john123");
        assertThat(saved.getFullName()).isEqualTo("john123");
        assertThat(saved.getUserStatus()).isEqualTo(OFFLINE);
        assertThat(saved.getPassword()).isNotEqualTo("Password1");
        assertThat(passwordEncoder.matches("Password1", saved.getPassword())).isTrue();
        verify(userRepository).save(saved);
    }

    @Test
    void register_throwsConflictWhenUsernameAlreadyExists() {
        when(userRepository.existsById("john123")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(authRequest("john123", "Password1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_throwsBadRequestForBlankCredentials() {
        assertThatThrownBy(() -> userService.register(authRequest("  ", "")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> userService.register(null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_marksUserOnlineOnValidCredentials() {
        User stored = new User();
        stored.setSlug("john123");
        stored.setPassword(passwordEncoder.encode("Password1"));
        stored.setUserStatus(OFFLINE);

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));
        when(userRepository.save(stored)).thenReturn(stored);

        User loggedIn = userService.login(authRequest("john123", "Password1"));

        assertThat(loggedIn.getUserStatus()).isEqualTo(ONLINE);
        verify(userRepository).save(stored);
    }

    @Test
    void login_throwsUnauthorizedForWrongPassword() {
        User stored = new User();
        stored.setSlug("john123");
        stored.setPassword(passwordEncoder.encode("Password1"));
        stored.setUserStatus(OFFLINE);

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> userService.login(authRequest("john123", "WrongPass1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));

        verify(userRepository, never()).save(stored);
    }

    @Test
    void login_throwsUnauthorizedWhenUserDoesNotExist() {
        when(userRepository.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login(authRequest("ghost", "Password1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void login_throwsBadRequestForBlankCredentials() {
        assertThatThrownBy(() -> userService.login(authRequest(null, "Password1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void logout_marksUserOffline() {
        User stored = new User();
        stored.setSlug("john123");
        stored.setUserStatus(ONLINE);

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));
        when(userRepository.save(stored)).thenReturn(stored);

        User loggedOut = userService.logout(new LogoutRequest("john123"));

        assertThat(loggedOut.getUserStatus()).isEqualTo(OFFLINE);
        verify(userRepository).save(stored);
    }

    @Test
    void logout_throwsBadRequestForBlankUsername() {
        assertThatThrownBy(() -> userService.logout(new LogoutRequest("  ")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void logout_throwsNotFoundWhenUserDoesNotExist() {
        when(userRepository.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.logout(new LogoutRequest("ghost")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.NOT_FOUND));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void saveUser_preservesStoredPasswordAndMarksOnline() {
        User stored = new User();
        stored.setSlug("john123");
        stored.setPassword("hashed-password");

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User incoming = new User();
        incoming.setSlug("john123");
        incoming.setPassword(null);

        userService.saveUser(incoming);

        assertThat(incoming.getPassword()).isEqualTo("hashed-password");
        assertThat(incoming.getUserStatus()).isEqualTo(ONLINE);
        verify(userRepository).save(incoming);
    }

    @Test
    void saveUser_newUserGetsOnlineStatus() {
        when(userRepository.findById("newuser")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User incoming = new User();
        incoming.setSlug("newuser");

        userService.saveUser(incoming);

        assertThat(incoming.getUserStatus()).isEqualTo(ONLINE);
        verify(userRepository).save(incoming);
    }

    @Test
    void disconnect_marksExistingUserOffline() {
        User stored = new User();
        stored.setSlug("john123");
        stored.setUserStatus(ONLINE);

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));
        when(userRepository.save(stored)).thenReturn(stored);

        userService.disconnect(stored);

        assertThat(stored.getUserStatus()).isEqualTo(OFFLINE);
        verify(userRepository).save(stored);
    }

    @Test
    void disconnect_doesNothingForUnknownUser() {
        User unknown = new User();
        unknown.setSlug("ghost");

        when(userRepository.findById("ghost")).thenReturn(Optional.empty());

        userService.disconnect(unknown);

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void findConnectedUsers_returnsOnlyOnlineUsers() {
        User online = new User();
        online.setSlug("john123");
        online.setUserStatus(ONLINE);

        when(userRepository.findAllByUserStatus(ONLINE)).thenReturn(List.of(online));

        List<User> connected = userService.findConnectedUsers();

        assertThat(connected).hasSize(1);
        assertThat(connected.get(0).getSlug()).isEqualTo("john123");
        verify(userRepository).findAllByUserStatus(ONLINE);
    }

    @Test
    void findAllUsers_returnsAllUsersSortedBySlug() {
        User bob = new User();
        bob.setSlug("bob12");
        User alice = new User();
        alice.setSlug("alice1");
        when(userRepository.findAll()).thenReturn(List.of(bob, alice));

        List<User> users = userService.findAllUsers();

        assertThat(users).extracting(User::getSlug)
                .containsExactly("alice1", "bob12");
    }

    @Test
    void findBySlug_returnsUserWhenFound() {
        User stored = new User();
        stored.setSlug("john123");

        when(userRepository.findById("john123")).thenReturn(Optional.of(stored));

        User found = userService.findBySlug("john123");

        assertThat(found.getSlug()).isEqualTo("john123");
    }

    @Test
    void findBySlug_throwsUnauthorizedWhenUserNotFound() {
        when(userRepository.findById("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findBySlug("ghost"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }
}