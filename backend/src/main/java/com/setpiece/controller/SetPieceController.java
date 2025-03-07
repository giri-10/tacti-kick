package com.setpiece.controller;

import com.setpiece.model.CornerKickRequest;
import com.setpiece.model.CornerKickResponse;
import com.setpiece.service.SetPieceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/set-pieces")
@CrossOrigin(origins = "http://localhost:3000")
public class SetPieceController {

    private final SetPieceService setPieceService;

    @Autowired
    public SetPieceController(SetPieceService setPieceService) {
        this.setPieceService = setPieceService;
    }

    @PostMapping("/corners/analyze")
    public ResponseEntity<CornerKickResponse> analyzeCornerKick(@RequestBody CornerKickRequest request) {
        CornerKickResponse analysis = setPieceService.analyzeCornerKick(request);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/corners/clusters")
    public ResponseEntity<byte[]> getCornerKickClusters() {
        byte[] visualization = setPieceService.getCornerKickVisualization();
        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .body(visualization);
    }
} 