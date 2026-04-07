package com.libranet.resource;

import com.libranet.exception.ResourceNotFoundException;
import com.libranet.auth.Bookmark;
import com.libranet.auth.BookmarkRepository;
import com.libranet.auth.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final BookmarkRepository bookmarkRepository;

    public ResourceService(ResourceRepository resourceRepository, 
                           CategoryRepository categoryRepository, 
                           TagRepository tagRepository,
                           BookmarkRepository bookmarkRepository) {
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    public Page<Resource> searchResources(String query, Long categoryId, Pageable pageable, User user) {
        Page<Resource> resources = resourceRepository.searchResources(query, categoryId, pageable);
        if (user != null) {
            Set<Long> bookmarkedIds = bookmarkRepository.findByUserId(user.getId())
                    .stream()
                    .map(b -> b.getResource().getId())
                    .collect(Collectors.toSet());
            resources.forEach(r -> r.setBookmarked(bookmarkedIds.contains(r.getId())));
        }
        return resources;
    }

    public Page<Resource> searchResources(String query, Long categoryId, Pageable pageable) {
        return searchResources(query, categoryId, pageable, null);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }
}
