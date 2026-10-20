# Live classes: how they work

This guide is for teachers and the OSDHYAN team. No technical knowledge needed.

## Two ways to teach live

| | **Big class: YouTube Live + OSDHYAN chat** (recommended) | **Small class: Jitsi video call** |
|---|---|---|
| Best for | 50 to 5,000+ students | up to about 50 students |
| Video | You stream on YouTube; students watch it inside OSDHYAN | Everyone is in one video call (camera, mic, screen share) |
| Students speak? | No, they type questions in our chat | Yes, if you let them unmute |
| Recording | Automatic (the YouTube video) | Paste a link after the class |
| Needs | A YouTube channel with live streaming switched on | Nothing for testing; JaaS keys for a reliable setup (see the end) |

**Why YouTube is recommended:** YouTube carries the heavy video for free and never runs out of seats. OSDHYAN only handles the chat, polls and raise-hand, which are light. The free public Jitsi server (meet.jit.si) makes the teacher sign in with Google, GitHub or Facebook inside the video before anyone can enter. That sign-in often fails inside our page, so until JaaS keys are added Jitsi is fine for small or test classes only.

## Teacher: before the class (schedule it)

1. Open **Live Classes → Teacher panel** (only teachers and admins see it).
2. Press **Schedule class**, choose the type, then fill in the title, date, time and length.
   - **Max students**: 0 means no limit. Use it for Jitsi classes, for example 50.
3. **For YouTube** (one-time setup: switch on live streaming for your channel; YouTube can take up to 24 hours):
   1. In **YouTube Studio → Create → Go live** (or in OBS), create the stream.
   2. Set it to **Unlisted** and keep **Allow embedding** on. Switch off YouTube's own live chat, so all questions come to OSDHYAN.
   3. Copy the share link (`youtube.com/live/…` or `youtu.be/…`) and paste it into the form.
4. Press **Schedule**. Students see the class under **Upcoming** straight away, with a countdown.
5. Share the link: the 🔗 button copies it. Paste it into WhatsApp or Telegram.

## Teacher: starting and running the class

1. **YouTube only:** press **Go live** in YouTube Studio or OBS first.
2. In OSDHYAN, press **Start class**. You will find it in the Teacher panel or on the class page. The classroom opens for you.
   - **Jitsi on the free server:** if the video says *"waiting for a moderator"*, press **Log-in** inside the video and sign in with Google. Students are let in as soon as you do. If the sign-in window does not open, use **"Open the video in a new tab"**. The room password is shown beside that link.
3. The video is on the left and **Questions & chat** is on the right. Here is what you can do:
   - **Pin** a message: it stays at the top for everyone. Use it for announcements or a good question.
   - **Mark answered**: ticks a student's question. **Show unanswered** hides everything you have already dealt with.
   - **Delete** a message: it disappears for everyone.
   - **Poll**: press **New poll** and add 2 to 6 options. Students vote once. You see results live. **Stop voting** closes the poll, and **Show results to students** reveals the results to everyone.
   - **Hands** tab: students who pressed **Raise hand** appear here, oldest first. Press **Done** after you have answered them.
   - **Share link**: the class link and a QR code, so you can open the class on your phone to watch the chat.
4. **End class** (top right) asks you to confirm. It closes the video, chat and polls for everyone and cannot be undone.
   - **YouTube:** also press **End stream** in YouTube. The YouTube video becomes the recording automatically.
   - **Jitsi:** paste a recording link in the confirmation box if you have one. You can also add it later from the class page or the Teacher panel (**Add recording**).

## Students: joining and asking questions

1. Open **Live Classes**. Classes that are on now appear under **Live now**, with a red **Join class** button.
2. If the class has not started yet, the page shows a countdown. Keep it open: a **Join class** button appears the moment the teacher starts.
3. Press **Join class**. The video plays on the left. In Jitsi classes your microphone and camera start switched off.
4. Type questions and comments in **Questions & chat** on the right and press **Send** (or Enter).
5. **Raise hand** puts your name on the teacher's list. Press **Lower hand** to take it back.
6. When a poll appears (a red dot on **Poll**), tap your answer. You can vote once.
7. After the class ends, the recording appears on the same page and under **Recordings**.

## Limits and rules

- Chat messages can be up to 1,000 characters. Each student can send 1 message every 2 seconds and at most 20 a minute. This stops spam in big classes.
- Students who close the tab or lose internet stop counting after about 2 minutes, and their seat is freed.
- Chat, the student count and polls refresh every 4 to 15 seconds. Bigger classes refresh less often, so the server keeps up.
- **Server capacity:** this matters more than anything else. The current laptop + Apache setup handles about 15 to 20 requests a second, which is comfortable for about 60 students at once. For classes of hundreds, run the API on a proper server (Linux with PHP-FPM). As a stop-gap, set `LIVE_POLL_SCALE=2` in `backend/.env`, then run `php artisan config:cache`. Students then refresh half as often.
- Only one poll is open at a time. Starting a new poll closes the previous one.

## Making Jitsi reliable: JaaS keys (for the admin)

JaaS (Jitsi as a Service, by 8x8) removes the sign-in step and the moderator wait. The free plan allows 25 monthly active users. Paid plans cover more.

1. Create an account at **jaas.8x8.vc**. Copy the **App ID**, which looks like `vpaas-magic-cookie-…`.
2. Under **API Keys**, generate a key pair. Download the **private key** (`.pk` file) and copy the **Key ID**, which looks like `vpaas-magic-cookie-…/abc123`.
3. Add these lines to `backend/.env`:
   ```
   JAAS_APP_ID=vpaas-magic-cookie-xxxxxxxx
   JAAS_API_KEY_ID=vpaas-magic-cookie-xxxxxxxx/abc123
   JAAS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   ```
   Put the whole private key on one line, with `\n` where the line breaks are.
4. Run `php artisan config:cache` in `backend/`. The Teacher panel then recommends Jitsi automatically and stops showing the sign-in warning.

A self-hosted Jitsi server also works. Set `JITSI_DOMAIN=meet.yourdomain.com` in `backend/.env` and `NEXT_PUBLIC_JITSI_DOMAIN` to the same value for the portal build, so the browser lets the camera work inside the page.
