package com.libranet.admin;

import java.util.List;

public class AdminStatsResponse {
    private long totalResources;
    private long totalUsers;
    private long totalDownloads;
    private long totalReviews;
    private int newUsersThisMonth;
    private List<CategoryStat> resourcesByCategory;
    private List<TimeSeriesStat> downloadsByDay;
    private List<TopResourceStat> topResources;

    // Getters and Setters
    public long getTotalResources() { return totalResources; }
    public void setTotalResources(long totalResources) { this.totalResources = totalResources; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalDownloads() { return totalDownloads; }
    public void setTotalDownloads(long totalDownloads) { this.totalDownloads = totalDownloads; }

    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }

    public int getNewUsersThisMonth() { return newUsersThisMonth; }
    public void setNewUsersThisMonth(int newUsersThisMonth) { this.newUsersThisMonth = newUsersThisMonth; }

    public List<CategoryStat> getResourcesByCategory() { return resourcesByCategory; }
    public void setResourcesByCategory(List<CategoryStat> resourcesByCategory) { this.resourcesByCategory = resourcesByCategory; }

    public List<TimeSeriesStat> getDownloadsByDay() { return downloadsByDay; }
    public void setDownloadsByDay(List<TimeSeriesStat> downloadsByDay) { this.downloadsByDay = downloadsByDay; }

    public List<TopResourceStat> getTopResources() { return topResources; }
    public void setTopResources(List<TopResourceStat> topResources) { this.topResources = topResources; }

    // Static Inner Classes for Stats
    public static class CategoryStat {
        private String name;
        private long count;
        public CategoryStat(String name, long count) { this.name = name; this.count = count; }
        public String getName() { return name; }
        public long getCount() { return count; }
    }

    public static class TimeSeriesStat {
        private String date;
        private long count;
        public TimeSeriesStat(String date, long count) { this.date = date; this.count = count; }
        public String getDate() { return date; }
        public long getCount() { return count; }
    }

    public static class TopResourceStat {
        private String title;
        private long downloads;
        public TopResourceStat(String title, long downloads) { this.title = title; this.downloads = downloads; }
        public String getTitle() { return title; }
        public long getDownloads() { return downloads; }
    }
}
