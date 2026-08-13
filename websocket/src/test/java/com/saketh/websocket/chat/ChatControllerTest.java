package com.saketh.websocket.chat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ChatMessageService chatMessageService;

    @MockitoBean
    private SimpMessagingTemplate messagingTemplate;

    @Test
    void findChatMessages_returnsHistoryBetweenUsers() throws Exception {
        ChatMessage message = ChatMessage.builder()
                .id("m1")
                .chatId("alice_bob")
                .senderId("alice")
                .recipientId("bob")
                .content("Hello")
                .timestamp(new Date(123456789L))
                .build();

        when(chatMessageService.findChatMessages(anyString(), anyString()))
                .thenReturn(List.of(message));

        mockMvc.perform(get("/messages/alice/bob"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("m1"))
                .andExpect(jsonPath("$[0].chatId").value("alice_bob"))
                .andExpect(jsonPath("$[0].senderId").value("alice"))
                .andExpect(jsonPath("$[0].recipientId").value("bob"))
                .andExpect(jsonPath("$[0].content").value("Hello"));
    }

    @Test
    void findChatMessages_returnsEmptyArrayWhenNoHistory() throws Exception {
        when(chatMessageService.findChatMessages(anyString(), anyString()))
                .thenReturn(List.of());

        mockMvc.perform(get("/messages/alice/bob"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}