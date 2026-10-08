import { createTopicIcon } from './topic-icons.js';

function normalize(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, character =>
    String.fromCharCode(character.charCodeAt(0) - 0x60));
}

export function filterCards(deck, topics, query = '') {
  const selected = new Set(topics);
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  return deck.cards.filter(card => selected.has(card.category) && terms.every(term =>
    normalize([card.kanji, card.word, card.reading, card.meaning, card.category].join(' ')).includes(term)));
}

export function initializeBrowse({ getDeck }) {
  const $ = id => document.getElementById(id);
  const form = $('browse-filters');
  let level;

  const selectedTopics = () => new FormData(form).getAll('topics');

  function render() {
    const deck = getDeck();
    const topics = selectedTopics();
    const allTopics = [...new Set(deck.cards.map(card => card.category))];
    const filtered = filterCards(deck, topics, $('browse-search').value);
    $('browse-topic-summary').textContent = topics.length === allTopics.length ? 'All topics' : `${topics.length} of ${allTopics.length} topics`;
    $('browse-count').textContent = `${filtered.length} of ${deck.cards.length} cards`;
    $('browse-empty').hidden = filtered.length !== 0;
    $('browse-empty').textContent = topics.length === 0 ? 'Select a topic to see its cards.' : 'No matching cards. Try another search or choose more topics.';
    $('browse-grid').replaceChildren(...filtered.map(card => {
      const article = document.createElement('article');
      article.className = 'browse-card';
      const topic = document.createElement('span');
      topic.className = 'browse-card-topic';
      topic.textContent = card.category;
      const word = document.createElement('h3');
      word.className = 'browse-card-word';
      word.lang = 'ja';
      word.textContent = card.word;
      const reading = document.createElement('span');
      reading.className = 'browse-card-reading';
      reading.lang = 'ja';
      reading.textContent = card.reading;
      const meaning = document.createElement('span');
      meaning.className = 'browse-card-meaning';
      meaning.textContent = card.meaning;
      article.append(topic, word, reading, meaning);
      return article;
    }));
  }

  function refresh() {
    const deck = getDeck();
    if (level !== deck.id) {
      level = deck.id;
      const topics = [...new Set(deck.cards.map(card => card.category))];
      $('browse-topics').replaceChildren(...topics.map(topic => {
        const label = document.createElement('label');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'topics';
        input.value = topic;
        input.checked = true;
        const text = document.createElement('strong');
        text.textContent = topic;
        const count = document.createElement('small');
        const total = deck.cards.filter(card => card.category === topic).length;
        count.textContent = String(total);
        count.setAttribute('aria-label', `${total} kanji`);
        label.append(input, createTopicIcon(topic), text, count);
        return label;
      }));
    }
    render();
  }

  form.addEventListener('submit', event => event.preventDefault());
  $('browse-search').addEventListener('input', render);
  $('browse-topics').addEventListener('change', render);
  function setTopics(checked) {
    for (const input of $('browse-topics').querySelectorAll('input')) input.checked = checked;
    render();
  }
  $('browse-select-all').addEventListener('click', () => setTopics(true));
  $('browse-clear-all').addEventListener('click', () => setTopics(false));
  $('browse-reset').addEventListener('click', () => {
    $('browse-search').value = '';
    setTopics(true);
  });
  refresh();
  return { refresh };
}
