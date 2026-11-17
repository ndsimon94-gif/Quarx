import type { Domain, DomainId } from './types';

export const DOMAINS: Domain[] = [
  {
    id: 'universe',
    name: 'The Universe',
    tagline: 'Origins, time, the vastness, and why there is anything at all.',
    icon: 'planet-outline',
    hue: '#8fb3ff',
  },
  {
    id: 'consciousness',
    name: 'Consciousness',
    tagline: 'Awareness, thought, dreams, and the self that notices.',
    icon: 'eye-outline',
    hue: '#c7a6ff',
  },
  {
    id: 'reality',
    name: 'Reality & Perception',
    tagline: 'What is real, what is seen, and the gap between them.',
    icon: 'prism-outline',
    hue: '#7fe0d6',
  },
  {
    id: 'sapiens',
    name: 'Sapiens',
    tagline: 'Who we are, what we strive for, and what makes us human.',
    icon: 'body-outline',
    hue: '#f5c77e',
  },
  {
    id: 'meaning',
    name: 'Meaning & Purpose',
    tagline: 'Why live, what matters, and how to live well.',
    icon: 'compass-outline',
    hue: '#ffd98f',
  },
  {
    id: 'love',
    name: 'Love',
    tagline: 'Connection, devotion, heartbreak, and the deepest bonds.',
    icon: 'heart-outline',
    hue: '#ff9aa8',
  },
  {
    id: 'death',
    name: 'Death & Beyond',
    tagline: 'Mortality, grief, legacy, and what may come after.',
    icon: 'moon-outline',
    hue: '#a9b6d6',
  },
  {
    id: 'ethics',
    name: 'Ethics',
    tagline: 'Right, wrong, rights, and how we decide.',
    icon: 'scale-outline',
    hue: '#9fd49a',
  },
  {
    id: 'society',
    name: 'Society',
    tagline: 'Freedom, power, money, conflict, and living together.',
    icon: 'people-outline',
    hue: '#f2a65a',
  },
  {
    id: 'future',
    name: 'The Future',
    tagline: 'Where our species is headed, and whether we will make it.',
    icon: 'rocket-outline',
    hue: '#6fd0ff',
  },
  {
    id: 'machine',
    name: 'Mind & Machine',
    tagline: 'Artificial minds, technology, and what it means for us.',
    icon: 'hardware-chip-outline',
    hue: '#9ad0c2',
  },
  {
    id: 'personal',
    name: 'Personal',
    tagline: 'If you could… — questions only you can answer.',
    icon: 'person-outline',
    hue: '#e9b8ff',
  },
  {
    id: 'far-out',
    name: 'Far Out',
    tagline: 'Your wildest, strangest, most beautiful ideas.',
    icon: 'sparkles-outline',
    hue: '#ffe27a',
  },
];

const byId = new Map(DOMAINS.map((d) => [d.id, d]));

export function getDomain(id: DomainId | null | undefined): Domain | undefined {
  return id ? byId.get(id) : undefined;
}
