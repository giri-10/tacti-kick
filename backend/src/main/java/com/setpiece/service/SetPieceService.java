package com.setpiece.service;

import com.setpiece.model.CornerKickRequest;
import com.setpiece.model.CornerKickResponse;
import com.setpiece.model.CornerKickResponse.*;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
public class SetPieceService {

    public CornerKickResponse analyzeCornerKick(CornerKickRequest request) {
        // This would normally call our Python analysis script and process the results
        // For now, we'll return sample data
        CornerKickResponse response = new CornerKickResponse();
        
        // Set overall stats
        response.setOverallSuccessRate(0.32);
        response.setTotalCorners(245);
        
        // Create cluster stats
        List<ClusterStats> clusters = new ArrayList<>();
        ClusterStats cluster1 = new ClusterStats();
        cluster1.setClusterId(0);
        cluster1.setSuccessRate(0.45);
        cluster1.setCount(85);
        cluster1.setCentroid(new double[]{80.5, 45.2});
        cluster1.setDescription("Near-post runs with first-time shots");
        clusters.add(cluster1);
        
        ClusterStats cluster2 = new ClusterStats();
        cluster2.setClusterId(1);
        cluster2.setSuccessRate(0.28);
        cluster2.setCount(160);
        cluster2.setCentroid(new double[]{75.8, 32.1});
        cluster2.setDescription("Far-post headers");
        clusters.add(cluster2);
        
        response.setClusters(clusters);
        
        // Create player stats
        Map<String, PlayerStats> playerStats = new HashMap<>();
        
        PlayerStats taker = new PlayerStats();
        taker.setName(request.getTaker());
        taker.setTotalCorners(120);
        taker.setSuccessRate(0.35);
        taker.setPreferredZone("Near Post");
        playerStats.put(request.getTaker(), taker);
        
        PlayerStats target = new PlayerStats();
        target.setName(request.getTargetPlayer());
        target.setTotalCorners(85);
        target.setSuccessRate(0.42);
        target.setPreferredZone("Far Post");
        playerStats.put(request.getTargetPlayer(), target);
        
        response.setPlayerStats(playerStats);
        
        // Create recommendation
        Recommendation recommendation = new Recommendation();
        recommendation.setStrategy("Near Post Run");
        recommendation.setTaker(request.getTaker());
        recommendation.setTargetPlayer(request.getTargetPlayer());
        recommendation.setTargetZone("Near Post (Cluster 0)");
        recommendation.setExpectedSuccessRate(0.45);
        recommendation.setReasoning(
            String.format("Based on %s's high success rate (35%%) with near-post deliveries " +
                        "and %s's strong conversion rate in this zone (42%%), " +
                        "a near-post strategy is recommended.", 
                        request.getTaker(), request.getTargetPlayer())
        );
        
        response.setRecommendation(recommendation);
        
        return response;
    }

    public byte[] getCornerKickVisualization() {
        try {
            // In a real implementation, this would load the latest visualization
            // For now, we'll return a placeholder image
            Path imagePath = Paths.get("output/corner_clusters.png");
            if (Files.exists(imagePath)) {
                return Files.readAllBytes(imagePath);
            }
            
            // Return a default image if the analysis hasn't been run
            return new ClassPathResource("static/default_visualization.png")
                    .getInputStream()
                    .readAllBytes();
        } catch (IOException e) {
            throw new RuntimeException("Failed to load visualization", e);
        }
    }
} 