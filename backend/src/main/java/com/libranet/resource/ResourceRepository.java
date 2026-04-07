package com.libranet.resource;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:query IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(r.author) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:categoryId IS NULL OR r.category.id = :categoryId)")
    Page<Resource> searchResources(
            @Param("query") String query,
            @Param("categoryId") Long categoryId,
            Pageable pageable);

    @Modifying
    @Query("UPDATE Resource r SET r.downloads = r.downloads + 1 WHERE r.id = :id")
    void incrementDownloads(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Resource r SET r.views = r.views + 1 WHERE r.id = :id")
    void incrementViews(@Param("id") Long id);

    @Query("SELECT r FROM Resource r WHERE r.uploadedBy.id = :userId")
    Page<Resource> findByUploadedById(@Param("userId") Long userId, Pageable pageable);
}
