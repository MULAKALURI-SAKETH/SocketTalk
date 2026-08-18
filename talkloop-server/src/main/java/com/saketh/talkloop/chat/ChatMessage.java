package com.saketh.talkloop.chat;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class ChatMessage {

    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String recipientId;
    private String content;
    private List<ChatAttachment> attachments;
    private Date timestamp;
    private boolean readByRecipient;
    private boolean edited;
    private boolean deletedForEveryone;
    private Set<String> deletedFor;
}
