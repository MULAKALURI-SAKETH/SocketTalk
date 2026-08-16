package com.saketh.websocket.user;

import com.saketh.websocket.session.SessionService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    public static final String SESSION_COOKIE_NAME = "chatSession";
    private static final int SESSION_MAX_AGE_SECONDS = 3600;

    private final UserService userService;
    private final SessionService sessionService;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @MessageMapping("/user.addUser")
    @SendTo("/user/topic")
    public User addUser(@Payload User user) {
        userService.saveUser(user);
        return user;
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/user/topic")
    public User disconnect(@Payload User user) {
        userService.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/users/online")
    public ResponseEntity<List<User>> findConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }

    @PostMapping("/auth/register")
    public ResponseEntity<User> register(@RequestBody AuthRequest request) {
        return ResponseEntity.status(201).body(userService.register(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<User> login(
            @RequestBody AuthRequest request,
            HttpServletResponse response
    ) {
        User user = userService.login(request);
        String token = sessionService.createSession(user.getSlug());
        response.addHeader(HttpHeaders.SET_COOKIE, sessionCookie(token).toString());
        return ResponseEntity.ok(user);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<User> logout(
            @RequestBody LogoutRequest request,
            @CookieValue(value = SESSION_COOKIE_NAME, required = false) String sessionToken,
            HttpServletResponse response
    ) {
        sessionService.removeSession(sessionToken);
        response.addHeader(HttpHeaders.SET_COOKIE, expiredSessionCookie().toString());
        return ResponseEntity.ok(userService.logout(request));
    }

    @GetMapping("/auth/me")
    public ResponseEntity<User> me(
            @CookieValue(value = SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String username = sessionService.findUserByToken(sessionToken)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Session expired or invalid."
                ));
        return ResponseEntity.ok(userService.findBySlug(username));
    }

    private ResponseCookie sessionCookie(String token) {
        return ResponseCookie.from(SESSION_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(SESSION_MAX_AGE_SECONDS)
                .build();
    }

    private ResponseCookie expiredSessionCookie() {
        return ResponseCookie.from(SESSION_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }
}