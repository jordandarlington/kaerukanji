import { n5 } from './decks/n5.js';
import { createQuestions } from './src/quiz.js';
import { initializeTheme } from './src/theme.js';

initializeTheme();

// Register a new deck here when adding N4 or other levels.
const deck = n5;
const $ = id => document.getElementById(id);
const settingsForm = $('settings');
let session;

function showSettings() {
  $('settings-panel').hidden = false;
  $('mobile-settings-link').hidden = false;
  $('workspace').classList.remove('quiz-active');
  $('workspace').classList.remove('setup-active');
}

function showSetup(focus = false) {
  session = null;
  showSettings();
  $('workspace').classList.add('setup-active');
  $('quiz-panel').hidden = true;
  $('quiz-view').hidden = true;
  $('results-view').hidden = true;
  if (focus) settingsForm.querySelector('input:checked').focus();
}

function startQuiz(settings, focus = false) {
  session = {
    settings,
    questions: createQuestions(deck, settings.mode, settings.count),
    index: 0,
    answers: [],
  };
  $('workspace').classList.remove('setup-active');
  $('quiz-panel').hidden = false;
  $('settings-panel').hidden = true;
  $('mobile-settings-link').hidden = true;
  $('workspace').classList.add('quiz-active');
  $('quiz-panel').setAttribute('aria-labelledby', 'quiz-title');
  $('results-view').hidden = true;
  $('quiz-view').hidden = false;
  $('quiz-title').textContent = settings.mode === 'reading' ? 'Choose the hiragana' : 'Choose the kanji';
  $('progress').setAttribute('aria-valuemax', settings.count);
  renderQuestion(focus);
}

function renderQuestion(focus = false) {
  const { card, prompt, choices } = session.questions[session.index];
  $('meaning').hidden = true;
  $('meaning').textContent = card.meaning;
  $('question-position').replaceChildren();
  const position = document.createElement('strong');
  position.textContent = String(session.index + 1).padStart(2, '0');
  $('question-position').append(position, ` / ${String(session.settings.count).padStart(2, '0')}`);
  $('progress').setAttribute('aria-valuenow', session.answers.length);
  $('progress-fill').style.width = `${session.answers.length / session.settings.count * 100}%`;
  $('card-category').textContent = card.category;
  // Keep the answer out of the card in the hiragana-to-kanji direction.
  $('target-kanji').textContent = session.settings.mode === 'reading' && card.word !== card.kanji ? `Focus: ${card.kanji}` : '';
  $('card-prompt').textContent = prompt;
  $('card-prompt').classList.toggle('reading-prompt', session.settings.mode === 'kanji');
  $('flashcard').setAttribute('aria-label', `${session.settings.mode === 'reading' ? 'Kanji word' : 'Hiragana reading'}: ${prompt}`);
  $('feedback').textContent = 'Choose one answer to continue.';
  $('feedback').className = 'feedback';
  $('next').hidden = true;
  $('answers').replaceChildren(...choices.map((choice, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer';
    const key = document.createElement('span');
    key.className = 'answer-key';
    key.textContent = index + 1;
    key.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'answer-label';
    label.lang = 'ja';
    label.textContent = choice.label;
    button.append(key, label);
    button.addEventListener('click', () => answer(index));
    return button;
  }));
  if (focus) $('answers').querySelector('button').focus({ preventScroll: true });
}

function answer(index) {
  if (session.answers.length > session.index) return;
  const question = session.questions[session.index];
  const chosen = question.choices[index];
  session.answers.push({ card: question.card, correct: chosen.correct });
  [...$('answers').children].forEach((button, choiceIndex) => {
    button.disabled = true;
    if (question.choices[choiceIndex].correct || choiceIndex === index) {
      const correct = question.choices[choiceIndex].correct;
      button.classList.add(correct ? 'correct' : 'wrong');
      const mark = document.createElement('span');
      mark.className = 'answer-status';
      mark.textContent = correct ? '✓' : '×';
      mark.setAttribute('aria-hidden', 'true');
      button.append(mark);
      button.setAttribute('aria-label', `${question.choices[choiceIndex].label}: ${correct ? 'correct answer' : 'incorrect answer'}`);
    }
  });
  const { word, reading, meaning } = question.card;
  $('feedback').textContent = `${chosen.correct ? 'Correct.' : 'Not quite.'} ${word} · ${reading} — ${meaning}`;
  $('feedback').className = `feedback ${chosen.correct ? 'correct-feedback' : 'wrong-feedback'}`;
  $('progress-fill').style.width = `${session.answers.length / session.settings.count * 100}%`;
  $('progress').setAttribute('aria-valuenow', session.answers.length);
  $('next').textContent = session.index === session.questions.length - 1 ? 'See results' : 'Next card';
  $('next').hidden = false;
  $('next').focus({ preventScroll: true });
}

function nextQuestion() {
  if (session.answers.length <= session.index) return;
  if (session.index === session.questions.length - 1) return showResults();
  session.index++;
  renderQuestion(true);
}

function showResults() {
  const score = session.answers.filter(answer => answer.correct).length;
  const missed = session.answers.filter(answer => !answer.correct);
  showSettings();
  $('quiz-panel').setAttribute('aria-labelledby', 'results-title');
  $('quiz-view').hidden = true;
  $('results-view').hidden = false;
  $('score').textContent = score;
  $('score-total').textContent = ` / ${session.settings.count}`;
  $('results-message').textContent = missed.length === 0 ? 'Every card correct. Nicely done.' : `${score} of ${session.settings.count} correct. Every round is a little more practice.`;
  $('review-section').hidden = missed.length === 0;
  $('review-list').replaceChildren(...missed.map(({ card }) => {
    const row = document.createElement('li');
    for (const [index, text] of [card.word, card.reading, card.meaning].entries()) {
      const span = document.createElement('span');
      span.textContent = text;
      if (index < 2) span.lang = 'ja';
      row.append(span);
    }
    return row;
  }));
  $('results-title').focus({ preventScroll: true });
}

function setMeaningVisible(visible) {
  $('meaning').hidden = !visible;
}
$('flashcard').addEventListener('mouseenter', () => {
  if (session) setMeaningVisible(true);
});
$('flashcard').addEventListener('mouseleave', () => {
  if (!$('flashcard').matches(':focus-visible')) setMeaningVisible(false);
});
$('flashcard').addEventListener('focus', () => {
  if (session) setMeaningVisible(true);
});
$('flashcard').addEventListener('blur', () => setMeaningVisible(false));
$('flashcard').addEventListener('pointerup', event => {
  if (session && event.pointerType === 'touch') setMeaningVisible(true);
});

function updateCountPresets() {
  const value = Number($('question-count').value);
  for (const button of document.querySelectorAll('[data-count]')) {
    const selected = value === Number(button.dataset.count);
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
}
document.querySelectorAll('[data-count]').forEach(button => {
  button.addEventListener('click', () => {
    $('question-count').value = button.dataset.count;
    updateCountPresets();
  });
});
$('question-count').addEventListener('input', updateCountPresets);
settingsForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!settingsForm.reportValidity()) return;
  updateCountPresets();
  const form = new FormData(settingsForm);
  startQuiz({ mode: form.get('mode'), count: Number(form.get('count')) }, true);
  if (window.matchMedia('(max-width:700px)').matches) {
    $('quiz-view').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  }
});
$('next').addEventListener('click', nextQuestion);
$('end-quiz').addEventListener('click', () => showSetup(true));
$('practice-again').addEventListener('click', () => startQuiz(session.settings, true));
document.addEventListener('keydown', event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target;
  if (target instanceof Element && target.closest('input,textarea,select,[contenteditable="true"],#settings')) return;
  if (!session || $('quiz-view').hidden) return;
  if (/^[1-4]$/.test(event.key) && session.answers.length === session.index) {
    event.preventDefault();
    answer(Number(event.key) - 1);
  } else if (event.key === 'Enter' && !$('next').hidden && (target === document.body || target === $('next'))) {
    event.preventDefault();
    nextQuestion();
  }
});

showSetup();
