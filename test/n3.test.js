import test from 'node:test';
import assert from 'node:assert/strict';
import { n3 } from '../decks/n3.js';
import { createQuestions, selectTopics } from '../src/quiz.js';

const groups = {
  Time: '曜末昨翌現昔次回再旧秒',
  People: '彼君仲達供娘婦老他',
  Body: '頭顔鼻首血液歯型',
  Food: '氷湯卵豆粉乳塩調和',
  Adjectives: '熱冷暖温良悪厚易難深浅痛苦欲',
  Verbs: '捨拾貸借覚忘押引打投信伝想続祝願酔',
  'Daily life': '起寝洗濯干浴活夢貯列袋久',
  Feelings: '喜怒笑泣悲涙幸感情悩困残念',
  Relationships: '関係結婚独身恋愛永福',
  Plans: '予定用事約束必要取消返守',
  Quantities: '杯枚匹冊各量最単複全以未満無非',
  Nature: '季候島陸河流陽岸',
  Agriculture: '農産果実葉菜植根',
  Directions: '位置存在積央向底',
  Buildings: '建築構造設橋',
  Home: '窓戸階段机柱庫',
  Driving: '角坂折曲路側直線逆進禁許',
  Introductions: '初姓個性変付紹介常識失礼',
  School: '授業欠席成績',
};

test('N3 covers the 197 source kanji and combines numbered groups into 19 topics', () => {
  assert.equal(n3.cards.length, 197);
  assert.equal(new Set(n3.cards.map(card => card.kanji)).size, 197);
  assert.deepEqual([...new Set(n3.cards.map(card => card.category))].sort(), Object.keys(groups).sort());
  for (const [topic, kanji] of Object.entries(groups)) {
    assert.deepEqual(selectTopics(n3, [topic]).cards.map(card => card.kanji).sort(), [...kanji].sort());
  }
  for (const card of n3.cards) {
    assert.ok(card.word.includes(card.kanji), card.kanji);
    assert.match(card.reading, /^[ぁ-ゖー]+$/u);
    assert.ok(card.meaning.length > 0);
    assert.ok(card.source.startsWith('https://langoal.com/teaching-materials/kanji/'));
  }
});

test('N3 full-deck and topic rounds work in both modes without ambiguous answers', () => {
  const before = structuredClone(n3);
  const decks = [n3, ...Object.keys(groups).map(topic => selectTopics(n3, [topic]))];
  for (const deck of decks) {
    for (const mode of ['reading', 'kanji']) {
      for (const random of [() => 0, () => 0.99999, Math.random]) {
        const questions = createQuestions(deck, mode, deck.cards.length, random);
        assert.equal(new Set(questions.map(question => question.card.kanji)).size, deck.cards.length);
        for (const question of questions) {
          assert.equal(question.prompt, mode === 'reading' ? question.card.word : question.card.reading);
          assert.equal(new Set(question.choices.map(choice => choice.label)).size, 4);
          assert.equal(question.choices.filter(choice => choice.correct).length, 1);
          for (const choice of question.choices) {
            assert.ok(deck.cards.includes(choice.card));
            assert.equal(choice.label, mode === 'reading' ? choice.card.reading : choice.card.word);
            if (!choice.correct) assert.notEqual(choice.card.reading, question.card.reading);
          }
        }
      }
    }
  }
  assert.deepEqual(n3, before);
  assert.throws(() => createQuestions(n3, 'reading', 198));
});

test('末 uses a verified weekend example instead of the source page’s 未 examples', () => {
  const card = n3.cards.find(card => card.kanji === '末');
  assert.equal(card.word, '週末');
  assert.equal(card.reading, 'しゅうまつ');
  assert.equal(card.meaning, 'weekend');
  assert.equal(card.vocabularySource, 'https://www.jpf.or.kr/irodori/sData/pdf/resources/wordlist_X.pdf');
});
