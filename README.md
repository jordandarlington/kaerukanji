# Kaeru Kanji

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

---

A static JLPT N5, N4 and N3 multiple-choice flashcard quiz, ready for GitHub Pages. No accounts, backend, analytics, cookies, or saved progress. Round scores live only in memory and disappear when the page reloads.

Website domain: **kaerukanji.com**. The header reads **kaerukanji / カエル漢字**. A green seal-style frog mark in `favicon.svg` is used for both the header logo and browser favicon.

- Choose question and answer formats independently: **Kanji**, **Hiragana** or **English**, with six possible directions. Selecting the current answer format for questions swaps the two formats.
- Switch between **Test** and **Browse**. Browse shows words, hiragana and English meanings on display-only cards, with search and topic filters including **Select all** and **Clear all**.
- Choose N5 (113 kanji), N4 (209 kanji) or N3 (197 kanji) from the level selector at the top right. N5 is the default; switching levels returns to setup, selects all topics in that level and updates the question limit. The selector is disabled during an active quiz.
- Expand the topics section to choose what to practise; it is collapsed by default with all topics selected. Questions and answer choices come from the selected topics.
- Select up to the number of kanji in your chosen topics, with shortcuts for 10, 20, 30, or all available kanji.
- Reveal English hints by hovering over a card, tapping it on a touchscreen, or focusing it with a keyboard. Hints are hidden when questions or answers use English.
- Get immediate answer feedback and a round summary showing any missed words.
- Use keys **1–4** to answer and **Enter** on the next-card button to advance.
- Switch between light and dark appearance with the header’s **Dark mode** toggle. Your device’s preference is used until you choose a theme; only your theme choice is saved locally.

Choose your settings before starting. During the quiz and on the completion page, the settings panel is hidden and the card is centred. **End quiz** or **Back to settings** returns to setup with your selections preserved. **Practise again** starts a fresh shuffle with the same settings.

The mode switch is disabled while a quiz is in progress; end the round before opening Browse. Browse uses the existing vocabulary examples and readings, with no saved progress. Additional readings and example sentences can be added after the deck data is expanded and verified.

## Run locally

Requires Node.js 22 or later. There are no packages to install.

```sh
cd /Users/jordan/Projects/kaerukanji
npm run dev
```

Open **http://127.0.0.1:4173**. To use a different port, run `PORT=4174 npm run dev`.

```sh
npm test
npm run build
npm run preview
```

The build creates a standalone `dist/` folder containing only public website files. Any static web server can serve it. JavaScript modules require an HTTP server rather than opening `index.html` directly from the filesystem.

## Publish to GitHub Pages later

1. Push this project to a GitHub repository named `kaeru-kanji` with a `main` branch.
2. Open the repository’s **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions** as the source.
4. Run the **Check and Deploy Kaeru Kanji** workflow, or push a commit to `main`.

The included `.github/workflows/deploy.yml` tests and builds the site on pushes to `main`, pull requests targeting `main`, and manual runs. A separate deployment job publishes `dist/` only for pushes to `main` or manual runs on `main`, after the build succeeds. New commits to a pull request cancel its earlier checks; running deployments are allowed to finish. All asset URLs are relative, so both a repository URL (`username.github.io/kaeru-kanji/`) and a custom domain work without changing the code. If your default branch is different, update the workflow's branch triggers and deployment condition.

For the custom domain, set **kaerukanji.com** in this repository’s **Settings → Pages → Custom domain**, then configure its DNS records for GitHub Pages and enable **Enforce HTTPS**. The page’s canonical URL is `https://kaerukanji.com/`. This project uses a custom Actions workflow, so a repository `CNAME` file is not required. See [GitHub’s custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

See [GitHub’s custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Content and readings

The N5 deck covers all **113 kanji in 13 categories** from [Langoal’s N5 overview](https://langoal.com/teaching-materials/kanji/n5-overview.html), checked on 5 October 2026. The N4 deck covers all **209 kanji** from [Langoal’s N4 overview](https://langoal.com/teaching-materials/kanji/n4-overview.html), checked on 8 October 2026, with the source’s two adjective groups merged into one **Adjectives** topic for **18 topics** in total. Each card’s source link points to its kanji detail page. The examples and readings were verified against those linked pages; English glosses are kept short and corrected where needed.

The N3 deck covers all **197 kanji** from [Langoal’s N3 overview](https://langoal.com/teaching-materials/kanji/n3-overview.html), checked on 8 October 2026. Its 27 source groups are combined into **19 topics** by merging numbered adjective, verb, daily life, feeling, plan, quantity, driving and introduction groups. Vocabulary and readings were checked against the linked detail pages, with shortened and corrected English glosses. The source’s page for **末** lists examples for **未**; the **末** card instead uses `週末 → しゅうまつ` (weekend), verified against the [Japan Foundation’s Irodori vocabulary list](https://www.jpf.or.kr/irodori/sData/pdf/resources/wordlist_X.pdf) and recorded in the card’s `vocabularySource` field.

Kanji often have several readings. Each card uses **one contextual word** from its detail page, including okurigana where appropriate: for example, `食べる → たべる` and `学校 → がっこう`. The deck is a practice set, not an exhaustive list of each kanji’s readings. Distractors with the same hiragana reading are excluded in reverse mode, so a valid alternative word is never marked wrong. Questions are shuffled without repeating a target kanji within a round.

N5 numbers 1–10 use standalone numbers rather than object counters: for example, `一 → いち` and `十 → じゅう`. The selected readings for four, seven and nine are `よん`, `なな` and `きゅう`. These were checked against the [Japan Foundation’s number chart](https://www.jpf.go.jp/j/urawa/j_rsorcs/textbook/dl/setsumei/setsumei_all.pdf) on 8 October 2026.

## Add more levels

The content lives separately from the quiz in `decks/n5.js`, `decks/n4.js` and `decks/n3.js`. Add another deck exporting `id`, `label`, `source`, and `cards`. Each card has:

```js
{
  kanji: '食',
  word: '食べる',
  reading: 'たべる',
  meaning: 'eat',
  category: 'Verbs',
  source: 'https://langoal.com/teaching-materials/kanji/taberu'
}
```

Import the new deck and register it in `app.js`’s `decks` object, then add its option to the level selector in `index.html` and add topic icons in `src/topic-icons.js` where needed. Topic cards, counts and quiz questions follow the selected deck. Every selectable topic must provide at least four distinct answer choices after excluding shared readings.

[contributors-shield]: https://img.shields.io/github/contributors/jordandarlington/kaerukanji.svg?style=for-the-badge
[contributors-url]: https://github.com/jordandarlington
[forks-shield]: https://img.shields.io/github/forks/jordandarlington/kaerukanji.svg?style=for-the-badge
[forks-url]: https://github.com/jordandarlington/kaerukanji/network/members
[stars-shield]: https://img.shields.io/github/stars/jordandarlington/kaerukanji.svg?style=for-the-badge
[stars-url]: https://github.com/jordandarlington/kaerukanji/stargazers
[issues-shield]: https://img.shields.io/github/issues/jordandarlington/kaerukanji.svg?style=for-the-badge
[issues-url]: https://github.com/jordandarlington/kaerukanji/issues
[license-shield]: https://img.shields.io/github/license/jordandarlington/kaerukanji.svg?style=for-the-badge
[license-url]: https://github.com/jordandarlington/kaerukanji/blob/main/LICENSE
