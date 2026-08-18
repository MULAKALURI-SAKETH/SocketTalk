package com.saketh.talkloop.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatAttachment {
    private String url;
    private String fileName;
    private String contentType;
    private long fileSize;
}