package com.em.emily.analytics.controller;

import com.em.emily.analytics.dto.AnalyticsStatsDto;
import com.em.emily.analytics.dto.EventRequest;
import com.em.emily.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Base64;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/stats")
    public ResponseEntity<AnalyticsStatsDto> getStats() {
        return ResponseEntity.ok(analyticsService.getStats());
    }

    @PostMapping("/events")
    public ResponseEntity<Void> recordExternalEvent(@RequestBody EventRequest request) {
        analyticsService.recordEvent(request.getEmailId(), request.getEventType(), request.getRecipient());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/track/open/{emailId}")
    public ResponseEntity<byte[]> trackOpen(@PathVariable Long emailId) {
        analyticsService.recordEvent(emailId, com.em.emily.analytics.EmailEventType.OPENED, "unknown");
        // Return 1x1 transparent GIF
        byte[] pixel = Base64.getDecoder().decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_GIF)
                .body(pixel);
    }

    @GetMapping("/track/click/{emailId}")
    public ResponseEntity<Void> trackClick(@PathVariable Long emailId, @RequestParam String url) {
        analyticsService.recordEvent(emailId, com.em.emily.analytics.EmailEventType.CLICKED, "unknown");
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(url))
                .build();
    }

    @GetMapping("/track/unsubscribe/{emailId}")
    public ResponseEntity<String> trackUnsubscribe(@PathVariable Long emailId) {
        analyticsService.recordEvent(emailId, com.em.emily.analytics.EmailEventType.UNSUBSCRIBED, "unknown");
        return ResponseEntity.ok("You have been unsubscribed successfully.");
    }
}
