package com.libranet.resource;

import org.springframework.http.ResponseEntity;
import com.libranet.auth.User;
import com.libranet.auth.UserActivity;
import com.libranet.auth.UserActivityRepository;
import com.libranet.exception.ResourceNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.libranet.file.FileService;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceRepository resourceRepository;
    private final UserActivityRepository userActivityRepository;
    private final FileService fileService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public ResourceController(ResourceService resourceService, 
                              ResourceRepository resourceRepository,
                              UserActivityRepository userActivityRepository,
                              FileService fileService,
                              CategoryRepository categoryRepository,
                              TagRepository tagRepository) {
        this.resourceService = resourceService;
        this.resourceRepository = resourceRepository;
        this.userActivityRepository = userActivityRepository;
        this.fileService = fileService;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Resource>> getAllResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resourceService.searchResources(search, categoryId, PageRequest.of(page, size), user));
    }


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> uploadResource(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "tagIds", required = false) List<Long> tagIds,
            @AuthenticationPrincipal User user) {

        // 1. Store the file
        String fileName = fileService.storeFile(file);

        // 2. Create the resource entity
        Resource resource = new Resource();
        resource.setTitle(title);
        resource.setDescription(description);
        resource.setFileName(fileName);
        
        // Store just the extension or simple type for cleaner filenames later
        String contentType = file.getContentType();
        String fileType = "bin";
        if (contentType != null && contentType.contains("/")) {
            fileType = contentType.split("/")[1];
        } else if (file.getOriginalFilename() != null && file.getOriginalFilename().contains(".")) {
            fileType = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1);
        }
        resource.setFileType(fileType);
        resource.setFileSize(file.getSize());
        resource.setUploadedBy(user);
        
        // Frontend expects fileUrl to be the download endpoint
        // This will be used in the iframe preview on ResourceDetailModal
        // We'll set it here, then update it with the ID after the first save, 
        // OR we can just use the pattern /api/files/download/{id}
        // Actually, the frontend hook useAdminResources expects the entity from the server.
        
        // 3. Set Category
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        resource.setCategory(category);

        // 4. Set Tags
        if (tagIds != null && !tagIds.isEmpty()) {
            Set<Tag> tags = new HashSet<>(tagRepository.findAllById(tagIds));
            resource.setTags(tags);
        }

        // 5. Save the resource
        Resource savedResource = resourceRepository.save(resource);
        
        // Update fileUrl with the real ID
        savedResource.setFileUrl("/api/files/download/" + savedResource.getId());
        savedResource = resourceRepository.save(savedResource);

        return ResponseEntity.ok(savedResource);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        // Log VIEW activity
        if (user != null) {
            userActivityRepository.save(new UserActivity(user, resource, UserActivity.ActivityType.VIEW));
        }

        return ResponseEntity.ok(resource);
    }
}
