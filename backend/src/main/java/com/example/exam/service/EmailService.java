package com.example.exam.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("ExamHub - Password Reset OTP");
            helper.setText(buildOtpEmailHtml(otp), true);

            mailSender.send(message);
            logger.info("OTP email sent to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    private String buildOtpEmailHtml(String otp) {
        return """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0a1e; border-radius: 16px; color: #e2e0e8;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #a78bfa; font-size: 22px; margin: 0;">ExamHub</h1>
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
                    </div>
                    <div style="background: #1a1230; border: 1px solid #2d2640; border-radius: 12px; padding: 24px; text-align: center;">
                        <p style="color: #d1d5db; font-size: 14px; margin: 0 0 16px 0;">Use the following OTP to reset your password:</p>
                        <div style="background: #0f0a1e; border: 2px solid #7c3aed; border-radius: 10px; padding: 16px; display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 700; color: #a78bfa;">
                            %s
                        </div>
                        <p style="color: #9ca3af; font-size: 13px; margin-top: 16px;">This code expires in <strong style="color: #f59e0b;">5 minutes</strong>.</p>
                    </div>
                    <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
                </div>
                """.formatted(otp);
    }
}
