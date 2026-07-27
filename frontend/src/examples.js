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
