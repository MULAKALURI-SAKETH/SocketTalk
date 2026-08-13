package com.saketh.websocket.chat;

import com.saketh.websocket.chatroom.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {
    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;

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
        return repository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(
            String senderId,
            String recipientId
    ) {
        Optional<String> chatId = chatRoomService.getChatRoomId(
                senderId,
                recipientId,
                false
        );
        return chatId.map(repository::findByChatId).orElse(new ArrayList<>());
    }
}
