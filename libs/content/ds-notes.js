import {
  Heading,
  List,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList
} from '@chakra-ui/react'

/**
 *
 * @returns
 */
export const DsNotesContent = () => {
  return (
    <div>
      <Heading as="h3" size="lg" mb={4}>
        <strong>Why do you need to know DS?</strong>
      </Heading>
      <Text mb={4}>
        Why do we need art? Why do we need to breathe? What is love? These are
        profound questions that I am not capable to answer, but when it comes to
        the value of data structures, I can try my best.
      </Text>
      <Text mb={4}>
        Understanding data structures is like equipping yourself with a toolkit
        of strategies that make problem-solving more efficient. Whether
        you&#39;re tackling complex coding challenges, optimizing a
        program&#39;s performance, or handling large amounts of data, the right
        data structure can be the key to a solution that is not only correct but
        also elegant and fast. It’s about knowing when to use a hammer and when
        to use a screwdriver—choosing the right tool for the job.
      </Text>
      <Text mb={4}>
        In programming, this means being able to select the data structure that
        best fits your needs, leading to code that runs faster, uses memory more
        effectively, and scales gracefully as the size of the problem grows.
        It’s not just about passing coding interviews or acing exams; it’s about
        thinking critically and solving real-world problems in a way that makes
        life a little bit easier for everyone.
      </Text>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-what-are-data-structures-">
        <strong>What are data structures?</strong>
      </Heading>
      <Text mb={4}>
        Data structures are methods used to organize and manage data, making it
        easier to use and understand. Think of them like different ways to sort
        and arrange a big box of LEGO bricks. You could sort the bricks by
        color, size, or shape to find what you need more easily. Similarly, data
        structures help us organize information in ways that make it more
        accessible and efficient to work with.
      </Text>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-complexity-analysis-">
        <strong>Complexity analysis:</strong>
      </Heading>
      <Text mb={4}>
        Complexity analysis helps us compare different ways to solve a problem,
        so we can find the most efficient solution.
      </Text>
      <br />
      <Text mb={4}>
        <strong>Types of Complexity:</strong>
      </Text>
      <UnorderedList spacing={3} pl={5}>
        <ListItem>
          <Text as="span" fontWeight="bold">
            Time Complexity:
          </Text>{' '}
          Measures how long it takes to complete a task. It&apos;s like asking,
          &quot;How many steps will it take to find a specific LEGO brick in the
          box?&quot;
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            Space Complexity:
          </Text>{' '}
          Refers to how much memory (storage) is needed to perform a task. Think
          of it as asking, &quot;How many containers do I need to store all
          these LEGO bricks?&quot;
        </ListItem>
        <ListItem>
          <Text as="span" fontWeight="bold">
            Big O Notation:
          </Text>{' '}
          We use Big O notation to describe how complex a task is, showing how
          the number of steps or memory use changes as the problem gets bigger.
        </ListItem>
      </UnorderedList>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-big-o-notation-">
        <strong>Big O notation</strong>
      </Heading>
      <TableContainer
        border="1px solid"
        borderColor="gray.300"
        borderRadius="md"
        boxShadow="sm"
        mb={6}
      >
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>Complexity</Th>
              <Th>Big O Notation</Th>
              <Th>Explanation</Th>
              <Th>Example for Kids</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <strong>Constant</strong>
              </Td>
              <Td>O(1)</Td>
              <Td>Takes the same amount of time, no matter the size.</Td>
              <Td>Checking if the light is on or off.</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Logarithmic</strong>
              </Td>
              <Td>O(log n)</Td>
              <Td>Cuts the problem size in half each step.</Td>
              <Td>
                Finding a word in a dictionary by opening it halfway each time.
              </Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Linear</strong>
              </Td>
              <Td>O(n)</Td>
              <Td>Time grows with the size of the input.</Td>
              <Td>Searching for a lost toy in a long line of boxes.</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Log-linear</strong>
              </Td>
              <Td>O(n log n)</Td>
              <Td>A combination of linear and logarithmic growth.</Td>
              <Td>Sorting a large deck of cards.</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Quadratic</strong>
              </Td>
              <Td>O(n²)</Td>
              <Td>Time grows much faster than the input size.</Td>
              <Td>
                Checking each pair of LEGO bricks to see if they are the same.
              </Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Exponential</strong>
              </Td>
              <Td>O(2ⁿ)</Td>
              <Td>Doubles in time with each step increase.</Td>
              <Td>Figuring out all possible combinations of LEGO bricks.</Td>
            </Tr>
            <Tr>
              <Td>
                <strong>Factorial</strong>
              </Td>
              <Td>O(n!)</Td>
              <Td>Grows extremely fast as the input increases.</Td>
              <Td>Arranging a group of toys in every possible order.</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-memory-">
        <strong>Memory:</strong>
      </Heading>
      <List spacing={3} mb={6}>
        <ListItem display="flex" alignItems="center">
          <Text as="span">
            <strong>Bit:</strong> The smallest piece of data, which can be
            either 0 or 1. It&apos;s like a tiny light switch that can only be
            &quot;on&quot; or &quot;off&quot;.
          </Text>
        </ListItem>
        <ListItem display="flex" alignItems="center">
          <Text as="span">
            <strong>Byte:</strong> A group of 8 bits. Imagine 8 light switches
            in a row, which can create up to 256 different combinations
            (patterns of on and off). This allows us to represent many different
            pieces of information, such as letters, numbers, or colors.
          </Text>
        </ListItem>
      </List>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-logarithm-">
        <strong>Logarithm</strong>
      </Heading>
      <List spacing={4}>
        <ListItem>
          <Text mb={4}>
            <strong>Explanation:</strong> A logarithm is a way to measure how
            many times we need to divide a number by a certain factor to reach a
            specific value, usually 1. In programming and data structures,
            logarithms often come into play when we need to repeatedly reduce a
            problem in size. They help us understand how efficient certain
            algorithms are, especially those that cut the problem in half at
            each step.
          </Text>
        </ListItem>
        <ListItem>
          <Text mb={4}>
            <strong>Why It Matters:</strong> Understanding logarithms is crucial
            because they appear frequently in computer science, especially in
            algorithms that involve searching and sorting. For example,
            algorithms like binary search use logarithmic time complexity,
            meaning that as the size of the problem doubles, the number of steps
            needed only increases by one. This is a powerful way to make code
            run faster and handle larger data sets efficiently.
          </Text>
        </ListItem>
        <ListItem>
          <Text mb={4}>
            <strong>Example:</strong> Imagine you have 16 cookies, and you want
            to keep dividing them in half until you’re left with just one
            cookie. Here’s what happens:
          </Text>
          <List spacing={2} pl={6} styleType="disc">
            <ListItem>Start with 16 cookies.</ListItem>
            <ListItem>
              First cut: You divide 16 cookies in half, resulting in 8 cookies.
            </ListItem>
            <ListItem>
              Second cut: Divide 8 cookies in half, leaving you with 4 cookies.
            </ListItem>
            <ListItem>
              Third cut: Cut the 4 cookies in half, giving you 2 cookies.
            </ListItem>
            <ListItem>
              Fourth cut: Cut the 2 cookies in half, and now you have 1 cookie.
            </ListItem>
          </List>
        </ListItem>
        <Text mt={2}>
          It took 4 cuts to get from 16 cookies down to 1. This means the
          logarithm base 2 of 16 is 4, written as log₂(16) = 4. This example
          illustrates how logarithms count the number of times we need to divide
          something by 2 to reduce it down to 1.
        </Text>
        <ListItem>
          <Text mb={4}>
            <strong>Relevance in Algorithms:</strong> Consider a scenario where
            you need to find a word in a dictionary with 16,000 pages. Instead
            of checking each page one by one, you could use a logarithmic
            approach by opening the book in the middle and seeing if your word
            comes before or after that point. You can then keep dividing the
            remaining pages in half until you find the word. This process only
            takes about 14 steps (log₂(16,000) ≈ 14), which is much faster than
            checking each page individually.
          </Text>
        </ListItem>
      </List>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-arrays-">
        <strong>Arrays</strong>
      </Heading>
      <List spacing={4}>
        <ListItem>
          <Text mb={2}>
            <strong>Definition:</strong> An array is like a row of lockers where
            each locker holds a piece of data.
          </Text>
        </ListItem>
        <ListItem>
          <Text mb={2}>
            <strong>Types:</strong>
          </Text>
          <List spacing={2} pl={6} styleType="disc">
            <ListItem>
              <strong>Static Array:</strong> Has a fixed number of lockers
              (slots), like a row of 10 lockers in your school.
            </ListItem>
            <ListItem>
              <strong>Dynamic Array:</strong> Can grow to add more lockers if
              needed, just like when you add more shelves to a bookshelf.
            </ListItem>
          </List>
        </ListItem>
        <ListItem>
          <Text mb={2}>
            <strong>Common Operations:</strong>
          </Text>
          <List spacing={2} pl={6} styleType="disc">
            <ListItem>
              <strong>Initialization:</strong> Opening up all the lockers for
              use (O(n)).
            </ListItem>
            <ListItem>
              <strong>Traversal:</strong> Checking each locker one by one
              (O(n)).
            </ListItem>
            <ListItem>
              <strong>Insertion:</strong> Adding a new item, which can be quick
              or slow depending on where you put it.
            </ListItem>
          </List>
        </ListItem>
      </List>
      <br />
      <Heading as="h3" size="lg" mb={4} id="-linked-lists-">
        <strong>Linked Lists</strong>
      </Heading>
      <List spacing={4}>
        <ListItem>
          <Text mb={2}>
            <strong>Definition:</strong> Think of a linked list like a treasure
            hunt, where each clue (node) points to the next clue.
          </Text>
        </ListItem>
        <ListItem>
          <Text mb={2}>
            <strong>Types:</strong>
          </Text>
          <List spacing={2} pl={6} styleType="disc">
            <ListItem>
              <strong>Singly Linked List:</strong> Each node points to the next
              clue only.
            </ListItem>
            <ListItem>
              <strong>Doubly Linked List:</strong> Nodes have clues to the
              previous and next locations.
            </ListItem>
            <ListItem>
              <strong>Circular Linked List:</strong> The last clue leads back to
              the first, creating a loop.
            </ListItem>
          </List>
        </ListItem>
      </List>
      <br />
      <Heading as="h3" size="lg" mb={4} id="hash-tables">
        Hash Tables
      </Heading>
      <UnorderedList>
        <ListItem>
          <Text as="strong">Definition</Text>: A hash table is like a magic
          library where each book has a secret code (key). You can quickly find
          a book using the code.
        </ListItem>
        <ListItem>
          <Text as="strong">Time Complexity</Text>:
          <UnorderedList>
            <ListItem>
              <Text as="strong">Average Case</Text>: Very fast, like going
              straight to a specific shelf (O(1)).
            </ListItem>
            <ListItem>
              <Text as="strong">Worst Case</Text>: If the library is really
              messy, you might have to check every book (O(n)).
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          <Text as="strong">Challenges</Text>:
          <UnorderedList>
            <ListItem>
              Handling collisions, like when two books have the same code.
              Imagine two books trying to fit on the same shelf.
            </ListItem>
          </UnorderedList>
        </ListItem>
      </UnorderedList>
      <br />
      <Heading as="h3" size="lg" mb={4} id="stacks-and-queues">
        Stacks and Queues
      </Heading>
      <UnorderedList>
        <ListItem>
          <Text as="strong">Stack</Text>:
          <UnorderedList>
            <ListItem>
              <Text as="strong">Definition</Text>: Think of a stack as a stack
              of pancakes; you can only take the top pancake (Last In, First Out
              - LIFO).
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          <Text as="strong">Queue</Text>:
          <UnorderedList>
            <ListItem>
              <Text as="strong">Definition</Text>: A queue is like a line for
              the slide at the playground; the first person in line goes down
              the slide first (First In, First Out - FIFO).
            </ListItem>
          </UnorderedList>
        </ListItem>
        <ListItem>
          <Text as="strong">Complexity</Text>: Adding or removing items is
          quick, just like putting a pancake on top of the stack or joining the
          end of a line (O(1)).
        </ListItem>
      </UnorderedList>
      <br />
      <Heading as="h3" size="lg" mb={4} id="strings">
        Strings
      </Heading>
      <UnorderedList>
        <ListItem>
          <Text as="strong">Definition</Text>: A string is like a chain of
          letters, just like beads on a necklace.
        </ListItem>
        <ListItem>
          <Text as="strong">Are Strings Data Structures?</Text>: Yes, they are
          essentially arrays of characters (letters).
        </ListItem>
      </UnorderedList>
      <br />
      <Heading as="h3" size="lg" mb={4} id="graphs">
        Graphs
      </Heading>
      <UnorderedList>
        <ListItem>
          <Text as="strong">Definition</Text>: A graph is like a map with towns
          (nodes) connected by roads (edges).
        </ListItem>
        <ListItem>
          <Text as="strong">Types</Text>:
          <UnorderedList>
            <ListItem>
              <Text as="strong">Directed Graph</Text>: Roads only go one way,
              like a one-way street.
            </ListItem>
            <ListItem>
              <Text as="strong">Undirected Graph</Text>: Roads go both ways,
              like a normal street.
            </ListItem>
            <ListItem>
              <Text as="strong">Cyclic Graph</Text>: There are loops, like a
              roundabout.
            </ListItem>
            <ListItem>
              <Text as="strong">Acyclic Graph</Text>: No loops, just like a
              tree.
            </ListItem>
            <ListItem>
              <Text as="strong">Connected Graph</Text>: You can get from any
              town to any other town via roads.
            </ListItem>
          </UnorderedList>
        </ListItem>
      </UnorderedList>
      <br />
      <Heading as="h3" size="lg" mb={4} id="trees">
        Trees
      </Heading>
      <UnorderedList>
        <ListItem>
          <Text as="strong">Definition</Text>: A tree is a graph with no loops,
          like a family tree with parents and children.
        </ListItem>
        <ListItem>
          <Text as="strong">Characteristics</Text>: There are no disconnected
          branches.
        </ListItem>
        <ListItem>
          <Text as="strong">Types</Text>:
          <UnorderedList>
            <ListItem>
              <Text as="strong">Binary Tree</Text>: Each parent can have up to
              two children, like a decision tree in a game.
            </ListItem>
            <ListItem>
              <Text as="strong">K-ary Tree</Text>: Each parent can have up to K
              children.
            </ListItem>
            <ListItem>
              <Text as="strong">Perfect Binary Tree</Text>: All parents have two
              children, and all children are on the same level.
            </ListItem>
            <ListItem>
              <Text as="strong">Complete Binary Tree</Text>: Similar to a
              perfect tree but with some gaps in the last level.
            </ListItem>
            <ListItem>
              <Text as="strong">Balanced Binary Tree</Text>: The left and right
              sides are nearly the same height.
            </ListItem>
            <ListItem>
              <Text as="strong">Full Binary Tree</Text>: Each parent has zero or
              two children, like a family tree where each person either has no
              kids or exactly two kids.
            </ListItem>
          </UnorderedList>
        </ListItem>
      </UnorderedList>
    </div>
  )
}
