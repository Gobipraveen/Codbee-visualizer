package com.visualizer.tracer.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class TraceStep {
    private int step;
    private int line;
    private List<StackFrameDto> stack = new ArrayList<>();
    private Map<String, HeapObjectDto> heap = new LinkedHashMap<>();
    private String stdout;

    public TraceStep() {
    }

    public TraceStep(int step, int line, List<StackFrameDto> stack, Map<String, HeapObjectDto> heap, String stdout) {
        this.step = step;
        this.line = line;
        this.stack = stack;
        this.heap = heap;
        this.stdout = stdout;
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public List<StackFrameDto> getStack() {
        return stack;
    }

    public void setStack(List<StackFrameDto> stack) {
        this.stack = stack;
    }

    public Map<String, HeapObjectDto> getHeap() {
        return heap;
    }

    public void setHeap(Map<String, HeapObjectDto> heap) {
        this.heap = heap;
    }

    public String getStdout() {
        return stdout;
    }

    public void setStdout(String stdout) {
        this.stdout = stdout;
    }
}
