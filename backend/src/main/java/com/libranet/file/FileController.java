package com.libranet.file;

import com.libranet.resource.ResourceRepository;
import com.libranet.exception.ResourceNotFoundException;
import com.libranet.auth.User;
import com.libranet.auth.UserActivity;
import com.libranet.auth.UserActivityRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final ResourceRepository resourceRepository;
    private final UserActivityRepository userActivityRepository;

    public FileController(FileService fileService, 
                          ResourceRepository resourceRepository,
                          UserActivityRepository userActivityRepository) {
        this.fileService = fileService;
        this.resourceRepository = resourceRepository;
        this.userActivityRepository = userActivityRepository;
    }

    @GetMapping("/download/{resourceId}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(
            @PathVariable Long resourceId, 
            HttpServletRequest request,
            @AuthenticationPrincipal User user) {
        com.libranet.resource.Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getFileName() == null) {
            throw new ResourceNotFoundException("File not found for this resource");
        }

        org.springframework.core.io.Resource springResource = fileService.loadFileAsResource(resource.getFileName());

        // Increment download count
        resource.setDownloads(resource.getDownloads() + 1);
        resourceRepository.save(resource);

        // Log User Activity
        if (user != null) {
            userActivityRepository.save(new UserActivity(user, resource, UserActivity.ActivityType.DOWNLOAD));
        }

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(springResource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // Default content type if not determinable
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        // Determine download filename (Resource Title + Extension)
        String extension = "";
        String fileType = resource.getFileType();
        
        if (fileType != null) {
            if (fileType.contains("/")) {
                extension = "." + fileType.split("/")[1];
            } else {
                extension = fileType.startsWith(".") ? fileType : "." + fileType;
            }
        }
        
        if ((extension.equals(".") || extension.isEmpty()) && resource.getFileName() != null && resource.getFileName().contains(".")) {
            extension = resource.getFileName().substring(resource.getFileName().lastIndexOf("."));
        }

        String safeTitle = resource.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_");
        String downloadName = safeTitle.toLowerCase().endsWith(extension.toLowerCase()) ? safeTitle : safeTitle + extension;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                .body(springResource);
    }
}
