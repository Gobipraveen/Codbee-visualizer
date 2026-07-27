package com.visualizer.tracer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.visualizer.tracer.model.HeapObjectDto;
import com.visualizer.tracer.model.StackFrameDto;
import com.visualizer.tracer.model.TraceStep;
import com.visualizer.tracer.model.ValueDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JdiHarnessTest {

    private JdiHarness harness;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        harness = new JdiHarness();
        objectMapper = new ObjectMapper();
        objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Test
    @DisplayName("Test (a): Simple For-Loop Execution Trace")
    void testSimpleForLoop() throws Exception {
        String code = """
                public class ForLoopDemo {
                    public static void main(String[] args) {
                        int sum = 0;
                        for (int i = 1; i <= 3; i++) {
                            sum += i;
                            System.out.println("sum=" + sum);
                        }
                    }
                }
                """;

        List<TraceStep> trace = harness.trace(code, "ForLoopDemo");

        assertNotNull(trace);
        assertFalse(trace.isEmpty(), "Trace steps should not be empty");
        assertTrue(trace.size() < 1000, "Trace steps should be well within MAX_STEPS limit");

        // Verify that steps capture stdout increments
        boolean foundStdout = trace.stream().anyMatch(step -> step.getStdout() != null && step.getStdout().contains("sum=6"));
        assertTrue(foundStdout, "Trace should capture stdout 'sum=6'");
    }

    @Test
    @DisplayName("Test (b): Recursive Factorial Call Stack Trace")
    void testRecursiveFactorial() throws Exception {
        String code = """
                public class FactorialDemo {
                    public static void main(String[] args) {
                        int res = factorial(3);
                        System.out.println("Fact=" + res);
                    }

                    public static int factorial(int n) {
                        if (n <= 1) {
                            return 1;
                        }
                        return n * factorial(n - 1);
                    }
                }
                """;

        List<TraceStep> trace = harness.trace(code, "FactorialDemo");

        assertNotNull(trace);
        assertFalse(trace.isEmpty());

        // Find max stack depth during execution
        int maxStackDepth = trace.stream()
                .mapToInt(step -> step.getStack().size())
                .max()
                .orElse(0);

        // main -> factorial(3) -> factorial(2) -> factorial(1) depth should reach at least 4 frames
        assertTrue(maxStackDepth >= 4, "Stack depth should reach at least 4 during factorial(3) recursion");
    }

    @Test
    @DisplayName("Test (c): Singly Linked List Heap Object Reference Graph")
    void testLinkedListHeap() throws Exception {
        String code = """
                public class LinkedListDemo {
                    static class Node {
                        int val;
                        Node next;

                        Node(int val, Node next) {
                            this.val = val;
                            this.next = next;
                        }
                    }

                    public static void main(String[] args) {
                        Node n3 = new Node(30, null);
                        Node n2 = new Node(20, n3);
                        Node head = new Node(10, n2);

                        Node curr = head;
                        while (curr != null) {
                            System.out.println("Node: " + curr.val);
                            curr = curr.next;
                        }
                    }
                }
                """;

        List<TraceStep> trace = harness.trace(code, "LinkedListDemo");

        assertNotNull(trace);
        assertFalse(trace.isEmpty(), "LinkedList trace should not be empty");

        // Pretty print JSON trace of the LinkedList execution for user inspection
        String jsonOutput = objectMapper.writeValueAsString(trace);
        System.out.println("=== LINKED LIST EXECUTION TRACE JSON START ===");
        System.out.println(jsonOutput);
        System.out.println("=== LINKED LIST EXECUTION TRACE JSON END ===");

        // Verify heap objects exist in steps where nodes are created
        boolean hasHeapNodes = trace.stream().anyMatch(step ->
                step.getHeap().values().stream().anyMatch(obj -> obj.getType().contains("Node"))
        );
        assertTrue(hasHeapNodes, "Heap should contain Node object instances");

        // Verify shared object references
        TraceStep lastStepWithHead = trace.stream()
                .filter(step -> !step.getStack().isEmpty() && step.getStack().get(0).getVariables().containsKey("head"))
                .reduce((first, second) -> second)
                .orElse(null);

        assertNotNull(lastStepWithHead, "Should find a step where 'head' is visible");
        ValueDto headVal = lastStepWithHead.getStack().get(0).getVariables().get("head");
        assertEquals("reference", headVal.getType());

        String headRefId = (String) headVal.getValue();
        HeapObjectDto headObj = lastStepWithHead.getHeap().get(headRefId);
        assertNotNull(headObj, "Head object should exist in heap map");
        assertEquals(10, headObj.getFields().get("val").getValue());
    }
}
