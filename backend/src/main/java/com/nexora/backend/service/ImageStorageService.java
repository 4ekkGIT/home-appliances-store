package com.nexora.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class ImageStorageService {
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;

    private final Path storagePath;

    public ImageStorageService(@Value("${app.image-storage-path:./data/uploads}") String storagePath) {
        this.storagePath = Path.of(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storagePath);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not create image storage directory", exception);
        }
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An image file is required");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatusCode.valueOf(413), "Image must be 10 MB or smaller");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the uploaded image", exception);
        }

        String extension = detectExtension(content);
        String fileName = UUID.randomUUID() + extension;
        try {
            Files.write(storagePath.resolve(fileName), content);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not save uploaded image", exception);
        }
        return "/api/media/images/" + fileName;
    }

    public void delete(String imageUrl) {
        String fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path file = storagePath.resolve(fileName).normalize();
        if (!file.getParent().equals(storagePath)) return;
        try {
            Files.deleteIfExists(file);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not remove uploaded image", exception);
        }
    }

    public Path getStoragePath() {
        return storagePath;
    }

    private String detectExtension(byte[] content) {
        if (content.length >= 8
                && content[0] == (byte) 0x89 && content[1] == 0x50 && content[2] == 0x4e
                && content[3] == 0x47 && content[4] == 0x0d && content[5] == 0x0a
                && content[6] == 0x1a && content[7] == 0x0a) return ".png";
        if (content.length >= 3 && content[0] == (byte) 0xff
                && content[1] == (byte) 0xd8 && content[2] == (byte) 0xff) return ".jpg";
        if (content.length >= 6 && content[0] == 'G' && content[1] == 'I'
                && content[2] == 'F' && content[3] == '8'
                && (content[4] == '7' || content[4] == '9') && content[5] == 'a') return ".gif";
        if (content.length >= 12 && content[0] == 'R' && content[1] == 'I'
                && content[2] == 'F' && content[3] == 'F' && content[8] == 'W'
                && content[9] == 'E' && content[10] == 'B' && content[11] == 'P') return ".webp";
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only valid PNG, JPEG, GIF, and WebP images are supported");
    }
}