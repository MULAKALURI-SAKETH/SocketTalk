package com.saketh.websocket.chat;

import com.saketh.websocket.chatroom.ChatRoomService;
import com.saketh.websocket.upload.UploadService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatMessageServiceTest {

    @Mock
    private ChatMessageRepository repository;

    @Mock
    private ChatRoomService chatRoomService;

    @Mock
    private UploadService uploadService;

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
        assertThat(saved.getDeletedFor()).isNotNull();
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
    void findChatMessages_returnsMessagesForExistingChatFilteredForViewer() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.of("alice_bob"));

        ChatMessage visible = ChatMessage.builder().id("1").chatId("alice_bob").build();
        ChatMessage deletedForMe = ChatMessage.builder()
                .id("2").chatId("alice_bob").deletedFor(Set.of("bob")).build();
        ChatMessage deletedForEveryone = ChatMessage.builder()
                .id("3").chatId("alice_bob").deletedForEveryone(true).build();
        when(repository.findByChatId("alice_bob"))
                .thenReturn(List.of(visible, deletedForMe, deletedForEveryone));

        List<ChatMessage> messages = chatMessageService.findChatMessages("bob", "alice", "bob");

        assertThat(messages).containsExactly(visible);
        verify(repository).findByChatId(eq("alice_bob"));
    }

    @Test
    void findChatMessages_returnsEmptyListWhenChatDoesNotExist() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.empty());

        List<ChatMessage> messages = chatMessageService.findChatMessages("bob", "alice", "bob");

        assertThat(messages).isEmpty();
    }

    @Test
    void markMessagesAsRead_marksOnlyIncomingUnreadMessages() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.of("alice_bob"));

        ChatMessage unread = ChatMessage.builder()
                .id("1").chatId("alice_bob").senderId("alice").recipientId("bob")
                .readByRecipient(false).build();
        when(repository.findByChatIdAndReadByRecipientFalse("alice_bob")).thenReturn(List.of(unread));
        when(repository.save(unread)).thenReturn(unread);

        ChatMessage result = chatMessageService.markMessagesAsRead("alice", "bob", "bob");

        assertThat(result).isSameAs(unread);
        assertThat(unread.isReadByRecipient()).isTrue();
        verify(repository).save(unread);
    }

    @Test
    void markMessagesAsRead_returnsNullWhenReaderIsNotRecipient() {
        when(chatRoomService.getChatRoomId("alice", "bob", false))
                .thenReturn(Optional.of("alice_bob"));

        ChatMessage unread = ChatMessage.builder()
                .id("1").chatId("alice_bob").senderId("alice").recipientId("bob")
                .readByRecipient(false).build();
        when(repository.findByChatIdAndReadByRecipientFalse("alice_bob")).thenReturn(List.of(unread));

        ChatMessage result = chatMessageService.markMessagesAsRead("alice", "bob", "eve");

        assertThat(result).isNull();
        assertThat(unread.isReadByRecipient()).isFalse();
    }

    @Test
    void editMessage_updatesContentAndMarksEdited() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .readByRecipient(false).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        ChatMessage updated = chatMessageService.editMessage("1", "Hello edited", "alice", null);

        assertThat(updated.getContent()).isEqualTo("Hello edited");
        assertThat(updated.isEdited()).isTrue();
        verify(repository).save(message);
    }

    @Test
    void editMessage_allowsEditingAlreadyReadMessages() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .readByRecipient(true).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        ChatMessage updated = chatMessageService.editMessage("1", "New", "alice", null);

        assertThat(updated.getContent()).isEqualTo("New");
        assertThat(updated.isEdited()).isTrue();
    }

    @Test
    void editMessage_updatesAttachments() {
        ChatAttachment oldAttachment = ChatAttachment.builder()
                .url("/uploads/abc/old.jpg").build();
        ChatAttachment keptAttachment = ChatAttachment.builder()
                .url("/uploads/abc/kept.jpg").build();
        ChatAttachment newAttachment = ChatAttachment.builder()
                .url("/uploads/abc/new.jpg").build();
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .readByRecipient(true)
                .attachments(List.of(oldAttachment, keptAttachment)).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        ChatMessage updated = chatMessageService.editMessage(
                "1",
                "Edited",
                "alice",
                List.of(keptAttachment, newAttachment)
        );

        assertThat(updated.getAttachments()).containsExactly(keptAttachment, newAttachment);
        verify(uploadService).deleteByUrl("/uploads/abc/old.jpg");
    }

    @Test
    void editMessage_rejectsEmptyContentWithoutAttachments() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .readByRecipient(true).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));

        assertThatThrownBy(() -> chatMessageService.editMessage("1", "  ", "alice", List.of()))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void editMessage_rejectsNonSender() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello").build();
        when(repository.findById("1")).thenReturn(Optional.of(message));

        assertThatThrownBy(() -> chatMessageService.editMessage("1", "New", "bob", null))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void deleteForMe_addsUserToDeletedFor() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello").build();
        when(repository.findById("1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        ChatMessage updated = chatMessageService.deleteForMe("1", "bob");

        assertThat(updated.getDeletedFor()).contains("bob");
        verify(repository).save(message);
    }

    @Test
    void deleteForEveryone_marksMessageAndDeletesFiles() {
        ChatAttachment attachment = ChatAttachment.builder()
                .url("/uploads/abc/file.jpg").build();
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .attachments(List.of(attachment)).readByRecipient(false).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        ChatMessage updated = chatMessageService.deleteForEveryone("1", "alice");

        assertThat(updated.isDeletedForEveryone()).isTrue();
        verify(uploadService).deleteByUrl("/uploads/abc/file.jpg");
    }

    @Test
    void deleteForEveryone_rejectsWhenAlreadyRead() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello")
                .readByRecipient(true).build();
        when(repository.findById("1")).thenReturn(Optional.of(message));

        assertThatThrownBy(() -> chatMessageService.deleteForEveryone("1", "alice"))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void deleteForEveryone_rejectsNonSender() {
        ChatMessage message = ChatMessage.builder()
                .id("1").senderId("alice").recipientId("bob").content("Hello").build();
        when(repository.findById("1")).thenReturn(Optional.of(message));

        assertThatThrownBy(() -> chatMessageService.deleteForEveryone("1", "bob"))
                .isInstanceOf(ResponseStatusException.class);
    }
}