package com.saketh.websocket.user;

import com.saketh.websocket.session.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static com.saketh.websocket.user.UserStatus.ONLINE;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private SessionService sessionService;

    private User user(String slug) {
        User user = new User();
        user.setSlug(slug);
        user.setFullName(slug);
        user.setUserStatus(ONLINE);
        return user;
    }

    @Test
    void findConnectedUsers_returnsOnlineUsers() throws Exception {
        when(userService.findConnectedUsers()).thenReturn(List.of(user("alice")));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("alice"))
                .andExpect(jsonPath("$[0].userStatus").value("ONLINE"));
    }

    @Test
    void register_returnsCreatedUser() throws Exception {
        when(userService.register(any(AuthRequest.class))).thenReturn(user("alice"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice\",\"password\":\"Password1\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("alice"))
                .andExpect(jsonPath("$.userStatus").value("ONLINE"));
    }

    @Test
    void login_returnsUserAndSetsHttpOnlySessionCookie() throws Exception {
        when(userService.login(any(AuthRequest.class))).thenReturn(user("alice"));
        when(sessionService.createSession("alice")).thenReturn("token123");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice\",\"password\":\"Password1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("alice"))
                .andExpect(cookie().value("chatSession", "token123"))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Strict")));
    }

    @Test
    void me_returnsAuthenticatedUserForValidCookie() throws Exception {
        when(sessionService.findUserByToken("token123")).thenReturn(Optional.of("alice"));
        when(userService.findBySlug("alice")).thenReturn(user("alice"));

        mockMvc.perform(get("/auth/me").cookie(new jakarta.servlet.http.Cookie("chatSession", "token123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("alice"));
    }

    @Test
    void me_returnsUnauthorizedWithoutValidCookie() throws Exception {
        when(sessionService.findUserByToken(null)).thenReturn(Optional.empty());

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_removesSessionAndClearsCookie() throws Exception {
        when(userService.logout(any(LogoutRequest.class))).thenReturn(user("alice"));

        mockMvc.perform(post("/auth/logout")
                        .cookie(new jakarta.servlet.http.Cookie("chatSession", "token123"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("alice"))
                .andExpect(cookie().maxAge("chatSession", 0));

        verify(sessionService).removeSession("token123");
    }
}