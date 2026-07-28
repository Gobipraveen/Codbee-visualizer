// Example programs for the "Load Example" dropdown
export const EXAMPLES = [
  {
    id: 'linked-list',
    label: 'Linked List',
    className: 'LinkedListDemo',
    code: `public class LinkedListDemo {
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
            System.out.println("Node val: " + curr.val);
            curr = curr.next;
        }
    }
}`,
  },
  {
    id: 'binary-tree',
    label: 'Binary Tree',
    className: 'BinaryTreeDemo',
    code: `public class BinaryTreeDemo {
    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;

        TreeNode(int val) {
            this.val = val;
        }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(10);
        root.left = new TreeNode(5);
        root.right = new TreeNode(15);
        root.left.left = new TreeNode(2);

        System.out.println("Root val: " + root.val);
        System.out.println("Left child: " + root.left.val);
        System.out.println("Right child: " + root.right.val);
    }
}`,
  },
  {
    id: 'stack-queue',
    label: 'Stack & Queue',
    className: 'StackQueueDemo',
    code: `import java.util.Stack;
import java.util.ArrayDeque;

public class StackQueueDemo {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);

        ArrayDeque<String> queue = new ArrayDeque<>();
        queue.add("first");
        queue.add("second");
        queue.add("third");

        System.out.println("Stack top: " + stack.peek());
        System.out.println("Queue front: " + queue.peek());
    }
}`,
  },
  {
    id: 'collections',
    label: 'Map, Set & List',
    className: 'CollectionDemo',
    code: `import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

public class CollectionDemo {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("Java");
        list.add("Python");

        HashMap<String, Integer> map = new HashMap<>();
        map.put("score1", 100);
        map.put("score2", 200);

        HashSet<Integer> set = new HashSet<>();
        set.add(42);
        set.add(99);

        System.out.println("List size: " + list.size());
        System.out.println("Map size: " + map.size());
        System.out.println("Set size: " + set.size());
    }
}`,
  },
  {
    id: 'string-builder',
    label: 'StringBuilder',
    className: 'StringBuilderDemo',
    code: `public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("CODE");
        sb.append("BEE");
        System.out.println("Result: " + sb.toString());
    }
}`,
  },
  {
    id: 'for-loop',
    label: 'For Loop / Sum',
    className: 'ForLoopDemo',
    code: `public class ForLoopDemo {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
            System.out.println("i=" + i + "  sum=" + sum);
        }
        System.out.println("Final sum: " + sum);
    }
}`,
  },
  {
    id: 'recursion',
    label: 'Recursive Fibonacci',
    className: 'FibDemo',
    code: `public class FibDemo {
    public static void main(String[] args) {
        for (int n = 0; n <= 5; n++) {
            System.out.println("fib(" + n + ") = " + fib(n));
        }
    }

    public static int fib(int n) {
        if (n <= 1) return n;
        return fib(n - 1) + fib(n - 2);
    }
}`,
  },
  {
    id: 'exception',
    label: 'Uncaught Exception',
    className: 'ExceptionDemo',
    code: `public class ExceptionDemo {
    public static void main(String[] args) {
        System.out.println("Before exception");
        int[] arr = new int[3];
        arr[0] = 10;
        arr[1] = 20;
        System.out.println("arr[0]=" + arr[0]);
        arr[5] = 99; // ArrayIndexOutOfBoundsException
        System.out.println("This line won't run");
    }
}`,
  },
];
