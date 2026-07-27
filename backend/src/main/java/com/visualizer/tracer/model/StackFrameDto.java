package com.visualizer.tracer.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class StackFrameDto {
    private String methodName;
    private String className;
    private int line;
    private Map<String, ValueDto> variables = new LinkedHashMap<>();

    public StackFrameDto() {
    }

    public StackFrameDto(String methodName, String className, int line, Map<String, ValueDto> variables) {
        this.methodName = methodName;
        this.className = className;
        this.line = line;
        this.variables = variables;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public Map<String, ValueDto> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, ValueDto> variables) {
        this.variables = variables;
    }
}
