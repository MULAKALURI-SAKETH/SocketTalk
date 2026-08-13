package com.saketh.websocket.chat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatMessageService chatMessageService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatController chatController;

    @Test
    void findChatMessages_returnsHistoryBetweenUsers() {
        ChatMessage message = ChatMessage.builder()
                .id("m1")
                .chatId("alice_bob")
                .senderId("alice")
                .recipientId("bob")
                .content("Hello")
                .timestamp(new Date(123456789L))
                .build();
        when(chatMessageService.findChatMessages("alice", "bob"))
                .thenReturn(List.of(message));

        ResponseEntity<List<ChatMessage>> response =
                chatController.findChatMessages("alice", "bob");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getId()).isEqualTo("m1");
        assertThat(response.getBody().get(0).getChatId()).isEqualTo("alice_bob");
        assertThat(response.getBody().get(0).getSenderId()).isEqualTo("alice");
        assertThat(response.getBody().get(0).getRecipientId()).isEqualTo("bob");
        assertThat(response.getBody().get(0).getContent()).isEqualTo("Hello");
        verify(chatMessageService).findChatMessages("alice", "bob");
    }

    @Test
    void findChatMessages_returnsEmptyArrayWhenNoHistory() {
        when(chatMessageService.findChatMessages("alice", "bob"))
                .thenReturn(List.of());

        ResponseEntity<List<ChatMessage>> response =
                chatController.findChatMessages("alice", "bob");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
        verify(chatMessageService).findChatMessages("alice", "bob");
    }
}
