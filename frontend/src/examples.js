// Example programs for the "Load Example" dropdown
export const EXAMPLES = [
  {
    id: 'shared-linked-list',
    label: '1. Shared Ref Linked List (6 Nodes)',
    className: 'SharedLinkedListDemo',
    code: `public class SharedLinkedListDemo {
    static class Node {
        int val;
        Node next;

        Node(int val, Node next) {
            this.val = val;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node n6 = new Node(60, null);
        Node n5 = new Node(50, n6);
        Node n4 = new Node(40, n5);
        Node n3 = new Node(30, n4);
        Node n2 = new Node(20, n3);
        Node n1 = new Node(10, n2);

        Node head = n1;
        Node p1 = n1;

        System.out.println("Head and p1 both reference n1");
    }
}`,
  },
  {
    id: 'binary-tree-7',
    label: '2. Binary Tree (7 Nodes)',
    className: 'BinaryTree7Demo',
    code: `public class BinaryTree7Demo {
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
        root.left.right = new TreeNode(8);

        root.right.left = new TreeNode(12);
        root.right.right = new TreeNode(20);

        System.out.println("7-Node binary tree built");
    }
}`,
  },
  {
    id: 'mixed-scene',
    label: '3. Mixed Scene (2 Frames, 3 Heap Objs)',
    className: 'MixedSceneDemo',
    code: `public class MixedSceneDemo {
    static class Data {
        int id;
        String label;

        Data(int id, String label) {
            this.id = id;
            this.label = label;
        }
    }

    public static void main(String[] args) {
        Data d1 = new Data(1, "Alpha");
        helper(d1);
    }

    public static void helper(Data item) {
        Data d2 = new Data(2, "Beta");
        Data d3 = new Data(3, "Gamma");
        System.out.println("Helper frame active");
    }
}`,
  },
  {
    id: 'doubly-linked-list',
    label: '4. Doubly Linked List',
    className: 'DoublyLinkedListDemo',
    code: `public class DoublyLinkedListDemo {
    static class DoublyNode {
        int val;
        DoublyNode prev;
        DoublyNode next;

        DoublyNode(int val) {
            this.val = val;
        }
    }

    public static void main(String[] args) {
        DoublyNode n1 = new DoublyNode(10);
        DoublyNode n2 = new DoublyNode(20);
        DoublyNode n3 = new DoublyNode(30);

        n1.next = n2;
        n2.prev = n1;
        n2.next = n3;
        n3.prev = n2;

        System.out.println("Doubly linked list built");
    }
}`,
  },
  {
    id: 'valid-parentheses',
    label: '5. Stack Valid Parentheses',
    className: 'ValidParenthesesDemo',
    code: `import java.util.Stack;

public class ValidParenthesesDemo {
    public static void main(String[] args) {
        String s = "({[]})";
        Stack<Character> stack = new Stack<>();

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (!stack.isEmpty()) {
                    stack.pop();
                }
            }
        }
        System.out.println("Is valid: " + stack.isEmpty());
    }
}`,
  },
  {
    id: 'word-count',
    label: '6. HashMap Word-Count',
    className: 'WordCountDemo',
    code: `import java.util.HashMap;

public class WordCountDemo {
    public static void main(String[] args) {
        String[] words = {"apple", "banana", "apple", "cherry", "banana", "apple"};
        HashMap<String, Integer> map = new HashMap<>();

        for (String word : words) {
            map.put(word, map.getOrDefault(word, 0) + 1);
        }
        System.out.println("Total unique words: " + map.size());
    }
}`,
  },
  {
    id: 'hash-set',
    label: '7. HashSet Unique Tags',
    className: 'HashSetDemo',
    code: `import java.util.HashSet;

public class HashSetDemo {
    public static void main(String[] args) {
        HashSet<String> tags = new HashSet<>();
        tags.add("java");
        tags.add("algorithm");
        tags.add("java");
        tags.add("datastructure");
        System.out.println("Unique tags count: " + tags.size());
    }
}`,
  },
  {
    id: 'recursive-fibonacci',
    label: '8. Recursive Fibonacci(4)',
    className: 'FibonacciDemo',
    code: `public class FibonacciDemo {
    public static int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        int result = fib(4);
        System.out.println("fib(4) = " + result);
    }
}`,
  },
  {
    id: 'recursive-factorial',
    label: '9. Recursive Factorial(5)',
    className: 'FactorialDemo',
    code: `public class FactorialDemo {
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int result = factorial(5);
        System.out.println("factorial(5) = " + result);
    }
}`,
  },
];
