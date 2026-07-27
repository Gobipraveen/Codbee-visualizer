package com.visualizer.backend.dto;

import com.visualizer.tracer.model.TraceStep;

import java.util.ArrayList;
import java.util.List;

public class VisualizeResponse {
    private List<TraceStep> trace = new ArrayList<>();
    private String error;

    public VisualizeResponse() {
    }

    public VisualizeResponse(List<TraceStep> trace, String error) {
        this.trace = trace != null ? trace : new ArrayList<>();
        this.error = error;
    }

    public List<TraceStep> getTrace() {
        return trace;
    }

    public void setTrace(List<TraceStep> trace) {
        this.trace = trace;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
