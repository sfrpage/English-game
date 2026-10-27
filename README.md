# Little Talkers 🌈

A small, colorful, mobile-friendly English speaking game for a 3-year-old who understands basic English and is building confidence speaking it.

## What's included
- Three mini-games: Snack Time, The Toy Shop, and Fox's Adventure
- Short, age-appropriate sentence models
- Optional English speech recognition (where the browser supports it)
- English spoken prompts using browser text-to-speech
- Picture-choice fallback if speech recognition isn't available
- Responsive layout for phones, tablets, and computers

## Run it locally
Open `index.html` in a browser. For microphone access, it is best to run the site from `localhost` or HTTPS (GitHub Pages provides HTTPS).

## Publish on GitHub Pages
1. Create a new repository on GitHub, for example `little-talkers`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait a minute or two. GitHub will show your website link in the Pages section, usually:
   `https://YOUR-USERNAME.github.io/little-talkers/`

## Important notes
- Speech recognition support varies by browser. It is generally more reliable in Chromium-based browsers and may not work in every iPhone browser.
- The website does not send or store a transcript itself. Browser speech recognition behavior depends on the browser provider and its privacy policy; ask an adult before enabling the microphone.
- This is a starter prototype, not a clinical speech-language therapy tool. Keep sessions short, playful, and pressure-free.
- The voice uses English (UK) where available. The actual voice depends on the device/browser.
- Google Fonts is used for the rounded typeface; the page falls back to system fonts if unavailable.
