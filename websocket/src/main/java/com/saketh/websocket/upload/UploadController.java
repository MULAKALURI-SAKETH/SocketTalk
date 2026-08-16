package com.saketh.websocket.upload;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping("/uploads")
    public ResponseEntity<UploadResult> upload(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(uploadService.store(file));
    }
}