package com.visualizer.tracer.model;

public class ValueDto {
    private String type; // "primitive", "string", "reference", "null", "array"
    private Object value; // primitive value, string literal, or ref id (e.g. "ref_101")

    public ValueDto() {
    }

    public ValueDto(String type, Object value) {
        this.type = type;
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
