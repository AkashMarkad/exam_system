package com.example.exam.service;

import java.security.SecureRandom;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

/**
 * OtpService stores OTPs using Spring's CacheManager abstraction.
 *
 * This means the service is NOT tightly coupled to Redis. The underlying
 * store is determined by the configured CacheManager bean:
 *  - If Redis is running: OTPs are stored in Redis (via RedisCacheManager).
 *  - If Redis is down:    Spring's CacheErrorHandler silently swallows the
 *                         error, the put/get returns null, and no exception
 *                         is thrown to the caller.
 *
 * The "otps" cache is configured with a 5-minute TTL in RedisConfig.
 */
@Service
public class OtpService {

    private static final String CACHE_NAME = "otps";
    private final SecureRandom random = new SecureRandom();

    // Spring Cache abstraction — no direct Redis dependency here
    private final CacheManager cacheManager;

    public OtpService(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Generates a 6-digit OTP, stores it in the "otps" cache, and returns it.
     * TTL is controlled by the CacheManager configuration (5 minutes).
     */
    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.put(email.toLowerCase(), otp);
        }
        return otp;
    }

    /**
     * Validates the OTP for the given email.
     * Returns true if the OTP is present in cache and matches.
     */
    public boolean validateOtp(String email, String otp) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache == null) return false;
        Cache.ValueWrapper wrapper = cache.get(email.toLowerCase());
        return wrapper != null && otp.equals(wrapper.get());
    }

    /**
     * Clears the OTP for the given email after successful use.
     */
    public void clearOtp(String email) {
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.evict(email.toLowerCase());
        }
    }
}
