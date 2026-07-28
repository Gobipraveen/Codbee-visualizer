package com.visualizer.tracer;

import com.sun.jdi.ArrayReference;
import com.sun.jdi.BooleanValue;
import com.sun.jdi.ByteValue;
import com.sun.jdi.CharValue;
import com.sun.jdi.DoubleValue;
import com.sun.jdi.Field;
import com.sun.jdi.FloatValue;
import com.sun.jdi.IntegerValue;
import com.sun.jdi.LongValue;
import com.sun.jdi.ObjectReference;
import com.sun.jdi.PrimitiveValue;
import com.sun.jdi.ReferenceType;
import com.sun.jdi.ShortValue;
import com.sun.jdi.StringReference;
import com.sun.jdi.Value;
import com.visualizer.tracer.model.HeapObjectDto;
import com.visualizer.tracer.model.ValueDto;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class HeapInspector {

    public static ValueDto inspectValue(Value value, Map<String, HeapObjectDto> heapMap) {
        if (value == null) {
            return new ValueDto("null", null, null);
        }

        if (value instanceof PrimitiveValue pv) {
            return new ValueDto("primitive", null, extractPrimitive(pv));
        }

        if (value instanceof StringReference sr) {
            return new ValueDto("string", "string", sr.value());
        }

        if (value instanceof ArrayReference ar) {
            String refId = "ref_" + ar.uniqueID();
            if (!heapMap.containsKey(refId)) {
                HeapObjectDto arrayObj = new HeapObjectDto();
                arrayObj.setId(refId);
                arrayObj.setType(ar.referenceType().name());
                arrayObj.setVisualType("array");
                heapMap.put(refId, arrayObj);

                List<Value> elements = ar.getValues();
                List<Object> elementDtos = new ArrayList<>();
                for (int i = 0; i < elements.size(); i++) {
                    Value elementValue = elements.get(i);
                    ValueDto elementDto = inspectValue(elementValue, heapMap);
                    arrayObj.getFields().put("[" + i + "]", elementDto);
                    elementDtos.add(elementDto);
                }
                arrayObj.setElements(elementDtos);
            }
            return new ValueDto("reference", "array", refId);
        }

        if (value instanceof ObjectReference objRef) {
            String refId = "ref_" + objRef.uniqueID();
            String className = objRef.referenceType().name();

            if (!heapMap.containsKey(refId)) {
                HeapObjectDto heapObj = new HeapObjectDto();
                heapObj.setId(refId);
                heapObj.setType(className);
                heapMap.put(refId, heapObj); // put first to break cycles

                classifyAndExtract(objRef, heapObj, heapMap);
            }

            HeapObjectDto existing = heapMap.get(refId);
            String visualType = existing != null ? existing.getVisualType() : "object";
            return new ValueDto("reference", visualType, refId);
        }

        return new ValueDto("unknown", null, value.toString());
    }

    private static void classifyAndExtract(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        ReferenceType refType = objRef.referenceType();
        String className = refType.name();

        // 1. User-defined custom classes (not in java.* / javax.* / sun.* / jdk.*)
        if (!className.startsWith("java.") && !className.startsWith("javax.") && !className.startsWith("sun.") && !className.startsWith("jdk.")) {
            int selfRefFieldsCount = countSelfReferencingFields(refType);
            if (selfRefFieldsCount == 1) {
                heapObj.setVisualType("linked_list");
            } else if (selfRefFieldsCount >= 2) {
                heapObj.setVisualType("tree_node");
            } else {
                heapObj.setVisualType("object");
            }
            extractFields(objRef, heapObj, heapMap);
            return;
        }

        // 2. Primitive Wrappers
        if (isPrimitiveWrapper(className)) {
            heapObj.setVisualType("primitive_wrapper");
            extractFields(objRef, heapObj, heapMap);
            return;
        }

        // 3. StringBuilder / StringBuffer
        if (className.equals("java.lang.StringBuilder") || className.equals("java.lang.StringBuffer")) {
            heapObj.setVisualType("string_builder");
            String text = extractStringBuilderText(objRef);
            if (text != null) {
                heapObj.getElements().add(new ValueDto("string", "string", text));
            }
            return;
        }

        // 4. Map implementations
        if (isMap(refType)) {
            heapObj.setVisualType("map");
            extractMapElements(objRef, heapObj, heapMap);
            return;
        }

        // 5. Set implementations
        if (isSet(refType)) {
            heapObj.setVisualType("set");
            extractSetElements(objRef, heapObj, heapMap);
            return;
        }

        // 6. Stack / Queue / Deque / List
        if (className.equals("java.util.Stack")) {
            heapObj.setVisualType("stack");
            extractListOrStackElements(objRef, heapObj, heapMap);
            return;
        }

        if (className.equals("java.util.ArrayDeque")) {
            heapObj.setVisualType("deque");
            extractArrayDequeElements(objRef, heapObj, heapMap);
            return;
        }

        if (isQueue(refType)) {
            heapObj.setVisualType("queue");
            extractListOrStackElements(objRef, heapObj, heapMap);
            return;
        }

        if (isList(refType)) {
            heapObj.setVisualType("list");
            extractListOrStackElements(objRef, heapObj, heapMap);
            return;
        }

        // Default fallback
        heapObj.setVisualType("object");
        extractFields(objRef, heapObj, heapMap);
    }

    private static void extractFields(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        try {
            List<Field> fields = objRef.referenceType().allFields();
            for (Field field : fields) {
                if (!field.isStatic() && !field.isSynthetic()) {
                    try {
                        Value fieldValue = objRef.getValue(field);
                        ValueDto fieldDto = inspectValue(fieldValue, heapMap);
                        heapObj.getFields().put(field.name(), fieldDto);
                    } catch (Exception ignored) {
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static int countSelfReferencingFields(ReferenceType refType) {
        int count = 0;
        try {
            String typeName = refType.name().replace('$', '.');
            for (Field field : refType.fields()) {
                if (!field.isStatic()) {
                    String fieldTypeName = field.typeName().replace('$', '.');
                    if (fieldTypeName.equals(typeName) ||
                        typeName.endsWith("." + fieldTypeName)) {
                        count++;
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return count;
    }

    private static boolean isPrimitiveWrapper(String className) {
        return className.equals("java.lang.Integer") ||
               className.equals("java.lang.Long") ||
               className.equals("java.lang.Double") ||
               className.equals("java.lang.Float") ||
               className.equals("java.lang.Boolean") ||
               className.equals("java.lang.Character") ||
               className.equals("java.lang.Byte") ||
               className.equals("java.lang.Short");
    }

    private static boolean isMap(ReferenceType refType) {
        String name = refType.name();
        return name.startsWith("java.util.") && (
               name.endsWith("Map") ||
               implementsInterface(refType, "java.util.Map"));
    }

    private static boolean isSet(ReferenceType refType) {
        String name = refType.name();
        return name.startsWith("java.util.") && (
               name.endsWith("Set") ||
               implementsInterface(refType, "java.util.Set"));
    }

    private static boolean isList(ReferenceType refType) {
        String name = refType.name();
        return name.startsWith("java.util.") && (
               name.endsWith("List") ||
               name.equals("java.util.Vector") ||
               implementsInterface(refType, "java.util.List"));
    }

    private static boolean isQueue(ReferenceType refType) {
        String name = refType.name();
        return name.startsWith("java.util.") && (
               name.endsWith("Queue") ||
               implementsInterface(refType, "java.util.Queue"));
    }

    private static boolean implementsInterface(ReferenceType refType, String interfaceName) {
        try {
            if (refType.name().equals(interfaceName)) return true;
            if (refType instanceof com.sun.jdi.ClassType classType) {
                for (com.sun.jdi.InterfaceType iface : classType.allInterfaces()) {
                    if (iface.name().equals(interfaceName)) return true;
                }
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private static Field getFieldByName(ReferenceType refType, String fieldName) {
        try {
            for (Field f : refType.allFields()) {
                if (f.name().equals(fieldName)) return f;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static void extractMapElements(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        try {
            ReferenceType refType = objRef.referenceType();
            Field tableField = getFieldByName(refType, "table");

            if (tableField != null) {
                Value tableVal = objRef.getValue(tableField);
                if (tableVal instanceof ArrayReference tableArray) {
                    for (Value nodeVal : tableArray.getValues()) {
                        if (nodeVal instanceof ObjectReference currNode) {
                            while (currNode != null) {
                                ReferenceType nodeType = currNode.referenceType();
                                Field keyField = getFieldByName(nodeType, "key");
                                Field valField = getFieldByName(nodeType, "value");
                                Field nextField = getFieldByName(nodeType, "next");

                                if (keyField != null && valField != null) {
                                    Value kVal = currNode.getValue(keyField);
                                    Value vVal = currNode.getValue(valField);

                                    Map<String, ValueDto> pair = new LinkedHashMap<>();
                                    pair.put("key", inspectValue(kVal, heapMap));
                                    pair.put("value", inspectValue(vVal, heapMap));
                                    heapObj.getElements().add(pair);
                                }

                                if (nextField != null) {
                                    Value nextVal = currNode.getValue(nextField);
                                    currNode = nextVal instanceof ObjectReference ? (ObjectReference) nextVal : null;
                                } else {
                                    currNode = null;
                                }
                            }
                        }
                    }
                    return;
                }
            }

            // TreeMap root traversal
            Field rootField = getFieldByName(refType, "root");
            if (rootField != null) {
                Value rootVal = objRef.getValue(rootField);
                if (rootVal instanceof ObjectReference rootNode) {
                    traverseTreeMapNode(rootNode, heapObj, heapMap);
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static void traverseTreeMapNode(ObjectReference node, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        if (node == null) return;
        try {
            ReferenceType nodeType = node.referenceType();
            Field leftField = getFieldByName(nodeType, "left");
            Field rightField = getFieldByName(nodeType, "right");
            Field keyField = getFieldByName(nodeType, "key");
            Field valField = getFieldByName(nodeType, "value");

            if (leftField != null) {
                Value leftVal = node.getValue(leftField);
                if (leftVal instanceof ObjectReference leftNode) traverseTreeMapNode(leftNode, heapObj, heapMap);
            }

            if (keyField != null && valField != null) {
                Value kVal = node.getValue(keyField);
                Value vVal = node.getValue(valField);
                Map<String, ValueDto> pair = new LinkedHashMap<>();
                pair.put("key", inspectValue(kVal, heapMap));
                pair.put("value", inspectValue(vVal, heapMap));
                heapObj.getElements().add(pair);
            }

            if (rightField != null) {
                Value rightVal = node.getValue(rightField);
                if (rightVal instanceof ObjectReference rightNode) traverseTreeMapNode(rightNode, heapObj, heapMap);
            }
        } catch (Exception ignored) {
        }
    }

    private static void extractSetElements(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        try {
            ReferenceType refType = objRef.referenceType();
            Field mapField = getFieldByName(refType, "map");
            if (mapField == null) mapField = getFieldByName(refType, "m");

            if (mapField != null) {
                Value mapVal = objRef.getValue(mapField);
                if (mapVal instanceof ObjectReference mapObj) {
                    HeapObjectDto tempMapObj = new HeapObjectDto();
                    extractMapElements(mapObj, tempMapObj, heapMap);
                    for (Object entryObj : tempMapObj.getElements()) {
                        if (entryObj instanceof Map<?, ?> pairMap) {
                            Object keyObj = pairMap.get("key");
                            if (keyObj != null) {
                                heapObj.getElements().add(keyObj);
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static void extractListOrStackElements(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        try {
            ReferenceType refType = objRef.referenceType();

            // ArrayList / Vector / Stack (elementData & size)
            Field elementDataField = getFieldByName(refType, "elementData");
            Field sizeField = getFieldByName(refType, "size");
            if (sizeField == null) sizeField = getFieldByName(refType, "elementCount");

            if (elementDataField != null) {
                Value dataVal = objRef.getValue(elementDataField);
                if (dataVal instanceof ArrayReference arrayRef) {
                    int size = arrayRef.length();
                    if (sizeField != null) {
                        Value sizeVal = objRef.getValue(sizeField);
                        if (sizeVal instanceof IntegerValue iv) size = iv.value();
                    }
                    for (int i = 0; i < size; i++) {
                        Value elemVal = arrayRef.getValue(i);
                        heapObj.getElements().add(inspectValue(elemVal, heapMap));
                    }
                    return;
                }
            }

            // LinkedList (first & next)
            Field firstField = getFieldByName(refType, "first");
            if (firstField != null) {
                Value firstVal = objRef.getValue(firstField);
                if (firstVal instanceof ObjectReference node) {
                    while (node != null) {
                        ReferenceType nodeType = node.referenceType();
                        Field itemField = getFieldByName(nodeType, "item");
                        Field nextField = getFieldByName(nodeType, "next");

                        if (itemField != null) {
                            Value itemVal = node.getValue(itemField);
                            heapObj.getElements().add(inspectValue(itemVal, heapMap));
                        }

                        if (nextField != null) {
                            Value nextVal = node.getValue(nextField);
                            node = nextVal instanceof ObjectReference ? (ObjectReference) nextVal : null;
                        } else {
                            node = null;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static void extractArrayDequeElements(ObjectReference objRef, HeapObjectDto heapObj, Map<String, HeapObjectDto> heapMap) {
        try {
            ReferenceType refType = objRef.referenceType();
            Field elementsField = getFieldByName(refType, "elements");
            Field headField = getFieldByName(refType, "head");
            Field tailField = getFieldByName(refType, "tail");

            if (elementsField != null && headField != null && tailField != null) {
                Value elemsVal = objRef.getValue(elementsField);
                Value headVal = objRef.getValue(headField);
                Value tailVal = objRef.getValue(tailField);

                if (elemsVal instanceof ArrayReference elemsArray && headVal instanceof IntegerValue headIv && tailVal instanceof IntegerValue tailIv) {
                    int head = headIv.value();
                    int tail = tailIv.value();
                    int len = elemsArray.length();

                    if (len > 0) {
                        int i = head;
                        while (i != tail) {
                            Value elemVal = elemsArray.getValue(i);
                            if (elemVal != null) {
                                heapObj.getElements().add(inspectValue(elemVal, heapMap));
                            }
                            i = (i + 1) % len;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
    }

    private static String extractStringBuilderText(ObjectReference objRef) {
        try {
            ReferenceType refType = objRef.referenceType();
            Field valueField = getFieldByName(refType, "value");
            Field countField = getFieldByName(refType, "count");

            if (valueField != null && countField != null) {
                Value valueVal = objRef.getValue(valueField);
                Value countVal = objRef.getValue(countField);

                if (valueVal instanceof ArrayReference arrayRef && countVal instanceof IntegerValue countIv) {
                    int count = countIv.value();
                    List<Value> vals = arrayRef.getValues();
                    StringBuilder sb = new StringBuilder();

                    for (int i = 0; i < Math.min(count, vals.size()); i++) {
                        Value v = vals.get(i);
                        if (v instanceof CharValue cv) {
                            sb.append(cv.value());
                        } else if (v instanceof ByteValue bv) {
                            sb.append((char) (bv.value() & 0xFF));
                        }
                    }
                    return sb.toString();
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private static Object extractPrimitive(PrimitiveValue pv) {
        if (pv instanceof BooleanValue bv) return bv.value();
        if (pv instanceof IntegerValue iv) return iv.value();
        if (pv instanceof LongValue lv) return lv.value();
        if (pv instanceof DoubleValue dv) return dv.value();
        if (pv instanceof FloatValue fv) return fv.value();
        if (pv instanceof CharValue cv) return cv.value();
        if (pv instanceof ByteValue bv) return bv.value();
        if (pv instanceof ShortValue sv) return sv.value();
        return pv.toString();
    }
}
