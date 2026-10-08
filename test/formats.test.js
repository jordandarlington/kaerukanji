import test from 'node:test';
import assert from 'node:assert/strict';
import { n5 } from '../decks/n5.js';
import { n4 } from '../decks/n4.js';
import { n3 } from '../decks/n3.js';
import { createQuestions, selectTopics } from '../src/quiz.js';

const fields = { kanji: 'word', reading: 'reading', english: 'meaning' };
const normalized = value => value.normalize('NFKC').trim().toLowerCase();

for (const prompt of Object.keys(fields)) {
  for (const answer of Object.keys(fields)) {
    if (prompt === answer) continue;
    test(`${prompt} → ${answer} supports every level and topic with unambiguous choices`, () => {
      for (const deck of [n5, n4, n3]) {
        const pools = [deck, ...[...new Set(deck.cards.map(card => card.category))].map(topic => selectTopics(deck, [topic]))];
        for (const pool of pools) {
          const questions = createQuestions(pool, { prompt, answer }, pool.cards.length);
          assert.equal(questions.length, pool.cards.length);
          for (const question of questions) {
            assert.equal(question.prompt, question.card[fields[prompt]]);
            assert.equal(question.choices.length, 4);
            assert.equal(new Set(question.choices.map(choice => normalized(choice.label))).size, 4);
            assert.equal(question.choices.filter(choice => choice.correct).length, 1);
            assert.equal(question.choices.find(choice => choice.correct).label, question.card[fields[answer]]);
            for (const choice of question.choices) {
              assert.ok(pool.cards.includes(choice.card));
              assert.equal(choice.label, choice.card[fields[answer]]);
              if (!choice.correct) assert.notEqual(normalized(choice.card[fields[prompt]]), normalized(question.prompt));
            }
          }
        }
      }
    });
  }
}

test('matching or unknown formats are rejected', () => {
  for (const format of Object.keys(fields)) {
    assert.throws(() => createQuestions(n5, { prompt: format, answer: format }, 10));
  }
  assert.throws(() => createQuestions(n5, { prompt: 'unknown', answer: 'english' }, 10));
  assert.throws(() => createQuestions(n5, { prompt: 'kanji', answer: 'unknown' }, 10));
});

test('English prompts exclude alternative words with the same meaning', () => {
  const cards = [
    { word: '大きい', reading: 'おおきい', meaning: 'Big' },
    { word: '大きな', reading: 'おおきな', meaning: 'big' },
    { word: '小さい', reading: 'ちいさい', meaning: 'small' },
    { word: '長い', reading: 'ながい', meaning: 'long' },
    { word: '短い', reading: 'みじかい', meaning: 'short' },
  ];
  for (const answer of ['kanji', 'reading']) {
    for (const question of createQuestions({ cards }, { prompt: 'english', answer }, cards.length)) {
      for (const choice of question.choices.filter(choice => !choice.correct)) {
        assert.notEqual(normalized(choice.card.meaning), normalized(question.prompt));
      }
    }
  }
});
