package com.example.exam.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class RedisConfig implements CachingConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

    private GenericJackson2JsonRedisSerializer customJacksonSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        objectMapper.activateDefaultTyping(
            objectMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        return new GenericJackson2JsonRedisSerializer(objectMapper);
    }

    // ---------------------------------------------------------------
    // RedisTemplate (used only if Redis is available)
    // ---------------------------------------------------------------
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(customJacksonSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(customJacksonSerializer());
        template.afterPropertiesSet();
        return template;
    }

    // ---------------------------------------------------------------
    // CacheManager — tries Redis first, falls back to Caffeine
    // ---------------------------------------------------------------
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {

        // --- Attempt Redis connection ---
        try {
            // Eagerly test the connection. If Redis is down this throws immediately.
            connectionFactory.getConnection().ping();

            logger.info("✅ Redis is available — using RedisCacheManager");

            // Default TTL: 60 min for exams / leaderboard caches
            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(60))
                    .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(SerializationPair.fromSerializer(customJacksonSerializer()))
                    .disableCachingNullValues();

            // Dedicated TTL: 5 min for the "otps" cache
            RedisCacheConfiguration otpConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(5))
                    .serializeKeysWith(SerializationPair.fromSerializer(new StringRedisSerializer()))
                    .serializeValuesWith(SerializationPair.fromSerializer(customJacksonSerializer()))
                    .disableCachingNullValues();

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(defaultConfig)
                    .withCacheConfiguration("otps", otpConfig)
                    .build();

        } catch (Exception e) {
            // --- Redis unreachable → fall back to Caffeine (in-memory) ---
            logger.warn("⚠️  Redis is NOT available ({}). Falling back to Caffeine in-memory cache.", e.getMessage());
            logger.warn("⚠️  Caching will be in-memory only. App will function normally but without distributed caching.");

            CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();

            // Default spec: 60-min TTL for exams/leaderboard (matches Redis default)
            caffeineCacheManager.setCaffeine(
                    Caffeine.newBuilder()
                            .expireAfterWrite(60, TimeUnit.MINUTES)
                            .maximumSize(500)
            );

            // Pre-register the "otps" cache with its own 5-min TTL
            caffeineCacheManager.registerCustomCache("otps",
                    Caffeine.newBuilder()
                            .expireAfterWrite(5, TimeUnit.MINUTES)
                            .maximumSize(1000)
                            .build()
            );

            return caffeineCacheManager;
        }
    }

    // ---------------------------------------------------------------
    // CacheErrorHandler — silently handles mid-operation Redis errors
    // (Redis was up at startup but went down while running)
    // ---------------------------------------------------------------
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException ex, Cache cache, Object key) {
                logger.warn("⚠️  Redis GET error on cache '{}' for key '{}': {}", cache.getName(), key, ex.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException ex, Cache cache, Object key, Object value) {
                logger.warn("⚠️  Redis PUT error on cache '{}' for key '{}': {}", cache.getName(), key, ex.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException ex, Cache cache, Object key) {
                logger.warn("⚠️  Redis EVICT error on cache '{}' for key '{}': {}", cache.getName(), key, ex.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException ex, Cache cache) {
                logger.warn("⚠️  Redis CLEAR error on cache '{}': {}", cache.getName(), ex.getMessage());
            }
        };
    }
}
