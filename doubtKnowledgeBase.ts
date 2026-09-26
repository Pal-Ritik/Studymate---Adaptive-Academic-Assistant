import { DoubtResolution } from '../types';

export const CURATED_DOUBTS: Record<string, Partial<DoubtResolution>> = {
  'zero': {
    coreConcept: 'Division by Zero & Limits',
    directAnswer: 'Dividing by zero is undefined because division asks: "What number multiplied by 0 gives you your original number?" Since 0 times anything is always 0, no number can ever give you a non-zero answer. Therefore, division by zero has no mathematical solution.',
    whyItsConfusing: 'When you divide by tiny numbers like 0.1 or 0.001, the answer gets huge (10, 1000). Students naturally assume dividing by actual zero must equal infinity, but division is an exact inverse equation.',
    intuitiveAnalogy: 'Think of 12 ÷ 3 as packing 12 apples into bags of 3 (you get 4 bags). Now try packing 12 apples into bags of 0. How many empty bags do you need to pack 12 apples? No amount of empty bags can ever hold 12 apples.',
    stepByStepSolution: [
      '**Step 1: Understand division as multiplication in reverse:** If a ÷ b = c, then b × c must equal a.',
      '**Step 2: Test dividing by zero:** Suppose 12 ÷ 0 = c. That means 0 × c must equal 12.',
      '**Step 3: See the impossibility:** Any number c multiplied by 0 is always 0 (0 × c = 0). It can never equal 12.',
      '**Step 4: Check approaching from both sides (Calculus):** Approaching 0 from positive numbers goes to +∞, but from negative numbers goes to -∞. Because they head toward opposite infinities, no single value exists.'
    ],
    realWorldExample: 'Calculators and programming languages trigger a "DivideByZeroError" crash because computer memory registers cannot allocate an infinite or non-existent value.',
    keyFormulaOrRule: 'Rule: a / b = c ⟺ b · c = a (Strictly forbidden when b = 0)',
    summaryBullets: [
      'Division by zero has no answer because 0 times any number is 0, never a non-zero number.',
      '1/0 is "undefined" (impossible), whereas 0/0 is "indeterminate" (any number works: 0 × c = 0).',
      'Calculators throw errors because a mathematically valid value does not exist.'
    ],
    commonPitfalls: [
      'Saying 1/0 = infinity (limits can approach infinity, but 1/0 itself has no value).',
      'Canceling algebraic terms like (x - 2)/(x - 2) without stating x ≠ 2.'
    ],
    checkYourUnderstanding: {
      question: 'Why is 5 / 0 considered "undefined" instead of "infinity"?',
      options: [
        'Because 0 multiplied by any number is always 0, so no number can ever equal 5',
        'Because infinity is not allowed in any branch of mathematics',
        'Because computers run out of RAM when dividing by 0',
        'Because 5 / 0 actually equals 0 in modern algebra'
      ],
      correctIndex: 0,
      explanation: 'Division a / b = c requires b × c = a. For 5 / 0 = c, 0 × c must equal 5, which is impossible since 0 times anything is 0.'
    }
  },
  'tcp': {
    coreConcept: 'TCP vs UDP Protocols',
    directAnswer: 'TCP is a reliable "check-and-verify" protocol that guarantees every packet arrives correctly in order. UDP is a fast "fire-and-forget" protocol that streams data as fast as possible without checking for lost packets. Video calls and gaming use UDP because a tiny lost pixel is much better than pausing your entire screen to wait for retransmission.',
    whyItsConfusing: 'Students wonder why anyone would ever want an "unreliable" protocol like UDP. The key insight is that real-time live media values speed and low latency over 100% perfect delivery.',
    intuitiveAnalogy: 'TCP is like registered postal mail: the recipient signs a receipt for every envelope, and if one is missing, it gets resent. UDP is like a live radio broadcast or shouting on a walkie-talkie: you keep speaking in real time even if static briefly blips out half a syllable.',
    stepByStepSolution: [
      '**Step 1: Connection Handshake:** TCP requires a 3-way handshake (SYN, SYN-ACK, ACK) before sending data. UDP sends immediately with zero setup.',
      '**Step 2: Packet Acknowledgement:** TCP sends back confirmation for each packet. If a packet is lost, TCP pauses and re-transmits it.',
      '**Step 3: Ordering & Flow Control:** TCP reorders packets if they arrive out of sequence. UDP accepts them in whatever order they land.',
      '**Step 4: Use Case Trade-off:** Web pages, emails, and bank transfers MUST use TCP (missing data corrupts the file). Zoom, YouTube live, and Discord voice use UDP (delay ruins conversations).'
    ],
    realWorldExample: 'When you are on a live Zoom call and the audio crackles for a millisecond, that is UDP dropping a packet and instantly moving forward instead of freezing the call.',
    keyFormulaOrRule: 'Rule of Thumb: Need 100% accuracy? Use TCP. Need real-time speed with zero lag? Use UDP.',
    summaryBullets: [
      'TCP = Reliable, ordered, slower, has 3-way handshake and retransmissions.',
      'UDP = Fast, connectionless, lightweight, tolerates minor packet loss.',
      'Live streaming, gaming, and VoIP use UDP; files, emails, and web pages use TCP.'
    ],
    commonPitfalls: [
      'Assuming UDP is "bad" because it is called unreliable; in real-time apps, delay is worse than lost packets.',
      'Thinking video files like Netflix (pre-recorded buffer) use pure raw UDP (they often stream over HTTP/TCP with large buffering).'
    ],
    checkYourUnderstanding: {
      question: 'Why do competitive online multiplayer games prefer UDP over TCP for player position updates?',
      options: [
        'Receiving outdated position data with lag is worse than skipping a single frame and receiving current location immediately',
        'UDP encrypts network packets automatically whereas TCP does not',
        'TCP cannot transmit numbers with decimal coordinates',
        'Routers refuse to forward TCP gaming packets'
      ],
      correctIndex: 0,
      explanation: 'In fast multiplayer games, knowing where a player was 200ms ago during a retransmission is useless; you only care about where the player is right now.'
    }
  },
  'sky': {
    coreConcept: 'Rayleigh Light Scattering',
    directAnswer: 'The sky is blue because sunlight is made of all colors of light, but when it enters Earth\'s atmosphere, gases scatter shorter blue wavelengths in every direction much more than longer red wavelengths. At sunset, sunlight passes through much thicker atmosphere, scattering away all the blue and leaving only direct red and orange wavelengths.',
    whyItsConfusing: 'Since violet light has an even shorter wavelength than blue, students wonder why the sky isn\'t violet! The reason is two-fold: the Sun emits much more blue light than violet, and human eyes have color receptors much more sensitive to blue.',
    intuitiveAnalogy: 'Imagine rolling large bowling balls and tiny marbles across a bumpy field with pebbles. The big bowling balls (long red waves) roll straight through unaffected, but the tiny marbles (short blue waves) collide with pebbles and ricochet in every direction across the sky.',
    stepByStepSolution: [
      '**Step 1: Sunlight is white light:** It contains the full spectrum from long red waves (~700nm) to short blue/violet waves (~400nm).',
      '**Step 2: Molecules in the air:** Earth\'s atmosphere is filled with nitrogen and oxygen molecules that are much smaller than visible light wavelengths.',
      '**Step 3: Rayleigh Scattering Law:** Scattering intensity is inversely proportional to the 4th power of wavelength (1 / λ⁴). Blue light is scattered roughly 10 times more effectively than red light!',
      '**Step 4: Looking up during the day:** You are seeing blue photons scattered across the atmosphere into your eyes from all directions.',
      '**Step 5: Sunsets:** When the sun is low on the horizon, light travels through 10× more atmosphere. The blue light gets scattered completely away, leaving only red and orange to reach your eyes.'
    ],
    realWorldExample: 'On the Moon, where there is no atmosphere to scatter light, the sky looks pitch black even in broad daylight with the Sun blazing.',
    keyFormulaOrRule: 'Rayleigh Law: Scattering Intensity ∝ 1 / λ⁴ (Shorter wavelengths scatter exponentially more)',
    summaryBullets: [
      'Blue light has a short wavelength and scatters in all directions off air molecules.',
      'We see blue instead of violet because sunlight has more blue energy and our eyes are more sensitive to blue.',
      'Sunsets are red because light travels through more atmosphere, scattering away blue light before it reaches us.'
    ],
    commonPitfalls: [
      'Believing the sky is blue because it reflects the ocean (it is actually the opposite: the ocean reflects the sky).',
      'Thinking clouds scatter blue light (cloud droplets are large, causing Mie scattering which scatters all colors equally, making them white).'
    ],
    checkYourUnderstanding: {
      question: 'What color would Earth\'s sky appear during daytime if our atmosphere were completely removed?',
      options: [
        'Pitch black with bright stars and a glaring white sun',
        'Deep vibrant red',
        'Uniform blinding white',
        'A glowing neon violet'
      ],
      correctIndex: 0,
      explanation: 'Without air molecules to scatter light, photons travel straight from the sun without illuminating the vacuum of space, just like on the Moon.'
    }
  },
  'quicksort': {
    coreConcept: 'Quicksort & Pivot Complexity',
    directAnswer: 'Quicksort works by choosing a "pivot" element and partitioning the array so smaller elements go to the left and larger elements go to the right, then repeating recursively. On average, it divides the work in half each time giving O(n log n) speed. But if you pick a terrible pivot (like the smallest element in an already sorted list), it only shrinks the problem by 1 element, degrading to O(n²) worst-case.',
    whyItsConfusing: 'Students hear Quicksort is "fastest in practice", yet its worst-case is O(n²), the same as Bubble Sort. The difference is that bad pivots are rare with randomized pivot selection, and Quicksort has low memory overhead and excellent CPU cache locality.',
    intuitiveAnalogy: 'Imagine organizing a class of 100 students by height. If you pick a student of average height as the pivot, you divide the class into two equal groups of 50. If you pick the shortest kid every time, you only separate 1 kid from 99 kids, taking 100 grueling rounds instead of just 7.',
    stepByStepSolution: [
      '**Step 1: Choose a pivot:** Pick an element from the array (first, last, random, or median-of-three).',
      '**Step 2: Partition:** Rearrange the array in linear O(n) time so all elements < pivot are on the left and all > pivot are on the right.',
      '**Step 3: Recursive Divide:** Recursively apply Quicksort to the left sub-array and right sub-array.',
      '**Step 4: Average Case O(n log n):** If splits are relatively balanced, the recursion tree has depth log n, and each level takes O(n) work.',
      '**Step 5: Worst Case O(n²):** If splits are completely unbalanced (e.g. 0 and n-1), recursion depth is n, taking n × n = O(n²) time.'
    ],
    realWorldExample: 'Most standard library sorting algorithms (like C++ `std::sort` or Python\'s Timsort) use hybrid sorting: Quicksort with random pivots, switching to Heapsort if recursion gets too deep (Introsort).',
    keyFormulaOrRule: 'Complexity: Average = O(n log n) | Worst = O(n²) | Space = O(log n) stack frames',
    summaryBullets: [
      'Quicksort is a divide-and-conquer algorithm based on pivot partitioning.',
      'Good pivots split the array in half (depth log n); poor pivots split off 1 element (depth n).',
      'Randomizing the pivot or using Median-of-Three virtually eliminates the O(n²) worst case.'
    ],
    commonPitfalls: [
      'Always picking `arr[0]` as pivot on already sorted arrays (guarantees O(n²) worst case!).',
      'Assuming Quicksort is stable (standard in-place partitioning swaps non-adjacent equal elements).'
    ],
    checkYourUnderstanding: {
      question: 'How do modern implementations prevent Quicksort from hitting its O(n²) worst-case performance on sorted inputs?',
      options: [
        'By picking random pivots or median-of-three, or falling back to Heapsort (Introsort)',
        'By converting all numbers to strings before sorting',
        'By running Bubble sort first as a warm-up step',
        'By disallowing arrays with more than 1,000 items'
      ],
      correctIndex: 0,
      explanation: 'Randomized pivot selection prevents predictable O(n²) patterns, and Introsort monitors recursion depth, safely switching to O(n log n) Heapsort if needed.'
    }
  }
};

/**
 * Intelligent dynamic topic generator for queries not explicitly in the curated map
 */
export function generateSmartDoubtFallback(
  doubtText: string,
  subject: string,
  academicLevel: string = 'Undergraduate',
  style: string = 'simple'
): DoubtResolution {
  const lower = doubtText.toLowerCase();

  // Check curated matches first
  for (const [key, preset] of Object.entries(CURATED_DOUBTS)) {
    if (lower.includes(key)) {
      return {
        doubtText,
        subject,
        coreConcept: preset.coreConcept || 'Core Academic Principle',
        directAnswer: preset.directAnswer || `The core explanation for "${doubtText}" stems from fundamental principles in ${subject}.`,
        whyItsConfusing: preset.whyItsConfusing || 'Students often confuse surface patterns with underlying causal rules.',
        intuitiveAnalogy: preset.intuitiveAnalogy || 'Think of it like balancing weights on a scale.',
        stepByStepSolution: preset.stepByStepSolution || ['Step 1: Identify terms', 'Step 2: Apply formula', 'Step 3: Verify conclusion'],
        realWorldExample: preset.realWorldExample || 'This is actively applied across everyday technology and industry.',
        keyFormulaOrRule: preset.keyFormulaOrRule || 'Core Principle: Balance & Invariance',
        summaryBullets: preset.summaryBullets || ['Clear definition', 'Actionable rule', 'Real-world validation'],
        commonPitfalls: preset.commonPitfalls || ['Overlooking edge cases', 'Confusing correlation with causation'],
        checkYourUnderstanding: preset.checkYourUnderstanding || {
          question: `Which fundamental principle is key to understanding "${doubtText.slice(0, 40)}"?`,
          options: [
            'Analyzing boundary conditions and basic definitions first',
            'Assuming random chance controls the entire outcome',
            'Ignoring real-world constraints',
            'Applying formulas without checking input units'
          ],
          correctIndex: 0,
          explanation: 'Examining definitions and boundary constraints gives the direct, reliable answer to this doubt.'
        }
      };
    }
  }

  // Dynamic contextual synthesis
  const cleanTitle = doubtText.replace(/^(why|how|what is|explain|difference between)\s+/i, '').replace(/[?!.]+$/, '');
  const capitalizedTopic = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1, 50);

  return {
    doubtText,
    subject,
    coreConcept: `${capitalizedTopic} Fundamentals`,
    directAnswer: `To resolve this doubt directly: ${cleanTitle} operates through clear, predictable rules in ${subject}. Rather than memorizing abstract rules, understanding the root cause makes the entire concept obvious and memorable.`,
    whyItsConfusing: `It is easy to get confused here because intuitive assumptions often contradict how the formal system or equation actually works under the hood.`,
    intuitiveAnalogy: `Imagine a standard highway or conveyor belt: if you change the speed at the entrance without adjusting capacity downstream, traffic builds up immediately. Systems always seek balance.`,
    stepByStepSolution: [
      `**Step 1: Define what is actually happening:** Break down "${cleanTitle.slice(0, 30)}" into its individual inputs and outputs.`,
      `**Step 2: Check the governing rule:** In ${subject}, fundamental conservation and consistency rules dictate how these components interact.`,
      `**Step 3: Follow the step-by-step logic:** As one parameter increases or changes, the responding variable adjusts to satisfy the system's boundary conditions.`,
      `**Step 4: Verify with an extreme case:** What happens if the value is zero or very large? Checking the extremes confirms the intuition.`
    ],
    realWorldExample: `Engineers and scientists use this exact model when designing resilient systems, predicting trends, and debugging unexpected failures.`,
    keyFormulaOrRule: `Golden Rule: Always test boundary values (0 and max) to immediately expose how the system behaves.`,
    summaryBullets: [
      `Directly addresses: ${cleanTitle.slice(0, 35)}.`,
      `Root cause: Governed by standard ${subject} principles and consistency rules.`,
      `Test tip: Always isolate variables before solving complex questions.`
    ],
    commonPitfalls: [
      'Assuming linear behavior when changes actually scale exponentially or inversely.',
      'Memorizing the final result without understanding the 2-step reasoning behind it.'
    ],
    checkYourUnderstanding: {
      question: `When solving problems involving ${cleanTitle.slice(0, 35)}, what is the most reliable first step?`,
      options: [
        'Identify boundary conditions and state the underlying definition clearly',
        'Guess based on the highest available number in the prompt',
        'Assume the system behaves identically in every conceivable scenario',
        'Skip directly to numerical calculation without symbolic simplification'
      ],
      correctIndex: 0,
      explanation: 'Establishing definitions and boundary limits prevents the most common logical and calculation errors on exam questions.'
    }
  };
}
