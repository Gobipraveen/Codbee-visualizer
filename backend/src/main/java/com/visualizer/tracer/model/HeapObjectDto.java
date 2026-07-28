package com.visualizer.tracer.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class HeapObjectDto {
    private String id;
    private String type;
    private String visualType;
    private Map<String, ValueDto> fields = new LinkedHashMap<>();
    private List<Object> elements = new ArrayList<>();

    public HeapObjectDto() {
    }

    public HeapObjectDto(String id, String type, String visualType, Map<String, ValueDto> fields, List<Object> elements) {
        this.id = id;
        this.type = type;
        this.visualType = visualType;
        this.fields = fields != null ? fields : new LinkedHashMap<>();
        this.elements = elements != null ? elements : new ArrayList<>();
    }

    public HeapObjectDto(String id, String type, Map<String, ValueDto> fields) {
        this(id, type, "object", fields, new ArrayList<>());
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

    public String getVisualType() {
        return visualType;
    }

    public void setVisualType(String visualType) {
        this.visualType = visualType;
    }

    public Map<String, ValueDto> getFields() {
        return fields;
    }

    public void setFields(Map<String, ValueDto> fields) {
        this.fields = fields;
    }

    public List<Object> getElements() {
        return elements;
    }

    public void setElements(List<Object> elements) {
        this.elements = elements;
    }
}
