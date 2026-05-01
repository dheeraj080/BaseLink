package com.em.emily.storage.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.List;

public interface StorageService {
    /**
     * Stores a file and returns a unique identifier or path.
     */
    String store(MultipartFile file) throws IOException;

    /**
     * Resolves an identifier/path to a File object for processing.
     */
    File load(String identifier);

    /**
     * Deletes a file from storage.
     */
    void delete(String identifier);
}
