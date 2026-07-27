package com.visualizer.backend.controller;

import com.visualizer.backend.dto.VisualizeRequest;
import com.visualizer.backend.dto.VisualizeResponse;
import com.visualizer.backend.service.VisualizeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
@RequestMapping("/api")
public class VisualizeController {

    private final VisualizeService visualizeService;

    public VisualizeController(VisualizeService visualizeService) {
        this.visualizeService = visualizeService;
    }

    @PostMapping("/visualize")
    public ResponseEntity<VisualizeResponse> visualize(@RequestBody VisualizeRequest request) {
        if (request == null || request.getCode() == null || request.getCode().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new VisualizeResponse(new ArrayList<>(), "Code cannot be empty"));
        }

        if (request.getCode().length() > 10000) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new VisualizeResponse(new ArrayList<>(), "Code exceeds maximum allowed length of 10,000 characters"));
        }

        VisualizeResponse response = visualizeService.visualize(request);
        return ResponseEntity.ok(response);
    }
}
