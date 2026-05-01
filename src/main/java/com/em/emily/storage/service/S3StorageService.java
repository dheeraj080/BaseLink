package com.em.emily.storage.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;

@Service
@Profile("prod")
public class S3StorageService implements StorageService {

    private final S3Client s3Client;
    private final String bucketName;

    public S3StorageService(S3Client s3Client, 
                            @Value("${app.storage.s3.bucket-name}") String bucketName) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
    }

    @Override
    public String store(MultipartFile file) throws IOException {
        String key = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        
        s3Client.putObject(PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build(), 
                RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        
        return key;
    }

    @Override
    public File load(String identifier) {
        try {
            // Create a temporary file to hold the S3 object content
            File tempFile = File.createTempFile("emily-s3-", identifier);
            tempFile.deleteOnExit(); // Clean up on JVM exit
            
            s3Client.getObject(GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(identifier)
                    .build(), 
                    tempFile.toPath());
            
            return tempFile;
        } catch (IOException e) {
            throw new RuntimeException("Failed to load file from S3: " + identifier, e);
        }
    }

    @Override
    public void delete(String identifier) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(identifier)
                .build());
    }
}
