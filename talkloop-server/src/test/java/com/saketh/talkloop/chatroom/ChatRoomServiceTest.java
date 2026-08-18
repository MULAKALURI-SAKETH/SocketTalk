package com.saketh.talkloop.chatroom;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatRoomServiceTest {

    @Mock
    private ChatRoomRepository repository;

    @InjectMocks
    private ChatRoomService chatRoomService;

    @Test
    void getChatRoomId_returnsExistingChatId() {
        ChatRoom existing = ChatRoom.builder()
                .chatId("alice_bob")
                .senderId("alice")
                .recipientId("bob")
                .build();

        when(repository.findBySenderIdAndRecipientId("alice", "bob"))
                .thenReturn(Optional.of(existing));

        Optional<String> chatId = chatRoomService.getChatRoomId("alice", "bob", false);

        assertThat(chatId).contains("alice_bob");
        verify(repository, never()).save(any(ChatRoom.class));
    }

    @Test
    void getChatRoomId_createsBothDirectionsWhenMissingAndRequested() {
        when(repository.findBySenderIdAndRecipientId("alice", "bob")).thenReturn(Optional.empty());

        Optional<String> chatId = chatRoomService.getChatRoomId("alice", "bob", true);

        assertThat(chatId).contains("alice_bob");

        ArgumentCaptor<ChatRoom> captor = ArgumentCaptor.forClass(ChatRoom.class);
        verify(repository, org.mockito.Mockito.times(2)).save(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(ChatRoom::getChatId)
                .containsExactly("alice_bob", "alice_bob");
        assertThat(captor.getAllValues())
                .extracting(ChatRoom::getSenderId)
                .containsExactlyInAnyOrder("alice", "bob");
        assertThat(captor.getAllValues())
                .extracting(ChatRoom::getRecipientId)
                .containsExactlyInAnyOrder("bob", "alice");
    }

    @Test
    void getChatRoomId_returnsEmptyWhenMissingAndNotRequested() {
        when(repository.findBySenderIdAndRecipientId("alice", "bob")).thenReturn(Optional.empty());

        Optional<String> chatId = chatRoomService.getChatRoomId("alice", "bob", false);

        assertThat(chatId).isEmpty();
        verify(repository, never()).save(any(ChatRoom.class));
    }
}