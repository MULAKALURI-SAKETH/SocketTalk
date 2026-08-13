package com.saketh.websocket.chat;

import com.saketh.websocket.chatroom.ChatRoomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock
    private ChatMessageRepository repository;

    @Mock
    private ChatRoomService chatRoomService;

    @InjectMocks
    private ChatMessageService chatMessageService;

    @Test
    void save_assignsChatIdAndTimestampAndPersists() {
        when(chatRoomService.getChatRoomId("alice", "bob", true))
                .thenReturn(Optional.of("alice_bob"));

        ChatMessage message = ChatMessage.builder()
                .senderId("alice")
                .recipientId("bob")
                .content("Hello")
                .build();

        when(repository.save(message)).thenAnswer(invocation -> invocation.getArgument(0));

        ChatMessage saved = chatMessageService.save(message);

        assertThat(saved.getChatId()).isEqualTo("alice_bob");
        assertThat(saved.getTimestamp()).isNotNull();
        verify(repository).save(message);
    }

    @Test
    void save_preservesProvidedTimestamp() {
        when(chatRoomService.getChatRoomId("alice", "bob", true))
                .thenReturn(Optional.of("alice_bob"));

        Date provided = new Date(123456789L);
        ChatMessage message = ChatMessage.builder()
                .senderId("alice")
                .recipientId("bob")
                .content("Hello")
                .timestamp(provided)
                .build();

        when(repository.save(message)).thenReturn(message);

        ChatMessage saved = chatMessageService.save(message);

        assertThat(saved.getTimestamp()).isSameAs(provided);
    }

    @Test
    void findChatMessages_returnsMessagesForExistingChat() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.of("alice_bob"));

        ChatMessage msg1 = ChatMessage.builder().id("1").chatId("alice_bob").build();
        when(repository.findByChatId("alice_bob")).thenReturn(List.of(msg1));

        List<ChatMessage> messages = chatMessageService.findChatMessages("alice", "bob");

        assertThat(messages).containsExactly(msg1);
        verify(repository).findByChatId(eq("alice_bob"));
    }

    @Test
    void findChatMessages_returnsEmptyListWhenChatDoesNotExist() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.empty());

        List<ChatMessage> messages = chatMessageService.findChatMessages("alice", "bob");

        assertThat(messages).isEmpty();
    }
}