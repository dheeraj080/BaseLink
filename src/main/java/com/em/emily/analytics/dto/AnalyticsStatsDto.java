package com.em.emily.analytics.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsStatsDto {
    // Raw Counts
    private long totalSent;
    private long totalDelivered;
    private long totalOpened;
    private long totalClicked;
    private long totalUnsubscribed;
    private long totalBounced;
    private long totalSpamComplaints;

    // Rates (Percentages)
    private double openRate;
    private double clickThroughRate;
    private double clickToOpenRate;
    private double unsubscribeRate;
    private double bounceRate;
    private double deliveryRate;
    private double spamComplaintRate;
}
