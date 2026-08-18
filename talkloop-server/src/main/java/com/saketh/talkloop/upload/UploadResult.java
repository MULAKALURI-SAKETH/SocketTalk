package com.saketh.talkloop.upload;

public record UploadResult(String url, String fileName, String contentType, long fileSize) {
}