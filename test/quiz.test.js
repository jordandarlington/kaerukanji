import test from 'node:test';
import assert from 'node:assert/strict';
import { n5 } from '../decks/n5.js';
import { createQuestions, selectTopics, shuffle } from '../src/quiz.js';

const sourceGroups = [
  '一二三四五六七八九十百千円', '月火水木金土日年', '人子男女父母',
  '口目耳手足体力', '上下左右大小中外', '学校先生本名友', '山川田石雨夕岩音',
  '林森花竹犬貝牛魚鳥', '米肉茶好物', '今何分半方時間', '町寺東西南北車電',
  '高安多少新古明暗長元気', '見立入出休行来言帰書読話聞食飲買',
];

test('the deck exactly covers the 113 kanji on the requested source list', () => {
  assert.equal(n5.cards.length, 113);
  assert.deepEqual(n5.cards.map(card => card.kanji).sort(), [...sourceGroups.join('')].sort());
  assert.equal(new Set(n5.cards.map(card => card.kanji)).size, 113);
  assert.equal(new Set(n5.cards.map(card => card.category)).size, 13);
  for (const card of n5.cards) {
    assert.ok(card.word.includes(card.kanji));
    assert.match(card.reading, /^[ぁ-ゖー]+$/u);
    assert.ok(card.meaning.length > 0);
    assert.ok(card.source.startsWith('https://langoal.com/teaching-materials/kanji/'));
  }
});

for (const mode of ['reading', 'kanji']) {
  test(`${mode} mode has four unique choices and one correct answer throughout the full deck`, () => {
    for (const random of [() => 0, () => 0.99999, Math.random]) {
      const questions = createQuestions(n5, mode, 113, random);
      assert.equal(new Set(questions.map(question => question.card.kanji)).size, 113);
      for (const question of questions) {
        assert.equal(question.choices.length, 4);
        assert.equal(new Set(question.choices.map(choice => choice.label)).size, 4);
        assert.equal(question.choices.filter(choice => choice.correct).length, 1);
        assert.equal(question.prompt, mode === 'reading' ? question.card.word : question.card.reading);
        assert.equal(question.choices.find(choice => choice.correct).label, mode === 'reading' ? question.card.reading : question.card.word);
      }
    }
  });
}

test('shared readings cannot appear as incorrect kanji answers', () => {
  const cards = [
    { kanji: '雨', word: '雨', reading: 'あめ' },
    { kanji: '飴', word: '飴', reading: 'あめ' },
    { kanji: '山', word: '山', reading: 'やま' },
    { kanji: '川', word: '川', reading: 'かわ' },
    { kanji: '花', word: '花', reading: 'はな' },
  ];
  for (const question of createQuestions({ cards }, 'kanji', 5)) {
    for (const choice of question.choices.filter(choice => !choice.correct)) {
      assert.notEqual(cards.find(card => card.word === choice.label).reading, question.card.reading);
    }
  }
});

test('every answer keeps its source word, reading and translation in both modes', () => {
  for (const mode of ['reading', 'kanji']) {
    for (const question of createQuestions(n5, mode, 113)) {
      for (const choice of question.choices) {
        assert.ok(n5.cards.includes(choice.card));
        assert.equal(choice.label, mode === 'reading' ? choice.card.reading : choice.card.word);
        assert.ok(choice.card.meaning.length > 0);
        assert.equal(choice.correct, choice.card === question.card);
      }
    }
  }
});

test('question count supports one, presets, custom counts and all without repeats', () => {
  for (const count of [1, 10, 17, 20, 30, 113]) {
    const questions = createQuestions(n5, 'reading', count);
    assert.equal(questions.length, count);
    assert.equal(new Set(questions.map(question => question.card.kanji)).size, count);
  }
  for (const count of [0, 114, -1, 1.5, NaN, '10']) {
    assert.throws(() => createQuestions(n5, 'reading', count));
  }
  assert.throws(() => createQuestions(n5, 'unknown', 10));
});

test('shuffling and creating questions preserve the source deck', () => {
  const before = structuredClone(n5.cards);
  createQuestions(n5, 'reading', 10);
  createQuestions(n5, 'kanji', 113);
  assert.deepEqual(n5.cards, before);
  assert.notEqual(shuffle(n5.cards), n5.cards);
});

test('topic selection defaults to the full deck when all topics are selected', () => {
  const topics = [...new Set(n5.cards.map(card => card.category))];
  assert.deepEqual(selectTopics(n5, topics).cards, n5.cards);
  assert.equal(selectTopics(n5, ['Numbers', 'Food']).cards.length, 18);
  assert.equal(selectTopics(n5, ['Food', 'Food']).cards.length, 5);
  assert.deepEqual(selectTopics(n5, []).cards, []);
  assert.throws(() => createQuestions(selectTopics(n5, []), 'reading', 1));
  assert.throws(() => createQuestions(selectTopics(n5, ['Food']), 'reading', 6));
});

test('each topic supports both quiz modes with questions and choices restricted to that topic', () => {
  const before = structuredClone(n5);
  for (const topic of new Set(n5.cards.map(card => card.category))) {
    const filtered = selectTopics(n5, [topic]);
    for (const mode of ['reading', 'kanji']) {
      for (const random of [() => 0, () => 0.99999]) {
        const questions = createQuestions(filtered, mode, filtered.cards.length, random);
        assert.equal(new Set(questions.map(question => question.card.kanji)).size, filtered.cards.length);
        for (const question of questions) {
          assert.equal(question.card.category, topic);
          assert.equal(new Set(question.choices.map(choice => choice.label)).size, 4);
          assert.equal(question.choices.filter(choice => choice.correct).length, 1);
          assert.ok(question.choices.every(choice => choice.card.category === topic));
        }
      }
    }
  }
  assert.deepEqual(n5, before);
});
