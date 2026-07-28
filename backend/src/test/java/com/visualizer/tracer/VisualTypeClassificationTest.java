package com.visualizer.tracer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.visualizer.tracer.model.HeapObjectDto;
import com.visualizer.tracer.model.TraceStep;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class VisualTypeClassificationTest {

    private JdiHarness harness;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        harness = new JdiHarness();
        objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Test
    @DisplayName("Test 1: Int Array Classification & Elements")
    void testIntArray() throws Exception {
        String code = """
                public class IntArrayDemo {
                    public static void main(String[] args) {
                        int[] nums = new int[]{10, 20, 30};
                        System.out.println("len=" + nums.length);
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "IntArrayDemo");
        assertNotNull(trace);
        HeapObjectDto obj = findHeapObjectByVisualType(trace, "array");
        assertNotNull(obj, "Should contain a heap object classified as 'array'");
        assertEquals("array", obj.getVisualType());
        assertFalse(obj.getElements().isEmpty(), "Array elements should be populated");
    }

    @Test
    @DisplayName("Test 2: String Array Classification & Elements")
    void testStringArray() throws Exception {
        String code = """
                public class StringArrayDemo {
                    public static void main(String[] args) {
                        String[] words = new String[]{"hello", "world"};
                        System.out.println("count=" + words.length);
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "StringArrayDemo");
        assertNotNull(trace);
        HeapObjectDto obj = findHeapObjectByVisualType(trace, "array");
        assertNotNull(obj, "Should contain String[] heap object classified as 'array'");
        assertEquals("array", obj.getVisualType());
    }

    @Test
    @DisplayName("Test 3: Singly Linked List Classification")
    void testSinglyLinkedList() throws Exception {
        String code = """
                public class LinkedListTestDemo {
                    static class Node {
                        int val;
                        Node next;
                        Node(int val, Node next) {
                            this.val = val;
                            this.next = next;
                        }
                    }
                    public static void main(String[] args) {
                        Node n2 = new Node(20, null);
                        Node head = new Node(10, n2);
                        System.out.println("head=" + head.val);
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "LinkedListTestDemo");
        assertNotNull(trace);
        HeapObjectDto obj = findHeapObjectByVisualType(trace, "linked_list");
        assertNotNull(obj, "Singly linked list node should be classified as 'linked_list'");
        assertEquals("linked_list", obj.getVisualType());
    }

    @Test
    @DisplayName("Test 4: Binary Tree Classification (with JSON output)")
    void testBinaryTree() throws Exception {
        String code = """
                public class BinaryTreeDemo {
                    static class TreeNode {
                        int val;
                        TreeNode left;
                        TreeNode right;
                        TreeNode(int val) { this.val = val; }
                    }
                    public static void main(String[] args) {
                        TreeNode root = new TreeNode(10);
                        root.left = new TreeNode(5);
                        root.right = new TreeNode(15);
                        System.out.println("root=" + root.val);
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "BinaryTreeDemo");
        assertNotNull(trace);

        TraceStep lastStep = trace.get(trace.size() - 1);
        HeapObjectDto treeNodeObj = findHeapObjectByVisualType(trace, "tree_node");
        assertNotNull(treeNodeObj, "Binary tree node should be classified as 'tree_node'");
        assertEquals("tree_node", treeNodeObj.getVisualType());

        // Print JSON output for Binary Tree step
        System.out.println("=== BINARY TREE STEP JSON OUTPUT ===");
        System.out.println(objectMapper.writeValueAsString(lastStep));
        System.out.println("=== BINARY TREE STEP JSON END ===");
    }

    @Test
    @DisplayName("Test 5: ArrayList Classification & Elements")
    void testArrayList() throws Exception {
        String code = """
                import java.util.ArrayList;
                public class ArrayListDemo {
                    public static void main(String[] args) {
                        ArrayList<String> list = new ArrayList<>();
                        list.add("one");
                        list.add("two");
                        System.out.println("size=" + list.size());
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "ArrayListDemo");
        assertNotNull(trace);
        HeapObjectDto obj = findHeapObjectByVisualType(trace, "list");
        assertNotNull(obj, "ArrayList should be classified as 'list'");
        assertEquals("list", obj.getVisualType());
        assertFalse(obj.getElements().isEmpty(), "ArrayList elements should be populated");
    }

    @Test
    @DisplayName("Test 6: HashMap Classification & Elements (with JSON output)")
    void testHashMap() throws Exception {
        String code = """
                import java.util.HashMap;
                public class HashMapDemo {
                    public static void main(String[] args) {
                        HashMap<String, Integer> map = new HashMap<>();
                        map.put("key1", 100);
                        map.put("key2", 200);
                        System.out.println("size=" + map.size());
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "HashMapDemo");
        assertNotNull(trace);

        TraceStep lastStep = trace.get(trace.size() - 1);
        HeapObjectDto mapObj = findHeapObjectByVisualType(trace, "map");
        assertNotNull(mapObj, "HashMap should be classified as 'map'");
        assertEquals("map", mapObj.getVisualType());
        assertFalse(mapObj.getElements().isEmpty(), "HashMap elements should be populated");

        // Print JSON output for HashMap step
        System.out.println("=== HASHMAP STEP JSON OUTPUT ===");
        System.out.println(objectMapper.writeValueAsString(lastStep));
        System.out.println("=== HASHMAP STEP JSON END ===");
    }

    @Test
    @DisplayName("Test 7: HashSet Classification & Elements")
    void testHashSet() throws Exception {
        String code = """
                import java.util.HashSet;
                public class HashSetDemo {
                    public static void main(String[] args) {
                        HashSet<String> set = new HashSet<>();
                        set.add("apple");
                        set.add("banana");
                        System.out.println("size=" + set.size());
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "HashSetDemo");
        assertNotNull(trace);
        HeapObjectDto setObj = findHeapObjectByVisualType(trace, "set");
        assertNotNull(setObj, "HashSet should be classified as 'set'");
        assertEquals("set", setObj.getVisualType());
        assertFalse(setObj.getElements().isEmpty(), "HashSet elements should be populated");
    }

    @Test
    @DisplayName("Test 8: Stack Classification & Elements")
    void testStack() throws Exception {
        String code = """
                import java.util.Stack;
                public class StackDemo {
                    public static void main(String[] args) {
                        Stack<Integer> st = new Stack<>();
                        st.push(10);
                        st.push(20);
                        System.out.println("top=" + st.peek());
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "StackDemo");
        assertNotNull(trace);
        HeapObjectDto stackObj = findHeapObjectByVisualType(trace, "stack");
        assertNotNull(stackObj, "Stack should be classified as 'stack'");
        assertEquals("stack", stackObj.getVisualType());
        assertFalse(stackObj.getElements().isEmpty(), "Stack elements should be populated");
    }

    @Test
    @DisplayName("Test 9: StringBuilder Classification & Content")
    void testStringBuilder() throws Exception {
        String code = """
                public class StringBuilderDemo {
                    public static void main(String[] args) {
                        StringBuilder sb = new StringBuilder("hello");
                        sb.append(" world");
                        System.out.println("str=" + sb.toString());
                    }
                }
                """;
        List<TraceStep> trace = harness.trace(code, "StringBuilderDemo");
        assertNotNull(trace);
        HeapObjectDto sbObj = findHeapObjectByVisualType(trace, "string_builder");
        assertNotNull(sbObj, "StringBuilder should be classified as 'string_builder'");
        assertEquals("string_builder", sbObj.getVisualType());
        assertFalse(sbObj.getElements().isEmpty(), "StringBuilder string text should be in elements");
    }

    private HeapObjectDto findHeapObjectByVisualType(List<TraceStep> trace, String targetVisualType) {
        for (int i = trace.size() - 1; i >= 0; i--) {
            TraceStep step = trace.get(i);
            for (HeapObjectDto heapObj : step.getHeap().values()) {
                if (targetVisualType.equals(heapObj.getVisualType())) {
                    if (!heapObj.getElements().isEmpty() || "linked_list".equals(targetVisualType) || "tree_node".equals(targetVisualType) || "object".equals(targetVisualType)) {
                        return heapObj;
                    }
                }
            }
        }
        for (TraceStep step : trace) {
            for (HeapObjectDto heapObj : step.getHeap().values()) {
                if (targetVisualType.equals(heapObj.getVisualType())) {
                    return heapObj;
                }
            }
        }
        return null;
    }
}
