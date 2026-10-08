import test from 'node:test';
import assert from 'node:assert/strict';
import { n5 } from '../decks/n5.js';
import { n4 } from '../decks/n4.js';
import { n3 } from '../decks/n3.js';
import { filterCards } from '../src/browse.js';

test('browsing all topics includes the full selected level without changing the deck', () => {
  for (const deck of [n5, n4, n3]) {
    const before = structuredClone(deck);
    const topics = [...new Set(deck.cards.map(card => card.category))];
    assert.deepEqual(filterCards(deck, topics), deck.cards);
    assert.deepEqual(filterCards(deck, [], 'one'), []);
    assert.deepEqual(deck, before);
  }
});

test('browse search supports target kanji, words, readings, meanings and topics', () => {
  const topics = [...new Set(n5.cards.map(card => card.category))];
  const target = n5.cards.find(card => card.kanji === '食');
  for (const query of ['食', target.word, target.reading, target.meaning.toUpperCase(), '  Verbs  ']) {
    assert.ok(filterCards(n5, topics, query).includes(target), query);
  }
  assert.deepEqual(filterCards(n5, topics, 'no such vocabulary'), []);
});

test('browse search combines topic filters and query terms and accepts katakana readings', () => {
  const target = n5.cards.find(card => card.kanji === '食');
  assert.deepEqual(filterCards(n5, ['Numbers'], target.reading), []);
  const katakana = target.reading.replace(/[ぁ-ゖ]/g, character => String.fromCharCode(character.charCodeAt(0) + 0x60));
  assert.ok(filterCards(n5, ['Verbs'], katakana).includes(target));
  assert.ok(filterCards(n5, ['Verbs'], `${target.reading} ${target.meaning}`).includes(target));
  assert.deepEqual(filterCards(n5, ['Verbs'], `${target.reading} unrelated`), []);
});
