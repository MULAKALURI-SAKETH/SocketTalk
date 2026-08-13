package com.saketh.websocket.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static com.saketh.websocket.user.UserStatus.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User register(AuthRequest request) {
        validateCredentials(request);
        if (userRepository.existsById(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username is already taken. Please choose a different one.");
        }
        User user = new User();
        user.setSlug(request.username());
        user.setFullName(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setUserStatus(OFFLINE);
        return userRepository.save(user);
    }

    public User login(AuthRequest request) {
        validateCredentials(request);
        User user = userRepository.findById(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password. Please try again."));
        if (user.getPassword() == null || !passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password. Please try again.");
        }
        user.setUserStatus(ONLINE);
        return userRepository.save(user);
    }

    public User logout(LogoutRequest request) {
        if (request == null || request.username() == null || request.username().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required.");
        }
        User user = userRepository.findById(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "That user could not be found."));
        user.setUserStatus(OFFLINE);
        return userRepository.save(user);
    }
    public void saveUser(User user) {
        userRepository.findById(user.getSlug()).ifPresent(storedUser -> {
            if (user.getPassword() == null) user.setPassword(storedUser.getPassword());
        });
        user.setUserStatus(ONLINE);
        userRepository.save(user);
    }

    public void disconnect(User user) {
        var storedUser = userRepository.findById(user.getSlug()).orElse(null);
        if (storedUser != null) {
           storedUser.setUserStatus(OFFLINE);
           userRepository.save(storedUser);
        }
    }

    public List<User> findConnectedUsers() {
        return userRepository.findAllByUserStatus(ONLINE);
    }

    public List<User> findAllUsers() {
        return userRepository.findAll().stream()
                .sorted((a, b) -> a.getSlug().compareToIgnoreCase(b.getSlug()))
                .toList();
    }

    public User findBySlug(String slug) {
        return userRepository.findById(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired or invalid."));
    }

    private void validateCredentials(AuthRequest request) {
        if (request == null || request.username() == null || request.username().isBlank() || request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required.");
        }
    }
}
