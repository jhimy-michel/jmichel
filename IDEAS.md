# Ideas for the Website

Brainstorm from 2026-11-12, to review later. Nothing here is built yet. ⭐ marks the ideas recommended to start with.

Context: the home page hero is Perrito's room. It is a voxel room corner with the dog in his armchair, and it already follows the visitor's local time, the season, and day/night. The site is a static export on GitHub Pages, so ideas marked **(needs backend)** need a small serverless function, for example a Cloudflare Worker.

---

## 1. The room *is* the website

### Click objects to navigate ⭐
- **Bookshelf → blog.** Each book is a real post, so more posts mean more books.
- **Window → photography.** The view "travels" through your photo spots, from the Bolivian salt flats to the Swiss Alps.
- **Laptop → projects / CV.** The camera zooms into the screen.
- **Mug → about / fun facts.**
- **Globe on a side table → Bolivia → Spain → Switzerland.**
- The camera glides smoothly to each object. The normal pages stay as an accessible fallback.

### The room grows with your life
- A new post adds a book. A new photo adds a framed print on the wall.
- Achievements become objects, for example a ZHAW diploma or a PlaynVoice mug.
- The room becomes a living diorama of your career, built automatically from your content.

---

## 2. Perrito is alive (and connected to *you*)

### Perrito mirrors your real world ⭐
- **Your time, not the visitor's:** "It's 23:40 in Zürich, so Perrito is asleep 💤". Visitors anywhere see your real day.
- **Real Zürich weather in the window:** rain, snow or sun from a free weather API (Open-Meteo needs no key).
- **GitHub activity:** he types faster on days you commit, with a "commits today" sticky note on the laptop.
- **Spotify "now playing":** a record player spins and music notes float up. **(needs backend)**

### Talk to Perrito: an AI version of you ⭐ (needs backend)
- Click him and ask about your work, stack or experience.
- He "types" on the laptop while thinking, then answers in a speech bubble.
- He knows your CV and posts, and stays polite and on-topic. Claude runs behind a serverless function.

### Holiday events
- Oruro Carnival costume, Swiss National Day fireworks outside the window, a Christmas tree, a Halloween pumpkin, a party hat on your birthday.
- Gives people a reason to come back and see what's new.

---

## 3. A small LLM running in the visitor's browser

There is no server and no API cost: the model runs on the visitor's GPU through WebGPU, and the site stays static.

**Tech options**
- **WebLLM:** WebGPU, with ready-made small models down to SmolLM2-360M.
- **Transformers.js:** WebGPU, with a WebAssembly fallback.
- **Chrome's built-in Gemini Nano (Prompt API):** Chrome/Edge desktop only and hardware-gated. Don't rely on it.

**Trade-offs**
- **Download:** even tiny models are about 250 MB to 1 GB, so it **must be opt-in** (a "🧠 Wake up Perrito's brain" button with a progress bar). The browser caches it after the first load.
- **Hardware:** it needs WebGPU and a decent device. Phones are inconsistent, so everyone else gets the normal site.
- **Accuracy:** tiny models make things up. Use them where personality matters more than facts, and keep anything factual tightly grounded.
- Check WebLLM's current model list before choosing a model, and test which small one sounds best as a dog.

**What to do with it**
1. **Perrito's thought bubbles ⭐.** Occasional thoughts generated live from the room's state:
   - at 2am: *"why is this human awake… I'm napping 💤"*
   - in winter: *"snow!! can't go out, must keep typing"*
   - at coffee time: *"third coffee. don't tell anyone ☕"*

   Low stakes and playful, so wrong facts can't hurt.
2. **Chat with Perrito, kept to the facts ⭐.**
   - Click him to chat. He only uses a short facts file you control (bio, jobs, stack, posts).
   - Otherwise he says *"I'm just a dog 🐶, check Jhimy's LinkedIn"*.
   - Show a badge: **"Running 100% on your device. Nothing leaves your browser."** That's a strong portfolio piece for an AI engineer.
3. **Live code on the laptop screen.** The model writes small code snippets that scroll on Perrito's laptop while he types.
4. **"Ask the bookshelf".** Search posts by meaning with a tiny embedding model (a few tens of MB). Fast and genuinely useful.
5. **Hybrid later:** the local model handles the fun stuff and hard questions go to Claude through a serverless function. **(needs backend)**

**Recommended first step:** build 1 and 2 together as one opt-in "Perrito's brain" feature (WebLLM plus a ~0.5B model).

---

## 4. Crazy tech flexes

- **"Put Perrito on your desk" (AR).** On phones, an AR button places Perrito in his chair on the visitor's real table, using iOS AR Quick Look or Android Scene Viewer. The GLB already exists, so this is cheap for how cool it is.
- **Terminal mode.** Press `` ` `` and the laptop screen becomes a full-page retro terminal: `ls posts`, `cat about.md`, `ssh perrito`.
- **Shared room (needs backend).**
  - Other visitors appear live as translucent voxel cats wandering the floor.
  - A corkboard guestbook where people pin postcards.
  - A global counter: "Perrito has been petted 18,402 times".
- **"How it's built" mode.** A toggle that turns the room into wireframe with labels ("fairy lights: catenary sag", "sky: GLSL shader"), showing your engineering without a word.
- **Optional cozy sound.** Lo-fi radio, rain on the window, soft typing clicks, behind a mute toggle.
- **Share cards with Perrito.** Each post's link preview is generated at build time with Perrito reading that post.

---

## 5. Smaller polish ideas

- **Coral underlines in light mode.** Light mode is all ink; coral section underlines ("Bio", "I love"…) would add warmth.
- **Rename colour tokens.** `brand.teal` now holds ink blue. Rename tokens by role (`brand.primary`, `brand.accent`, `brand.surface`…) across the site.
- **Bigger mug.** The coffee mug looks small since the camera zoomed out for the room. It's quick to scale up in `archive/assets/perrito.blend`.
- **Click to pet.** A hop and a "Woof · Guau · Wuff" speech bubble.
- **More dog moves.** Ear wiggles, and typing paws that fumble when he's sleepy.
- **Wall clock.** Shows the real time and explains the day/night behaviour at a glance.
- **Sleeping cat** curled up on the rug, sometimes flicking its tail.

---

## 6. Open housekeeping (not ideas, still to do)

- [ ] **Commit the current work** (calendar badge, split dog model + animations, camera/centering, room + cozy details, Night window palette), ideally in a few logical commits.
- [ ] **Security updates:** `next` has a critical advisory, so update to 16.4.x with `@next/mdx` and `eslint-config-next`. Also run `npm audit fix` and upgrade `next-mdx-remote` to v6.
- [ ] **Prettier config typo:** `arrowPattern` should be `arrowParens`.
- [ ] **Remove `.DS_Store` from git** and add it to `.gitignore`.
- [ ] **CI on Node 22** (Node 20 reached end-of-life).
- [ ] **Phone performance.** The scene now has shadows and ~150 meshes. If it's slow, make the lamp's shadows cheaper, or turn them off on small screens.
