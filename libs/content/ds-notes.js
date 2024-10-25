/**
 *
 * @returns
 */
export const DsNotesContent = () => {
  return (
    <div>
      <h3 id="-why-do-you-need-to-know-ds-">
        <strong>Why do you need to know DS?</strong>
      </h3>
      <p>
        Why do we need art? Why do we need to breathe? What is love? These are
        profound questions that I am not capable to answer, but when it comes to
        the value of data structures, I can try my best.
      </p>
      <p>
        Understanding data structures is like equipping yourself with a toolkit
        of strategies that make problem-solving more efficient. Whether
        you&#39;re tackling complex coding challenges, optimizing a
        program&#39;s performance, or handling large amounts of data, the right
        data structure can be the key to a solution that is not only correct but
        also elegant and fast. It’s about knowing when to use a hammer and when
        to use a screwdriver—choosing the right tool for the job.
      </p>
      <p>
        In programming, this means being able to select the data structure that
        best fits your needs, leading to code that runs faster, uses memory more
        effectively, and scales gracefully as the size of the problem grows.
        It’s not just about passing coding interviews or acing exams; it’s about
        thinking critically and solving real-world problems in a way that makes
        life a little bit easier for everyone.
      </p>
      <br />
      <h3 id="-what-are-data-structures-">
        <strong>What are data structures?</strong>
      </h3>
      <p>
        Data structures are methods used to organize and manage data, making it
        easier to use and understand. Think of them like different ways to sort
        and arrange a big box of LEGO bricks. You could sort the bricks by
        color, size, or shape to find what you need more easily. Similarly, data
        structures help us organize information in ways that make it more
        accessible and efficient to work with.
      </p>
      <br />
      <h3 id="-complexity-analysis-">
        <strong>Complexity analysis:</strong>
      </h3>
      <p>
        Complexity analysis helps us compare different ways to solve a problem,
        so we can find the most efficient solution.
      </p>
      <br />
      <p>
        <strong>Types of Complexity:</strong>
      </p>
      <ul>
        <li>
          <strong>Time Complexity:</strong> Measures how long it takes to
          complete a task. It&#39;s like asking, &quot;How many steps will it
          take to find a specific LEGO brick in the box?&quot;
        </li>
        <li>
          <strong>Space Complexity:</strong> Refers to how much memory (storage)
          is needed to perform a task. Think of it as asking, &quot;How many
          containers do I need to store all these LEGO bricks?&quot;
        </li>
        <li>
          <strong>Big O Notation:</strong> We use Big O notation to describe how
          complex a task is, showing how the number of steps or memory use
          changes as the problem gets bigger.
        </li>
      </ul>
      <br />
      <h3 id="-big-o-notation-">
        <strong>Big O notation</strong>
      </h3>
      <table>
        <thead>
          <tr>
            <th>Complexity</th>
            <th>Big O Notation</th>
            <th>Explanation</th>
            <th>Example for Kids</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Constant</strong>
            </td>
            <td>O(1)</td>
            <td>Takes the same amount of time, no matter the size.</td>
            <td>Checking if the light is on or off.</td>
          </tr>
          <tr>
            <td>
              <strong>Logarithmic</strong>
            </td>
            <td>O(log n)</td>
            <td>Cuts the problem size in half each step.</td>
            <td>
              Finding a word in a dictionary by opening it halfway each time.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Linear</strong>
            </td>
            <td>O(n)</td>
            <td>Time grows with the size of the input.</td>
            <td>Searching for a lost toy in a long line of boxes.</td>
          </tr>
          <tr>
            <td>
              <strong>Log-linear</strong>
            </td>
            <td>O(n log n)</td>
            <td>A combination of linear and logarithmic growth.</td>
            <td>Sorting a large deck of cards.</td>
          </tr>
          <tr>
            <td>
              <strong>Quadratic</strong>
            </td>
            <td>O(n²)</td>
            <td>Time grows much faster than the input size.</td>
            <td>
              Checking each pair of LEGO bricks to see if they are the same.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Exponential</strong>
            </td>
            <td>O(2ⁿ)</td>
            <td>Doubles in time with each step increase.</td>
            <td>Figuring out all possible combinations of LEGO bricks.</td>
          </tr>
          <tr>
            <td>
              <strong>Factorial</strong>
            </td>
            <td>O(n!)</td>
            <td>Grows extremely fast as the input increases.</td>
            <td>Arranging a group of toys in every possible order.</td>
          </tr>
        </tbody>
      </table>
      <br />
      <h3 id="-memory-">
        <strong>Memory:</strong>
      </h3>
      <ul>
        <li>
          <strong>Bit:</strong> The smallest piece of data, which can be either
          0 or 1. It&#39;s like a tiny light switch that can only be
          &quot;on&quot; or &quot;off.&quot;
        </li>
        <li>
          <strong>Byte:</strong> A group of 8 bits. Imagine 8 light switches in
          a row, which can create up to 256 different combinations (patterns of
          on and off). This allows us to represent many different pieces of
          information, such as letters, numbers, or colors.
        </li>
      </ul>
      <br />
      <h3 id="-logarithm-">
        <strong>Logarithm</strong>
      </h3>
      <ul>
        <li>
          <p>
            <strong>Explanation</strong>: A logarithm is a way to measure how
            many times we need to divide a number by a certain factor to reach a
            specific value, usually 1. In programming and data structures,
            logarithms often come into play when we need to repeatedly reduce a
            problem in size. They help us understand how efficient certain
            algorithms are, especially those that cut the problem in half at
            each step.
          </p>
        </li>
        <li>
          <p>
            <strong>Why It Matters</strong>: Understanding logarithms is crucial
            because they appear frequently in computer science, especially in
            algorithms that involve searching and sorting. For example,
            algorithms like binary search use logarithmic time complexity,
            meaning that as the size of the problem doubles, the number of steps
            needed only increases by one. This is a powerful way to make code
            run faster and handle larger data sets efficiently.
          </p>
        </li>
        <li>
          <p>
            <strong>Example</strong>: Imagine you have 16 cookies, and you want
            to keep dividing them in half until you’re left with just one
            cookie. Here&#39;s what happens:
          </p>
          <ul>
            <li>Start with 16 cookies.</li>
            <li>
              First cut: You divide 16 cookies in half, resulting in 8 cookies.
            </li>
            <li>
              Second cut: Divide 8 cookies in half, leaving you with 4 cookies.
            </li>
            <li>Third cut: Cut the 4 cookies in half, giving you 2 cookies.</li>
            <li>
              <p>
                Fourth cut: Cut the 2 cookies in half, and now you have 1
                cookie.
              </p>
              <p>
                It took 4 cuts to get from 16 cookies down to 1. This means the
                logarithm base 2 of 16 is 4, written as log₂(16) = 4. This
                example illustrates how logarithms count the number of times we
                need to divide something by 2 to reduce it down to 1.
              </p>
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>Relevance in Algorithms</strong>: Consider a scenario where
            you need to find a word in a dictionary with 16,000 pages. Instead
            of checking each page one by one, you could use a logarithmic
            approach by opening the book in the middle and seeing if your word
            comes before or after that point. You can then keep dividing the
            remaining pages in half until you find the word. This process only
            takes about 14 steps (log₂(16,000) ≈ 14), which is much faster than
            checking each page individually.
          </p>
        </li>
      </ul>
      <br />
      <h3 id="-arrays-">
        <strong>Arrays</strong>
      </h3>
      <ul>
        <li>
          <strong>Definition</strong>: An array is like a row of lockers where
          each locker holds a piece of data.
        </li>
        <li>
          <strong>Types</strong>:
          <ul>
            <li>
              <strong>Static Array</strong>: Has a fixed number of lockers
              (slots), like a row of 10 lockers in your school.
            </li>
            <li>
              <strong>Dynamic Array</strong>: Can grow to add more lockers if
              needed, just like when you add more shelves to a bookshelf.
            </li>
          </ul>
        </li>
        <li>
          <strong>Common Operations</strong>:
          <ul>
            <li>
              <strong>Initialization</strong>: Opening up all the lockers for
              use (O(n)).
            </li>
            <li>
              <strong>Traversal</strong>: Checking each locker one by one
              (O(n)).
            </li>
            <li>
              <strong>Insertion</strong>: Adding a new item, which can be quick
              or slow depending on where you put it.
            </li>
          </ul>
        </li>
      </ul>
      <br />
      <h3 id="-linked-lists-">
        <strong>Linked Lists</strong>
      </h3>
      <ul>
        <li>
          <strong>Definition</strong>: Think of a linked list like a treasure
          hunt, where each clue (node) points to the next clue.
        </li>
        <li>
          <strong>Types</strong>:
          <ul>
            <li>
              <strong>Singly Linked List</strong>: Each node points to the next
              clue only.
            </li>
            <li>
              <strong>Doubly Linked List</strong>: Nodes have clues to the
              previous and next locations.
            </li>
            <li>
              <strong>Circular Linked List</strong>: The last clue leads back to
              the first, creating a loop.
            </li>
          </ul>
        </li>
      </ul>
      <br />
      <h3 id="hash-tables">Hash Tables</h3>
      <ul>
        <li>
          <strong>Definition</strong>: A hash table is like a magic library
          where each book has a secret code (key). You can quickly find a book
          using the code.
        </li>
        <li>
          <strong>Time Complexity</strong>:
          <ul>
            <li>
              <strong>Average Case</strong>: Very fast, like going straight to a
              specific shelf (O(1)).
            </li>
            <li>
              <strong>Worst Case</strong>: If the library is really messy, you
              might have to check every book (O(n)).
            </li>
          </ul>
        </li>
        <li>
          <strong>Challenges</strong>:
          <ul>
            <li>
              Handling collisions, like when two books have the same code.
              Imagine two books trying to fit on the same shelf.
            </li>
          </ul>
        </li>
      </ul>

      <br />

      <h3 id="stacks-and-queues">Stacks and Queues</h3>
      <ul>
        <li>
          <strong>Stack</strong>:
          <ul>
            <li>
              <strong>Definition</strong>: Think of a stack as a stack of
              pancakes; you can only take the top pancake (Last In, First Out -
              LIFO).
            </li>
          </ul>
        </li>
        <li>
          <strong>Queue</strong>:
          <ul>
            <li>
              <strong>Definition</strong>: A queue is like a line for the slide
              at the playground; the first person in line goes down the slide
              first (First In, First Out - FIFO).
            </li>
          </ul>
        </li>
        <li>
          <strong>Complexity</strong>: Adding or removing items is quick, just
          like putting a pancake on top of the stack or joining the end of a
          line (O(1)).
        </li>
      </ul>
      <br />
      <h3 id="strings">Strings</h3>
      <ul>
        <li>
          <strong>Definition</strong>: A string is like a chain of letters, just
          like beads on a necklace.
        </li>
        <li>
          <strong>Are Strings Data Structures?</strong>: Yes, they are
          essentially arrays of characters (letters).
        </li>
      </ul>
      <br />
      <h3 id="graphs">Graphs</h3>
      <ul>
        <li>
          <strong>Definition</strong>: A graph is like a map with towns (nodes)
          connected by roads (edges).
        </li>
        <li>
          <strong>Types</strong>:
          <ul>
            <li>
              <strong>Directed Graph</strong>: Roads only go one way, like a
              one-way street.
            </li>
            <li>
              <strong>Undirected Graph</strong>: Roads go both ways, like a
              normal street.
            </li>
            <li>
              <strong>Cyclic Graph</strong>: There are loops, like a roundabout.
            </li>
            <li>
              <strong>Acyclic Graph</strong>: No loops, just like a tree.
            </li>
            <li>
              <strong>Connected Graph</strong>: You can get from any town to any
              other town via roads.
            </li>
          </ul>
        </li>
      </ul>
      <br />
      <h3 id="trees">Trees</h3>
      <ul>
        <li>
          <strong>Definition</strong>: A tree is a graph with no loops, like a
          family tree with parents and children.
        </li>
        <li>
          <strong>Characteristics</strong>: There are no disconnected branches.
        </li>
        <li>
          <strong>Types</strong>:
          <ul>
            <li>
              <strong>Binary Tree</strong>: Each parent can have up to two
              children, like a decision tree in a game.
            </li>
            <li>
              <strong>K-ary Tree</strong>: Each parent can have up to K
              children.
            </li>
            <li>
              <strong>Perfect Binary Tree</strong>: All parents have two
              children, and all children are on the same level.
            </li>
            <li>
              <strong>Complete Binary Tree</strong>: Similar to a perfect tree
              but with some gaps in the last level.
            </li>
            <li>
              <strong>Balanced Binary Tree</strong>: The left and right sides
              are nearly the same height.
            </li>
            <li>
              <strong>Full Binary Tree</strong>: Each parent has zero or two
              children, like a family tree where each person either has no kids
              or exactly two kids.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  )
}
