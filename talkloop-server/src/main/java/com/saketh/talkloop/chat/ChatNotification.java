package com.saketh.talkloop.chat;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatNotification {
    private String id;
    private String senderId;
    private String recipientId;
    private String content;
    private List<ChatAttachment> attachments;
    private ChatNotificationType type;
    private boolean readByRecipient;
    private boolean edited;
    private boolean deletedForEveryone;
}
