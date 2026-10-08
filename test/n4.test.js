import test from 'node:test';
import assert from 'node:assert/strict';
import { n4 } from '../decks/n4.js';
import { n5 } from '../decks/n5.js';
import { createQuestions, selectTopics } from '../src/quiz.js';

const sourceGroups = [
  '朝昼晩夜前後正午毎週去', '家族兄弟姉妹夫妻主奥私王様才',
  '赤青白黒色銀黄緑丸玉', '春夏秋冬空天風台雲雪晴星光',
  '地谷自然草原海湖池', '里野虫羽馬鳴毛糸衣服洋',
  '料理飯麦油酒味', '住所都道府県京市区村番号国紙',
  '店客売品薬待合計辺', '交通荷送宅止急特鉄船',
  '部屋教室会社駅工場病院公園図館映画', '勉強宿題質問試験答考',
  '字文漢数英語化育', '研究医科政治経済歴史',
  '運動泳旅世界練習写真楽声歌集', '作使思持当知働',
  '始終乗降開閉発着走歩', '近遠重軽早速遅広細太暑寒',
  '低短弱若静有心同便利親切不',
];

test('N4 covers all 209 kanji and 19 topics from the source overview', () => {
  assert.equal(n4.cards.length, 209);
  assert.deepEqual(n4.cards.map(card => card.kanji).sort(), [...sourceGroups.join('')].sort());
  assert.equal(new Set(n4.cards.map(card => card.kanji)).size, 209);
  assert.equal(new Set(n4.cards.map(card => card.category)).size, 19);
  for (const card of n4.cards) {
    assert.ok(card.word.includes(card.kanji), card.kanji);
    assert.match(card.reading, /^[ぁ-ゖー]+$/u);
    assert.ok(card.meaning.length > 0);
    assert.ok(card.source.startsWith('https://langoal.com/teaching-materials/kanji/'));
  }
});

test('N4 full-deck and individual-topic rounds have four distinct valid answers in both modes', () => {
  const before = structuredClone(n4);
  const decks = [n4, ...[...new Set(n4.cards.map(card => card.category))].map(topic => selectTopics(n4, [topic]))];
  for (const deck of decks) {
    for (const mode of ['reading', 'kanji']) {
      for (const random of [() => 0, () => 0.99999, Math.random]) {
        const questions = createQuestions(deck, mode, deck.cards.length, random);
        assert.equal(new Set(questions.map(question => question.card.kanji)).size, deck.cards.length);
        for (const question of questions) {
          assert.equal(new Set(question.choices.map(choice => choice.label)).size, 4);
          assert.equal(question.choices.filter(choice => choice.correct).length, 1);
          assert.equal(question.prompt, mode === 'reading' ? question.card.word : question.card.reading);
          for (const choice of question.choices) {
            assert.ok(deck.cards.includes(choice.card));
            if (!choice.correct) assert.notEqual(choice.card.reading, question.card.reading);
          }
        }
      }
    }
  }
  assert.deepEqual(n4, before);
});

test('N4 counts are independent of the N5 deck limits', () => {
  assert.equal(createQuestions(n4, 'reading', 209).length, 209);
  assert.throws(() => createQuestions(n4, 'reading', 210));
  assert.throws(() => createQuestions(n5, 'reading', 209));
});
