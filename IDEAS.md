# Ideas for the Website

Brainstorm from 2026-11-12, to review later. ⭐ marks the ideas recommended to start with.

**Built so far (updated 2026-11-14):**
- **Layout:** the room fills the screen on every page and pages open in a panel over it (bottom sheet on phones). Navbar and hero text share one column; on wide screens the text sits left and the room right.
- **Room:** filmic lighting with a hemisphere light; side table with a bedside lamp (spotlight); Swiss station-style clock (Zürich time); voxel monstera; dark green armchair with an aguayo throw; two-board bookcase with one book per post plus placeholder photo frames; glowing fairy lights.
- **Window:** Zürich (Alps and lake) or La Paz (Illimani, city lights, teleférico), alternating by day; click to switch; hover shows the place and its time. Snow outside in winter.
- **Theme:** light mode is always daytime, dark mode always night. The lamp is a light switch; going dark it flickers on and the fairy lights come on one by one.
- **Perrito:** looks at hovered objects and open panels, pet him (hearts, cheer after 3 pets, half wakes at night), idle moments (neck stretch, thinking 💡, window gaze), thought bubbles, coffee, sleep.
- **Clickable objects:** each book → its post, bookcase → Posts, laptop → GitHub, mug → About, lamp → theme, window → other city.

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

### Animate Perrito further ⭐
**Status 2026-11-14:** looking at what you hover/open, petting with hearts and a cheer, neck stretch, thinking pause, window gaze and thought bubbles are built. Cursor following was built and removed again (felt too busy). Still open below: startle, yawn, waking up, deep sleep, and everything that needs Blender.

Brainstorm from 2026-11-13. Today he types, takes a coffee break every 20–40 s, blinks, bobs his head and falls asleep at night (laptop closes, head nods, "Z"s rise). Movable parts in the model: `head`, `arm_L`, `arm_R`, `eyelids`, `laptop_lid`, `mug`. The body is one piece, so a tail, ears or legs first need cutting out as separate parts in `archive/assets/perrito.blend`.

**Reacts to the visitor (head only, cheap)**
- ⭐ **Looks at what you open.** Shelf zoom: he turns to the bookshelf. About panel: he looks toward the panel, as if introducing you.
- ⭐ **Eyes follow the cursor.** The head turns slightly toward the mouse, then goes back to reading after a few idle seconds.
- ⭐ **Click to pet.** Happy head wiggle, double blink, "Woof · Guau · Wuff" speech bubble.
- **Startle.** Several fast clicks make him jump, spill some coffee and give you a look.

**Idle life (random, every 30–90 s, so he doesn't loop one motion)**
- ⭐ **Stretch:** arms up, head back, eyes closed, back to typing.
- ⭐ **Thinking pause:** stops typing, tilts his head, taps one paw, then a fast "aha!" typing burst.
- **Yawn,** mostly in the evening before falling asleep.
- **Looks out the window,** especially when it snows or at sunset.

**Time of day (builds on the existing day/night system)**
- **Waking up:** eyes open slowly, stretch, laptop opens, first coffee, instead of switching straight from asleep to awake.
- **Coffee rhythm:** more sips in the morning, fewer at night.
- **Deep sleep:** after 2 am the arms slip off the laptop and the "Z"s grow.

**Needs a Blender job first**
- ⭐ **Tail wag:** the strongest "alive" signal for a dog. Wags harder on hover or when the page changes.
- **Ear twitches,** and floppy ears that bounce when he's startled.
- **Legs swinging** in the chair while he reads.

**Bigger**
- Soft sounds behind a mute toggle (typing clicks, a slurp, snoring). See "Optional cozy sound" below.
- Holiday outfits (see Holiday events above).
- Typing speed from your real GitHub activity (see "Perrito mirrors your real world").

**Recommended order:** ~~1. look at what you open, 2. click to pet, 3. stretch + thinking pause~~ (done). Next: 4. split Perrito off the chair in Blender (below), then tail wag.

### Split Perrito off the chair (Blender) ⭐
His torso, legs and tail are one mesh with the armchair, and his arms are only paw blocks. Splitting him off (on a copy of the GLB, keeping today's part names) and adding upper arms would unlock:
- a real arm stretch and arms-up cheer (today's code poses must stay close to the body or the paws float)
- hopping off the chair to stretch on the rug, then back up to typing
- tail wag, ear twitches, swinging legs, sleeping on the rug, walking to the window

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
- ~~**Click to pet.**~~ Built (hearts and a cheer). A "Woof · Guau · Wuff" bubble could still be added.
- **More dog moves.** Ear wiggles, and typing paws that fumble when he's sleepy.
- ~~**Wall clock.**~~ Built: Swiss station style with Zürich time. The red second hand with a disc is SBB's protected design; a paw or bone tip in brand orange would make it our own.
- **Sleeping cat** curled up on the rug, sometimes flicking its tail.
- **Photos page.** The frames on the bookcase's lower board become real thumbnails linking to a Photos panel (grid plus a big view, maybe grouped by place). Needs your photos, resized at build time.
- **Real weather in the window.** Rain streaks, snow or fog from Open-Meteo (no API key), with the temperature in the window's hover label.
- **Window and plant.** From the camera angle a plant leaf still covers part of the window view.

---

## 6. Open housekeeping (not ideas, still to do)

- [ ] **Split `components/voxel-dog.js`** (about 3,200 lines) into a `components/room/` folder: lighting, sky/window, furniture, Perrito's animations, and the component itself. A pure move; compare screenshots before and after.
- [ ] **Social preview image:** links still show the personal photo (`jhimy_michel.png`); a picture of the room would match the site.
- [ ] **Travel topic is empty:** write a first post (La Paz fits now) or hide the chip.
- [ ] **Keyboard access to the room:** clicking objects works by mouse/touch only; the navbar covers the main pages, but the hover labels could get screen-reader text.
- [ ] **Trim `archive/`** (1.6 MB in git: old photo, tulip, `.fbx`, old GLBs, old pages). Keep `perrito.blend`, the source of the poses.
- [ ] **Dev-only audit warnings:** 8 moderate (`minimatch` in the lint tooling). Production dependencies report 0.
- [x] ~~Prettier format pass~~, `npm run prettier` script fixed, `.prettierignore` covers build output, archive, posts and `public` (2026-11-14).
- [x] ~~Profile links in one place~~: `libs/links.js` (2026-11-14).
- [x] ~~Topic book on post pages~~: the open post's own book stays pulled out.
- [x] ~~Real browser and phone check~~ (2026-11-14): phones get a taller room strip above the sheet, a zoomed bookcase, and a navbar fade.
- [x] ~~Commit the 2026-11-13 work~~.
- [x] ~~Security updates~~: `next` is on 16.4.6, `next-mdx-remote` on v6 (2026-11-13).
- [x] ~~Prettier config typo~~: `arrowPattern` → `arrowParens`.
- [x] ~~Remove `.DS_Store` from git~~ and add it to `.gitignore`.
- [x] ~~CI on Node 22~~.
- [x] ~~Phone performance~~: pixel ratio capped, shadows redrawn every 3rd frame, 3D loads after the page text.
