package com.libranet.admin;

import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private long downloadCount;
    private String lastViewedResource;
    private boolean active;

    public AdminUserResponse() {}

    public String getLastViewedResource() { return lastViewedResource; }
    public void setLastViewedResource(String lastViewedResource) { this.lastViewedResource = lastViewedResource; }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public long getDownloadCount() { return downloadCount; }
    public void setDownloadCount(long downloadCount) { this.downloadCount = downloadCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
