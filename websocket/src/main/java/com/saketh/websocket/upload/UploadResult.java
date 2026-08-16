package com.saketh.websocket.upload;

public record UploadResult(String url, String fileName, String contentType, long fileSize) {
}