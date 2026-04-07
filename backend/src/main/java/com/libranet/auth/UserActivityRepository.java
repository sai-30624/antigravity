package com.libranet.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    @Query("SELECT COUNT(ua) FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = 'DOWNLOAD'")
    long countDownloadsByUserId(@Param("userId") Long userId);

    @Query("SELECT ua FROM UserActivity ua WHERE ua.user.id = :userId AND ua.activityType = 'VIEW' ORDER BY ua.timestamp DESC LIMIT 1")
    Optional<UserActivity> findLatestViewByUserId(@Param("userId") Long userId);

    List<UserActivity> findByUserIdOrderByTimestampDesc(Long userId);
}
