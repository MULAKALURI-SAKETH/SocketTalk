package com.saketh.talkloop.chat;

import java.util.List;

public record EditMessageRequest(String content, List<ChatAttachment> attachments, String userId) {
}