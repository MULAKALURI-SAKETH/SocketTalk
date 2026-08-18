package com.saketh.websocket.chat;

import com.saketh.websocket.session.SessionService;
import com.saketh.websocket.user.UserController;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;
    private final SessionService sessionService;

    @MessageMapping("/chat")
    private void processMessage(
            @Payload ChatMessage chatMessage
    ) {
        ChatMessage savedMessage = chatMessageService.save(chatMessage);
        ChatNotification notification = ChatNotification.builder()
                .type(ChatNotificationType.MESSAGE)
                .id(savedMessage.getId())
                .senderId(savedMessage.getSenderId())
                .recipientId(savedMessage.getRecipientId())
                .content(savedMessage.getContent())
                .attachments(savedMessage.getAttachments())
                .build();
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(),
                "/queue/messages",
                notification
        );
        messagingTemplate.convertAndSendToUser(
                chatMessage.getSenderId(),
                "/queue/messages",
                notification
        );
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(
            @PathVariable("senderId") String senderId,
            @PathVariable("recipientId") String recipientId,
            @CookieValue(value = UserController.SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String viewerId = resolveUser(sessionToken, senderId);
        return ResponseEntity.ok(
                chatMessageService.findChatMessages(viewerId, senderId, recipientId)
        );
    }

    @PostMapping("/messages/{senderId}/{recipientId}/read")
    public ResponseEntity<ChatMessage> markMessagesAsRead(
            @PathVariable("senderId") String senderId,
            @PathVariable("recipientId") String recipientId,
            @CookieValue(value = UserController.SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String readerId = resolveUser(sessionToken, recipientId);
        ChatMessage updated = chatMessageService.markMessagesAsRead(senderId, recipientId, readerId);
        if (updated != null) {
            messagingTemplate.convertAndSendToUser(
                    senderId,
                    "/queue/messages",
                    ChatNotification.builder()
                            .type(ChatNotificationType.MESSAGE_READ)
                            .senderId(senderId)
                            .recipientId(readerId)
                            .readByRecipient(true)
                            .build()
            );
        }
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ChatMessage> editMessage(
            @PathVariable("messageId") String messageId,
            @RequestBody EditMessageRequest request,
            @CookieValue(value = UserController.SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String editorId = resolveUser(sessionToken, request.userId());
        ChatMessage updated = chatMessageService.editMessage(
                messageId,
                request.content(),
                editorId,
                request.attachments()
        );
        ChatNotification notification = ChatNotification.builder()
                .type(ChatNotificationType.MESSAGE_EDITED)
                .id(updated.getId())
                .senderId(updated.getSenderId())
                .recipientId(updated.getRecipientId())
                .content(updated.getContent())
                .attachments(updated.getAttachments())
                .edited(true)
                .build();
        messagingTemplate.convertAndSendToUser(updated.getRecipientId(), "/queue/messages", notification);
        messagingTemplate.convertAndSendToUser(updated.getSenderId(), "/queue/messages", notification);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/messages/{messageId}/for-me")
    public ResponseEntity<ChatMessage> deleteForMe(
            @PathVariable("messageId") String messageId,
            @RequestParam(value = "userId", required = false) String userId,
            @CookieValue(value = UserController.SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String currentUser = resolveUser(sessionToken, userId);
        ChatMessage updated = chatMessageService.deleteForMe(messageId, currentUser);
        messagingTemplate.convertAndSendToUser(
                currentUser,
                "/queue/messages",
                ChatNotification.builder()
                        .type(ChatNotificationType.MESSAGE_DELETED)
                        .id(updated.getId())
                        .senderId(updated.getSenderId())
                        .recipientId(updated.getRecipientId())
                        .deletedForEveryone(false)
                        .build()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/messages/{messageId}/for-everyone")
    public ResponseEntity<ChatMessage> deleteForEveryone(
            @PathVariable("messageId") String messageId,
            @RequestParam(value = "userId", required = false) String userId,
            @CookieValue(value = UserController.SESSION_COOKIE_NAME, required = false) String sessionToken
    ) {
        String currentUser = resolveUser(sessionToken, userId);
        ChatMessage updated = chatMessageService.deleteForEveryone(messageId, currentUser);
        ChatNotification notification = ChatNotification.builder()
                .type(ChatNotificationType.MESSAGE_DELETED)
                .id(updated.getId())
                .senderId(updated.getSenderId())
                .recipientId(updated.getRecipientId())
                .deletedForEveryone(true)
                .build();
        messagingTemplate.convertAndSendToUser(updated.getSenderId(), "/queue/messages", notification);
        messagingTemplate.convertAndSendToUser(updated.getRecipientId(), "/queue/messages", notification);
        return ResponseEntity.ok(updated);
    }

    private String resolveUser(String sessionToken, String fallback) {
        return sessionService.findUserByToken(sessionToken).orElse(fallback);
    }
}