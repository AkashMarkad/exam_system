package com.example.exam.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 5;
    private final SecureRandom random = new SecureRandom();

    // In-memory store: email -> OtpEntry
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, LocalDateTime expiresAt) {}

    /**
     * Generates a 6-digit OTP, stores it with a 5-minute expiry, and returns it.
     */
    public String generateOtp(String email) {
        String otp = String.format("%06d", random.nextInt(1_000_000));
        otpStore.put(email.toLowerCase(), new OtpEntry(otp, LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES)));
        return otp;
    }

    /**
     * Validates the OTP for the given email.
     * Returns true if the OTP matches and has not expired.
     */
    public boolean validateOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email.toLowerCase());
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiresAt())) {
            otpStore.remove(email.toLowerCase());
            return false;
        }
        return entry.otp().equals(otp);
    }

    /**
     * Clears the OTP for the given email after successful use.
     */
    public void clearOtp(String email) {
        otpStore.remove(email.toLowerCase());
    }
}
