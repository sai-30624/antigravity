package com.libranet.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dataSourceUrl;

    @Value("${spring.datasource.username:}")
    private String dataSourceUsername;

    @Value("${spring.datasource.password:}")
    private String dataSourcePassword;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        MysqlConnectionDetails connectionDetails = normalizeConnectionDetails(dataSourceUrl, dataSourceUsername, dataSourcePassword);

        dataSource.setJdbcUrl(connectionDetails.jdbcUrl());
        dataSource.setUsername(connectionDetails.username());
        dataSource.setPassword(connectionDetails.password());
        dataSource.setDriverClassName(driverClassName);

        return dataSource;
    }

    private MysqlConnectionDetails normalizeConnectionDetails(String url, String username, String password) {
        if (url == null || url.isBlank()) {
            return new MysqlConnectionDetails(url, username, password);
        }

        if (url.startsWith("jdbc:")) {
            return new MysqlConnectionDetails(url, username, password);
        }

        if (!url.startsWith("mysql://")) {
            return new MysqlConnectionDetails(url, username, password);
        }

        try {
            URI mysqlUri = new URI(url);
            String jdbcUrl = buildJdbcUrl(mysqlUri);
            String resolvedUsername = username.isBlank() ? extractUserInfo(mysqlUri, true) : username;
            String resolvedPassword = password.isBlank() ? extractUserInfo(mysqlUri, false) : password;
            return new MysqlConnectionDetails(jdbcUrl, resolvedUsername, resolvedPassword);
        } catch (URISyntaxException exception) {
            throw new IllegalArgumentException("Invalid MySQL connection URL: " + url, exception);
        }
    }

    private String buildJdbcUrl(URI mysqlUri) {
        StringBuilder jdbcUrl = new StringBuilder("jdbc:mysql://")
            .append(mysqlUri.getHost());

        if (mysqlUri.getPort() > 0) {
            jdbcUrl.append(":").append(mysqlUri.getPort());
        }

        if (mysqlUri.getPath() != null) {
            jdbcUrl.append(mysqlUri.getPath());
        }

        if (mysqlUri.getQuery() != null && !mysqlUri.getQuery().isBlank()) {
            jdbcUrl.append("?").append(mysqlUri.getQuery());
        }

        return jdbcUrl.toString();
    }

    private String extractUserInfo(URI mysqlUri, boolean username) {
        String userInfo = mysqlUri.getUserInfo();
        if (userInfo == null || userInfo.isBlank()) {
            return "";
        }

        int separatorIndex = userInfo.indexOf(':');
        if (username) {
            return separatorIndex >= 0 ? userInfo.substring(0, separatorIndex) : userInfo;
        }

        return separatorIndex >= 0 ? userInfo.substring(separatorIndex + 1) : "";
    }

    private record MysqlConnectionDetails(String jdbcUrl, String username, String password) {
    }
}