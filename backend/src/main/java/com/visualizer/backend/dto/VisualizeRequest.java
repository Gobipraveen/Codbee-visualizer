package com.visualizer.backend.dto;

public class VisualizeRequest {
    private String language;
    private String code;
    private String className;

    public VisualizeRequest() {
    }

    public VisualizeRequest(String language, String code, String className) {
        this.language = language;
        this.code = code;
        this.className = className;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}
