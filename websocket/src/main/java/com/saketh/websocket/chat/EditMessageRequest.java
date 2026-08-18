package com.saketh.websocket.chat;

import java.util.List;

public record EditMessageRequest(String content, List<ChatAttachment> attachments, String userId) {
}