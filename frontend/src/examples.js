// Example programs for the "Load Example" dropdown
export const EXAMPLES = [
  {
    id: 'singly-linked-list',
    label: '1. Singly Linked List',
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
        Node n1 = new Node(10, n2);
        System.out.println("Head val: " + n1.val);
    }
}`,
  },
  {
    id: 'doubly-linked-list',
    label: '2. Doubly Linked List',
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

        System.out.println("n1->n2->n3 linked doubly");
    }
}`,
  },
  {
    id: 'binary-tree',
    label: '3. Binary Tree Insertion',
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
    }
}`,
  },
  {
    id: 'valid-parentheses',
    label: '4. Stack Valid Parentheses',
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
    label: '5. HashMap Word-Count',
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
    label: '6. HashSet Unique Tags',
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
    id: 'bubble-sort',
    label: '7. Array Bubble Sort',
    className: 'BubbleSortDemo',
    code: `public class BubbleSortDemo {
    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 1, 2};
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        System.out.println("Bubble sort finished");
    }
}`,
  },
  {
    id: 'string-builder',
    label: '8. StringBuilder Sentence',
    className: 'StringBuilderDemo',
    code: `public class StringBuilderDemo {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("CODBEE");
        sb.append(" Visualizer");
        sb.append(" 2026");
        System.out.println("Result: " + sb.toString());
    }
}`,
  },
  {
    id: 'factorial',
    label: '9. Recursive Factorial',
    className: 'FactorialDemo',
    code: `public class FactorialDemo {
    public static void main(String[] args) {
        int result = factorial(4);
        System.out.println("4! = " + result);
    }

    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }
}`,
  },
];
