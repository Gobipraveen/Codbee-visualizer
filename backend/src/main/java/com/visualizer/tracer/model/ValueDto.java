package com.visualizer.tracer.model;

public class ValueDto {
    private String type; // "primitive", "string", "reference", "null", "array"
    private String visualType; // "array", "map", "list", "linked_list", "tree_node", "string", etc.
    private Object value; // primitive value, string literal, or ref id (e.g. "ref_101")

    public ValueDto() {
    }

    public ValueDto(String type, Object value) {
        this.type = type;
        this.value = value;
    }

    public ValueDto(String type, String visualType, Object value) {
        this.type = type;
        this.visualType = visualType;
        this.value = value;
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

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}
