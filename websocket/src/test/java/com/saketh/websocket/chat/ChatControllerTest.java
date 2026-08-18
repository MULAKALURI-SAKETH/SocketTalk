package com.saketh.websocket.chat;

import com.saketh.websocket.session.SessionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatMessageService chatMessageService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private SessionService sessionService;

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
        when(chatMessageService.findChatMessages("alice", "alice", "bob"))
                .thenReturn(List.of(message));

        ResponseEntity<List<ChatMessage>> response =
                chatController.findChatMessages("alice", "bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).getId()).isEqualTo("m1");
        assertThat(response.getBody().get(0).getChatId()).isEqualTo("alice_bob");
        assertThat(response.getBody().get(0).getSenderId()).isEqualTo("alice");
        assertThat(response.getBody().get(0).getRecipientId()).isEqualTo("bob");
        assertThat(response.getBody().get(0).getContent()).isEqualTo("Hello");
        verify(chatMessageService).findChatMessages("alice", "alice", "bob");
    }

    @Test
    void findChatMessages_returnsEmptyArrayWhenNoHistory() {
        when(chatMessageService.findChatMessages("alice", "alice", "bob"))
                .thenReturn(List.of());

        ResponseEntity<List<ChatMessage>> response =
                chatController.findChatMessages("alice", "bob", null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEmpty();
        verify(chatMessageService).findChatMessages("alice", "alice", "bob");
    }

    @Test
    void markMessagesAsRead_usesSessionUserAndNotifiesSender() {
        when(sessionService.findUserByToken("token-123")).thenReturn(Optional.of("bob"));
        ChatMessage read = ChatMessage.builder()
                .id("m1").senderId("alice").recipientId("bob").readByRecipient(true).build();
        when(chatMessageService.markMessagesAsRead("alice", "bob", "bob")).thenReturn(read);

        ResponseEntity<ChatMessage> response =
                chatController.markMessagesAsRead("alice", "bob", "token-123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(read);
        ArgumentCaptor<ChatNotification> captor = ArgumentCaptor.forClass(ChatNotification.class);
        verify(messagingTemplate).convertAndSendToUser(
                org.mockito.ArgumentMatchers.eq("alice"),
                org.mockito.ArgumentMatchers.eq("/queue/messages"),
                captor.capture()
        );
        ChatNotification sent = captor.getValue();
        assertThat(sent.getType()).isEqualTo(ChatNotificationType.MESSAGE_READ);
        assertThat(sent.getSenderId()).isEqualTo("alice");
        assertThat(sent.getRecipientId()).isEqualTo("bob");
        assertThat(sent.isReadByRecipient()).isTrue();
    }

    @Test
    void editMessage_updatesAndNotifiesBothUsers() {
        when(sessionService.findUserByToken("token-123")).thenReturn(Optional.of("alice"));
        ChatMessage edited = ChatMessage.builder()
                .id("m1").senderId("alice").recipientId("bob")
                .content("Hello edited").edited(true).build();
        when(chatMessageService.editMessage("m1", "Hello edited", "alice", null)).thenReturn(edited);

        ResponseEntity<ChatMessage> response =
                chatController.editMessage("m1", new EditMessageRequest("Hello edited", null, null), "token-123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(edited);
        ArgumentCaptor<ChatNotification> captor = ArgumentCaptor.forClass(ChatNotification.class);
        verify(messagingTemplate, org.mockito.Mockito.times(2)).convertAndSendToUser(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq("/queue/messages"),
                captor.capture()
        );
        List<ChatNotification> sent = captor.getAllValues();
        assertThat(sent).allSatisfy(n -> {
            assertThat(n.getType()).isEqualTo(ChatNotificationType.MESSAGE_EDITED);
            assertThat(n.getId()).isEqualTo("m1");
            assertThat(n.getContent()).isEqualTo("Hello edited");
            assertThat(n.isEdited()).isTrue();
        });
    }

    @Test
    void deleteForEveryone_marksAndNotifiesBothUsers() {
        when(sessionService.findUserByToken("token-123")).thenReturn(Optional.of("alice"));
        ChatMessage deleted = ChatMessage.builder()
                .id("m1").senderId("alice").recipientId("bob").deletedForEveryone(true).build();
        when(chatMessageService.deleteForEveryone("m1", "alice")).thenReturn(deleted);

        ResponseEntity<ChatMessage> response =
                chatController.deleteForEveryone("m1", "bob", "token-123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isSameAs(deleted);
        ArgumentCaptor<ChatNotification> captor = ArgumentCaptor.forClass(ChatNotification.class);
        verify(messagingTemplate, org.mockito.Mockito.times(2)).convertAndSendToUser(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.eq("/queue/messages"),
                captor.capture()
        );
        List<ChatNotification> sent = captor.getAllValues();
        assertThat(sent).allSatisfy(n -> {
            assertThat(n.getType()).isEqualTo(ChatNotificationType.MESSAGE_DELETED);
            assertThat(n.getId()).isEqualTo("m1");
            assertThat(n.isDeletedForEveryone()).isTrue();
        });
    }
}