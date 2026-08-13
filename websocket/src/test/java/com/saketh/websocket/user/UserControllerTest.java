package com.saketh.websocket.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static com.saketh.websocket.user.UserStatus.ONLINE;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

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
    void login_returnsOnlineUser() throws Exception {
        when(userService.login(any(AuthRequest.class))).thenReturn(user("alice"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice\",\"password\":\"Password1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("alice"));
    }

    @Test
    void logout_returnsUser() throws Exception {
        when(userService.logout(any(LogoutRequest.class))).thenReturn(user("alice"));

        mockMvc.perform(post("/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"alice\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("alice"));
    }
}