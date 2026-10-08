const paths = {
  Numbers: 'M9 3 7 21 M17 3 15 21 M3 8h18 M2 16h18',
  Calendar: 'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z M7 3v4 M17 3v4 M3 11h18 M8 15h2 M14 15h2',
  People: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-4',
  Body: 'M12 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M4 10h16 M12 7v7 M12 14l-5 7 M12 14l5 7',
  Position: 'M12 3v18 M3 12h18 M9 6l3-3 3 3 M9 18l3 3 3-3 M6 9l-3 3 3 3 M18 9l3 3-3 3',
  School: 'M3 4h5a4 4 0 0 1 4 4v13a4 4 0 0 0-4-4H3Z M21 4h-5a4 4 0 0 0-4 4v13a4 4 0 0 1 4-4h5Z',
  Nature: 'M2 20 9 5l5 10 3-6 5 11Z M6 11l3 2 3-2',
  'Plants & animals': 'M12 21v-8 M12 16C4 16 3 10 3 5c6 0 9 4 9 11Z M12 13c0-6 4-9 9-10 0 6-3 10-9 10Z',
  Food: 'M5 3v7 M9 3v7 M5 7h4 M7 10v11 M18 3c-3 3-3 7 0 9h2 M20 3v18',
  Time: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 7v5l3 2',
  City: 'M3 21V9h7v12 M10 21V3h11v18 M1 21h22 M6 12v2 M6 17v1 M14 7h3 M14 11h3 M14 15h3',
  Adjectives: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
  Verbs: 'M13 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4 M6 12l3-4 5 1 3 4h4 M14 9l-3 6 5 3v4 M11 15l-4 5H3',
};

const aliases = {
  'Colours & shapes': 'Adjectives', Weather: 'Nature',
  'Countryside & clothes': 'Plants & animals', Cooking: 'Food',
  Address: 'City', Shopping: 'City', Transport: 'Position', Places: 'City',
  Study: 'School', Subjects: 'School', University: 'School', Hobbies: 'Verbs',
  'Paired verbs': 'Verbs', 'Adjectives 1': 'Adjectives', 'Adjectives 2': 'Adjectives',
};

export function createTopicIcon(topic) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('class', 'topic-icon');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('stroke', 'currentColor');
  icon.setAttribute('stroke-width', '1.6');
  icon.setAttribute('stroke-linecap', 'round');
  icon.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS(namespace, 'path');
  path.setAttribute('d', paths[aliases[topic] ?? topic] ?? 'M4 4h16v16H4Z M8 9h8 M8 15h8');
  icon.append(path);
  return icon;
}
