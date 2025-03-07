package com.setpiece.model;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class CornerKickResponse {
    private double overallSuccessRate;
    private int totalCorners;
    private List<ClusterStats> clusters;
    private Map<String, PlayerStats> playerStats;
    private Recommendation recommendation;

    @Data
    public static class ClusterStats {
        private int clusterId;
        private double successRate;
        private int count;
        private double[] centroid;
        private String description;
    }

    @Data
    public static class PlayerStats {
        private String name;
        private int totalCorners;
        private double successRate;
        private String preferredZone;
    }

    @Data
    public static class Recommendation {
        private String strategy;
        private String taker;
        private String targetPlayer;
        private String targetZone;
        private double expectedSuccessRate;
        private String reasoning;
    }
} 