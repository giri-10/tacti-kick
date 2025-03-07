package com.setpiece.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "set_pieces")
public class SetPiece {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // CORNER_KICK, FREE_KICK, PENALTY

    @Column(nullable = false)
    private String matchId;

    @Column(nullable = false)
    private String competition;

    @Column(nullable = false)
    private String season;

    @Column(nullable = false)
    private String team;

    private String taker;

    private String receiver;

    @Column(name = "start_x")
    private Double startX;

    @Column(name = "start_y")
    private Double startY;

    @Column(name = "end_x")
    private Double endX;

    @Column(name = "end_y")
    private Double endY;

    private String outcome; // GOAL, SHOT, CLEARANCE, etc.

    private LocalDateTime timestamp;

    @Column(columnDefinition = "jsonb")
    private String playerPositions; // JSON string of player positions

    private Double xG; // Expected goals value

    @Column(name = "is_successful")
    private Boolean isSuccessful;

    private String notes;
} 