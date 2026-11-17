import type { DomainId } from './types';

/**
 * New questions written for the relaunch. [domain, title, optional framing]
 * Legacy questions from quarxtheories.com live in legacy.generated.json.
 */
export const NEW_QUESTIONS: [DomainId, string, string?][] = [
  // The Universe
  ['universe', 'Is the Universe finite or infinite — and does it matter to how we live?'],
  ['universe', 'Are the laws of physics discovered or invented?'],
  ['universe', 'Is there a purpose built into the cosmos, or do we bring it?'],
  ['universe', 'What came before the Big Bang, if "before" even applies?'],
  ['universe', 'Are we alone because life is rare, or because we are early?'],
  ['universe', 'If the Universe will end, does anything we do last?'],
  [
    'universe',
    'Why is the Universe understandable at all?',
    'Einstein called it the most incomprehensible thing about the world.',
  ],

  // Consciousness
  ['consciousness', 'Could consciousness exist without a body?'],
  ['consciousness', 'Are animals conscious in the way we are?'],
  ['consciousness', 'Is the self an illusion?'],
  ['consciousness', 'Where do "you" go during dreamless sleep?'],
  ['consciousness', 'Is intuition a form of knowing?'],
  [
    'consciousness',
    'Why does experience feel like anything at all?',
    'The so-called hard problem: why is there something it is like to be you?',
  ],
  ['consciousness', 'Can consciousness be shared between people?'],

  // Reality & Perception (new domain)
  ['reality', 'Are we living in a simulation?'],
  ['reality', 'Is color out in the world, or only in our heads?'],
  ['reality', 'Is reality the same for everyone?'],
  ['reality', 'Are coincidences ever meaningful?'],
  ['reality', 'Is mathematics the language of reality, or only of humans?'],
  ['reality', 'Can we ever see the world as it truly is?'],
  ['reality', 'What is "nothing"?'],
  ['reality', 'Does observing something change it?'],

  // Sapiens
  ['sapiens', 'What is the most human thing a person can do?'],
  ['sapiens', 'Are humans fundamentally good?'],
  ['sapiens', 'What have we lost by becoming civilized?'],
  ['sapiens', 'Why do we need stories?'],
  ['sapiens', 'What is wisdom, and can it be taught?'],
  ['sapiens', 'Why do humans make art?'],
  ['sapiens', 'Is suffering necessary for growth?'],

  // Meaning & Purpose (new domain)
  ['meaning', 'Does life have meaning, or do we make it?'],
  ['meaning', 'What makes a life well-lived?'],
  ['meaning', 'Is happiness the right goal?'],
  ['meaning', 'What do you owe the version of yourself you were ten years ago?'],
  ['meaning', 'How do you know when you have found your purpose?'],
  ['meaning', 'Can a meaningful life also be an ordinary one?'],
  ['meaning', 'What is enough?'],
  ['meaning', 'Why are we so afraid of wasting our lives?'],

  // Love
  ['love', 'Can you love someone you do not like?'],
  ['love', 'Is love a choice or a feeling?'],
  ['love', 'Can romantic love last a lifetime?'],
  ['love', 'What is the difference between love and attachment?'],
  ['love', 'How do you love yourself without becoming selfish?'],
  ['love', 'What does a friendship owe us?'],
  ['love', 'Can you love humanity without loving people?'],

  // Death & Beyond (new domain)
  ['death', 'Would you want to live forever?'],
  ['death', 'How should we grieve?'],
  ['death', 'Does knowing we will die make life more meaningful?'],
  ['death', 'What do we owe the dead?'],
  ['death', 'Is it possible to be at peace with death?'],
  ['death', 'Are we afraid of dying, or of not having lived?'],
  ['death', 'What would you say to someone on their last day?'],
  ['death', 'Is death the end of a story, or part of it?'],

  // Ethics
  ['ethics', 'Is it ever right to lie?'],
  ['ethics', 'Do we have duties to people who have not been born yet?'],
  ['ethics', 'Should we eat animals?'],
  ['ethics', 'Is morality universal, or does it depend on culture?'],
  ['ethics', 'Are we responsible for what we do not know?'],
  ['ethics', 'Is it wrong to be extremely rich while others suffer?'],
  ['ethics', 'Can a good person do evil things?'],

  // Society
  ['society', 'What should every child be taught?'],
  ['society', 'Is democracy the best system we have, or just the best we have tried?'],
  ['society', 'What is the purpose of work?'],
  ['society', 'Why are we more connected, and lonelier, than ever?'],
  ['society', 'Should borders exist?'],
  ['society', 'What makes a community?'],
  ['society', 'Is progress real?'],

  // The Future
  ['future', 'What will humans 1,000 years from now think of us?'],
  ['future', 'Should we settle other planets, or fix this one first?'],
  ['future', 'Will humans and nature ever be in balance?'],
  ['future', 'What single invention would change everything?'],
  ['future', 'Is the future something we predict, or something we choose?'],
  ['future', 'What will replace religion, if anything?'],

  // Mind & Machine (new domain)
  ['machine', 'Can a machine ever be conscious?'],
  ['machine', 'If AI can write theories, what is human thought for?'],
  ['machine', 'Should an artificial mind have rights?'],
  ['machine', 'Will technology make us wiser, or only faster?'],
  ['machine', 'What should never be automated?'],
  ['machine', 'Are our phones changing who we are?'],
  ['machine', 'Would you upload your mind if you could?'],
  ['machine', 'What does creativity mean when machines can create?'],

  // Personal
  ['personal', 'What belief have you changed your mind about?'],
  ['personal', 'What did you know as a child that you have since forgotten?'],
  ['personal', 'What would you tell your younger self?'],
  ['personal', 'When do you feel most alive?'],
  ['personal', 'What is the most important thing a stranger ever taught you?'],
  ['personal', 'What is the most important question no one is asking?'],

  // Far Out
  ['far-out', 'What if time runs in loops?'],
  ['far-out', 'What did ancient people know that we have forgotten?'],
  ['far-out', 'If plants could speak, what would they say?'],
  ['far-out', 'What lies at the edge of the Universe?'],
];

/**
 * Question of the Week schedule for the relaunch. Week 1 starts on QOTW_START
 * (a Monday) and each following Monday moves one step down the list.
 */
export const QOTW_START = '2026-11-16';
export const QOTW_SCHEDULE: string[] = [
  'What do you owe the version of yourself you were ten years ago?',
  'Can you love someone you do not like?',
  'If AI can write theories, what is human thought for?',
  'What is enough?',
  'What do we owe the dead?',
  'Is the self an illusion?',
  'Are coincidences ever meaningful?',
  'What have we lost by becoming civilized?',
  'What will humans 1,000 years from now think of us?',
  'Why do we need stories?',
  'Would you want to live forever?',
  'What is the most important question no one is asking?',
  'Is it ever right to lie?',
  'What did you know as a child that you have since forgotten?',
  'Is progress real?',
  'Why does experience feel like anything at all?',
];
