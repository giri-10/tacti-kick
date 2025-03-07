package com.setpiece.model;

import lombok.Data;

@Data
public class CornerKickRequest {
    private String team;
    private String opponent;
    private String taker;
    private String targetPlayer;
    private Integer competitionId;
    private Integer seasonId;
} 