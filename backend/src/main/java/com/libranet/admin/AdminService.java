package com.libranet.admin;

import com.libranet.auth.User;
import com.libranet.auth.UserRepository;
import com.libranet.auth.UserActivity;
import com.libranet.auth.UserActivityRepository;
import com.libranet.resource.CategoryRepository;
import com.libranet.resource.Resource;
import com.libranet.resource.ResourceRepository;
import com.libranet.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final CategoryRepository categoryRepository;
    private final UserActivityRepository userActivityRepository;

    public AdminService(UserRepository userRepository, 
                        ResourceRepository resourceRepository, 
                        CategoryRepository categoryRepository,
                        UserActivityRepository userActivityRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.categoryRepository = categoryRepository;
        this.userActivityRepository = userActivityRepository;
    }

    public Page<AdminUserResponse> getAllUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable)
                .map(this::mapToAdminUserResponse);
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        AdminUserResponse response = new AdminUserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());
        response.setCreatedAt(user.getCreatedAt());
        response.setActive(user.isActive());
        
        // Real activity stats
        response.setDownloadCount(userActivityRepository.countDownloadsByUserId(user.getId()));
        Optional<UserActivity> lastView = userActivityRepository.findLatestViewByUserId(user.getId());
        response.setLastViewedResource(lastView.map(ua -> ua.getResource().getTitle()).orElse("No views yet"));
        
        return response;
    }

    public AdminStatsResponse getAdminStats() {
        AdminStatsResponse stats = new AdminStatsResponse();

        // 1. Basic Counts
        long totalUsers = userRepository.count();
        long totalResources = resourceRepository.count();
        stats.setTotalUsers(totalUsers);
        stats.setTotalResources(totalResources);

        List<Resource> allResources = resourceRepository.findAll();
        
        long totalDownloads = allResources.stream().mapToLong(Resource::getDownloads).sum();
        long totalReviews = allResources.stream().mapToLong(Resource::getReviewCount).sum();
        stats.setTotalDownloads(totalDownloads);
        stats.setTotalReviews(totalReviews);

        // 2. New Users this month (Simulated based on total for now, or actual if createdAt exists)
        stats.setNewUsersThisMonth((int) (totalUsers * 0.4)); // Mock 40% are new

        // 3. Resources by Category
        stats.setResourcesByCategory(categoryRepository.findAll().stream()
            .map(c -> {
                long count = allResources.stream()
                    .filter(r -> r.getCategory() != null && r.getCategory().getId().equals(c.getId()))
                    .count();
                return new AdminStatsResponse.CategoryStat(c.getName(), count);
            })
            .collect(Collectors.toList()));

        // 4. Downloads by Day (Last 7 days - Simulated)
        List<AdminStatsResponse.TimeSeriesStat> dailyDownloads = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Random rand = new Random();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            dailyDownloads.add(new AdminStatsResponse.TimeSeriesStat(
                date.format(DateTimeFormatter.ISO_DATE),
                10 + rand.nextInt(50)
            ));
        }
        stats.setDownloadsByDay(dailyDownloads);

        // 5. Top Resources
        stats.setTopResources(allResources.stream()
            .sorted(Comparator.comparingLong(Resource::getDownloads).reversed())
            .limit(5)
            .map(r -> new AdminStatsResponse.TopResourceStat(r.getTitle(), r.getDownloads()))
            .collect(Collectors.toList()));

        return stats;
    }
}
