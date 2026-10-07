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
  if (!['reading', 'kanji'].includes(mode)) throw new Error('Unknown quiz mode.');
  if (!Number.isInteger(count) || count < 1 || count > deck.cards.length) {
    throw new Error(`Choose between 1 and ${deck.cards.length} questions.`);
  }
  const answerField = mode === 'reading' ? 'reading' : 'word';
  return shuffle(deck.cards, random).slice(0, count).map(card => {
    const seen = new Set([card[answerField]]);
    const distractors = shuffle(deck.cards, random).filter(candidate => {
      // A shared reading makes either word a valid answer in reverse mode.
      if (candidate.reading === card.reading || seen.has(candidate[answerField])) return false;
      seen.add(candidate[answerField]);
      return true;
    }).slice(0, 3);
    if (distractors.length < 3) throw new Error('The deck needs four distinct answers.');
    return {
      card,
      prompt: mode === 'reading' ? card.word : card.reading,
      choices: shuffle([card, ...distractors].map(choice => ({
        label: choice[answerField],
        card: choice,
        correct: choice === card,
      })), random),
    };
  });
}
