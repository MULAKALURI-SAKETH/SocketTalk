package com.saketh.talkloop.chat;

import com.saketh.talkloop.chatroom.ChatRoomService;
import com.saketh.talkloop.upload.UploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;
    private final UploadService uploadService;

    public ChatMessage save(ChatMessage chatMessage) {
        String chatId = chatRoomService.getChatRoomId(
                chatMessage.getSenderId(),
                chatMessage.getRecipientId(),
                true
        ).orElseThrow();
        chatMessage.setChatId(chatId);
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(new Date());
        }
        if (chatMessage.getDeletedFor() == null) {
            chatMessage.setDeletedFor(new HashSet<>());
        }
        return repository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(
            String viewerId,
            String senderId,
            String recipientId
    ) {
        Optional<String> chatId = chatRoomService.getChatRoomId(
                senderId,
                recipientId,
                false
        );
        if (chatId.isEmpty()) {
            return new ArrayList<>();
        }
        return repository.findByChatId(chatId.get()).stream()
                .filter(message -> !message.isDeletedForEveryone())
                .filter(message -> message.getDeletedFor() == null
                        || !message.getDeletedFor().contains(viewerId))
                .toList();
    }

    public ChatMessage markMessagesAsRead(
            String senderId,
            String recipientId,
            String readerId
    ) {
        Optional<String> chatId = chatRoomService.getChatRoomId(
                senderId,
                recipientId,
                false
        );
        if (chatId.isEmpty()) {
            return null;
        }
        List<ChatMessage> unread = repository.findByChatIdAndReadByRecipientFalse(chatId.get());
        List<ChatMessage> readMessages = new ArrayList<>();
        for (ChatMessage message : unread) {
            if (recipientId.equals(readerId)
                    && senderId.equals(message.getSenderId())
                    && recipientId.equals(message.getRecipientId())
                    && !message.isDeletedForEveryone()) {
                message.setReadByRecipient(true);
                readMessages.add(repository.save(message));
            }
        }
        return readMessages.isEmpty() ? null : readMessages.get(readMessages.size() - 1);
    }

    public ChatMessage editMessage(
            String messageId,
            String newContent,
            String editorId,
            List<ChatAttachment> newAttachments
    ) {
        ChatMessage message = findById(messageId);
        if (!editorId.equals(message.getSenderId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the sender can edit this message.");
        }
        if (message.isDeletedForEveryone()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This message has been deleted.");
        }
        boolean hasContent = newContent != null && !newContent.isBlank();
        boolean hasAttachments = newAttachments != null && !newAttachments.isEmpty();
        if (!hasContent && !hasAttachments) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message cannot be empty.");
        }
        if (newAttachments != null && message.getAttachments() != null) {
            for (ChatAttachment old : message.getAttachments()) {
                boolean kept = newAttachments.stream()
                        .anyMatch(attachment -> old.getUrl().equals(attachment.getUrl()));
                if (!kept) {
                    try {
                        uploadService.deleteByUrl(old.getUrl());
                    } catch (RuntimeException e) {
                        log.error("Failed to delete uploaded file {}", old.getUrl(), e);
                    }
                }
            }
        }
        message.setContent(newContent == null ? "" : newContent);
        if (newAttachments != null) {
            message.setAttachments(newAttachments);
        }
        message.setEdited(true);
        return repository.save(message);
    }

    public ChatMessage deleteForMe(String messageId, String userId) {
        ChatMessage message = findById(messageId);
        if (message.isDeletedForEveryone()) {
            return message;
        }
        if (message.getDeletedFor() == null) {
            message.setDeletedFor(new HashSet<>());
        }
        message.getDeletedFor().add(userId);
        return repository.save(message);
    }

    public ChatMessage deleteForEveryone(String messageId, String deleterId) {
        ChatMessage message = findById(messageId);
        if (!deleterId.equals(message.getSenderId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the sender can delete this message for everyone."
            );
        }
        if (message.isDeletedForEveryone()) {
            return message;
        }
        if (message.isReadByRecipient()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This message has already been read, so it can no longer be deleted for everyone."
            );
        }
        message.setDeletedForEveryone(true);
        if (message.getAttachments() != null) {
            for (ChatAttachment attachment : message.getAttachments()) {
                try {
                    uploadService.deleteByUrl(attachment.getUrl());
                } catch (RuntimeException e) {
                    log.warn("Failed to delete uploaded file {}", attachment.getUrl(), e);
                }
            }
        }
        return repository.save(message);
    }

    private ChatMessage findById(String messageId) {
        return repository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "That message could not be found."
                ));
    }
}