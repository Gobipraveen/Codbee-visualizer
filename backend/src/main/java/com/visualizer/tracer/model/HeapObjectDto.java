package com.visualizer.tracer.model;

import java.util.LinkedHashMap;
import java.util.Map;

public class HeapObjectDto {
    private String id;
    private String type;
    private Map<String, ValueDto> fields = new LinkedHashMap<>();

    public HeapObjectDto() {
    }

    public HeapObjectDto(String id, String type, Map<String, ValueDto> fields) {
        this.id = id;
        this.type = type;
        this.fields = fields;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, ValueDto> getFields() {
        return fields;
    }

    public void setFields(Map<String, ValueDto> fields) {
        this.fields = fields;
    }
}
