package com.em.emily.storage.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@Profile("!prod")
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    public FileSystemStorageService(
            @Value("${app.storage.local.path:/tmp/storage/scheduled_attachments}") String storagePath) {
        this.rootLocation = Paths.get(storagePath);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location: " + storagePath, e);
        }
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file.");
        }
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path destinationFile = this.rootLocation.resolve(fileName).normalize().toAbsolutePath();
        
        Files.copy(file.getInputStream(), destinationFile);
        return fileName; // Return just the filename as the identifier
    }

    @Override
    public File load(String identifier) {
        return rootLocation.resolve(identifier).toFile();
    }

    @Override
    public void delete(String identifier) {
        try {
            Files.deleteIfExists(rootLocation.resolve(identifier));
        } catch (IOException e) {
            // Log error but don't fail
            System.err.println("Failed to delete file: " + identifier);
        }
    }
}
