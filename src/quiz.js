export function selectTopics(deck, topics) {
  const selected = new Set(topics);
  return { ...deck, cards: deck.cards.filter(card => selected.has(card.category)) };
}

export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const next = Math.floor(random() * (index + 1));
    [result[index], result[next]] = [result[next], result[index]];
  }
  return result;
}

export function createQuestions(deck, mode, count, random = Math.random) {
  const formats = { kanji: 'word', reading: 'reading', english: 'meaning' };
  const direction = typeof mode === 'string'
    ? ({ reading: { prompt: 'kanji', answer: 'reading' }, kanji: { prompt: 'reading', answer: 'kanji' } })[mode]
    : mode;
  if (!direction || !formats[direction.prompt] || !formats[direction.answer] || direction.prompt === direction.answer) {
    throw new Error('Choose different question and answer formats.');
  }
  if (!Number.isInteger(count) || count < 1 || count > deck.cards.length) {
    throw new Error(`Choose between 1 and ${deck.cards.length} questions.`);
  }
  const promptField = formats[direction.prompt];
  const answerField = formats[direction.answer];
  const key = value => value.normalize('NFKC').trim().toLowerCase();
  return shuffle(deck.cards, random).slice(0, count).map(card => {
    const seen = new Set([key(card[answerField])]);
    const distractors = shuffle(deck.cards, random).filter(candidate => {
      // Cards sharing the prompt are also valid answers; never use them as distractors.
      if (key(candidate[promptField]) === key(card[promptField]) || seen.has(key(candidate[answerField]))) return false;
      if (direction.prompt !== 'english' && direction.answer !== 'english' && candidate.reading === card.reading) return false;
      seen.add(key(candidate[answerField]));
      return true;
    }).slice(0, 3);
    if (distractors.length < 3) throw new Error('The deck needs four distinct answers.');
    return {
      card,
      prompt: card[promptField],
      choices: shuffle([card, ...distractors].map(choice => ({
        label: choice[answerField],
        card: choice,
        correct: choice === card,
      })), random),
    };
  });
}
