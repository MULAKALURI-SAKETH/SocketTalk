package com.saketh.websocket.user;

import com.saketh.websocket.session.SessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static com.saketh.websocket.user.UserStatus.OFFLINE;
import static com.saketh.websocket.user.UserStatus.ONLINE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private SessionService sessionService;

    @InjectMocks
    private UserController userController;

    private User user(String slug) {
        User user = new User();
        user.setSlug(slug);
        user.setFullName(slug);
        user.setUserStatus(ONLINE);
        return user;
    }

    private User offlineUser(String slug) {
        User user = new User();
        user.setSlug(slug);
        user.setFullName(slug);
        user.setUserStatus(OFFLINE);
        return user;
    }

    @Test
    void addUser_delegatesToServiceAndReturnsUser() {
        User incoming = user("alice");

        User result = userController.addUser(incoming);

        assertThat(result).isSameAs(incoming);
        verify(userService).saveUser(incoming);
    }

    @Test
    void disconnect_delegatesToServiceAndReturnsUser() {
        User incoming = user("alice");

        User result = userController.disconnect(incoming);

        assertThat(result).isSameAs(incoming);
        verify(userService).disconnect(incoming);
    }

    @Test
    void findAllUsers_returnsAllUsersIncludingOffline() {
        when(userService.findAllUsers()).thenReturn(List.of(
                user("alice"),
                offlineUser("bob")
        ));

        ResponseEntity<List<User>> response = userController.findAllUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).extracting(User::getSlug)
                .containsExactly("alice", "bob");
        assertThat(response.getBody().get(1).getUserStatus()).isEqualTo(OFFLINE);
    }

    @Test
    void findConnectedUsers_returnsOnlyOnlineUsers() {
        when(userService.findConnectedUsers()).thenReturn(List.of(user("alice")));

        ResponseEntity<List<User>> response = userController.findConnectedUsers();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getSlug()).isEqualTo("alice");
    }

    @Test
    void register_returnsCreatedUser() {
        when(userService.register(any(AuthRequest.class))).thenReturn(user("alice"));

        ResponseEntity<User> response =
                userController.register(new AuthRequest("alice", "Password1"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getSlug()).isEqualTo("alice");
        assertThat(response.getBody().getUserStatus()).isEqualTo(ONLINE);
    }

    @Test
    void login_setsHttpOnlySessionCookieAndReturnsUser() {
        when(userService.login(any(AuthRequest.class))).thenReturn(user("alice"));
        when(sessionService.createSession("alice")).thenReturn("token123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<User> result =
                userController.login(new AuthRequest("alice", "Password1"), response);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getSlug()).isEqualTo("alice");
        verify(sessionService).createSession("alice");
        String setCookie = response.getHeader("Set-Cookie");
        assertThat(setCookie).contains("chatSession=token123");
        assertThat(setCookie).contains("HttpOnly");
        assertThat(setCookie).contains("SameSite=Strict");
        assertThat(setCookie).contains("Path=/");
    }

    @Test
    void me_returnsAuthenticatedUserForValidCookie() {
        when(sessionService.findUserByToken("token123")).thenReturn(Optional.of("alice"));
        when(userService.findBySlug("alice")).thenReturn(user("alice"));

        ResponseEntity<User> response = userController.me("token123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getSlug()).isEqualTo("alice");
    }

    @Test
    void me_throwsUnauthorizedWithoutValidCookie() {
        when(sessionService.findUserByToken(null)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userController.me(null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(HttpStatus.UNAUTHORIZED));
    }

    @Test
    void logout_removesSessionAndClearsCookie() {
        when(userService.logout(any(LogoutRequest.class))).thenReturn(user("alice"));
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<User> result =
                userController.logout(new LogoutRequest("alice"), "token123", response);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getSlug()).isEqualTo("alice");
        verify(sessionService).removeSession("token123");
        String setCookie = response.getHeader("Set-Cookie");
        assertThat(setCookie).contains("chatSession=");
        assertThat(setCookie).contains("Max-Age=0");
    }
}
