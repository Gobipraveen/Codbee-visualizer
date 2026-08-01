// Example programs for the "Load Example" dropdown
export const EXAMPLES = [
  {
    id: 'bubble-sort',
    label: '1. Array Bubble Sort',
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
    id: 'binary-tree',
    label: '2. Binary Tree Insertion',
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
    id: 'valid-parentheses',
    label: '3. Stack Valid Parentheses',
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
    id: 'level-order',
    label: '4. Queue Level-Order Traversal',
    className: 'LevelOrderDemo',
    code: `import java.util.ArrayDeque;

public class LevelOrderDemo {
    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;

        TreeNode(int val) {
            this.val = val;
        }
    }

    public static void main(String[] args) {
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);

        ArrayDeque<TreeNode> queue = new ArrayDeque<>();
        queue.add(root);

        while (!queue.isEmpty()) {
            TreeNode curr = queue.poll();
            System.out.println("Visited node: " + curr.val);
            if (curr.left != null) queue.add(curr.left);
            if (curr.right != null) queue.add(curr.right);
        }
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
    id: 'string-builder',
    label: '6. StringBuilder Sentence',
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
    label: '7. Recursive Factorial',
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
  {
    id: 'exception',
    label: '8. Uncaught Exception',
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
