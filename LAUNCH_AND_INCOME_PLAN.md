# OSDHYAN — Plan from here to launch, advertising and real income

Written 20 Oct 2026. Bihar first, Hindi first, mobile first.

---

## 1. Is this a good idea? Will it work in India, and in Bihar?

**Short answer: yes, if you stay focused.** It works as a Bihar-exam test-series and doubt-class business. It does not work as "another Testbook".

### Why the demand is real
| Signal | Number |
|---|---|
| BPSC 70th CCE applications | about 4.0 lakh (official), 3.29 lakh sat the prelims |
| Teachers hired through BPSC TRE 1, 2 and 3 | 1.70 lakh, about 70,000 and 66,603 |
| BPSC TRE 4.0 vacancies | 32,388; applications open 1–30 Sept 2026 |
| Rural Bihar youth (15–29) using a mobile phone | 97.8% |

Every year lakhs of Bihar students take BPSC, TRE, Bihar Police, BSSC, SSC, Railways and DSSSB. Most of them prepare on a phone, in Hindi, on a tight budget.

### What makes it hard
- **Big, rich competitors.** Adda247, Testbook, Physics Wallah, StudyIQ and Khan Sir's app already sell Bihar test series. Adda247's revenue is about ₹240 crore and it still lost ₹104 crore in FY25. Fighting them on breadth and ad spend is a losing game.
- **Very low prices.** Physics Wallah sells a BPSC AEDO test series for ₹199. StudyIQ sells a BPSC test series for ₹1,249. Students expect ₹199–₹999.
- **Paid ads alone lose money at these prices.** Education leads on Facebook and Instagram cost roughly ₹150–₹450 each in India. If 1 in 10 leads buys a ₹299 series, each sale costs ₹1,500–₹4,500 in ads. Ads only pay off for bigger bundles or for retargeting people who already took a free test.
- **Exam delays.** TRE 4 slipped by almost a year, and students stop paying while an exam is stuck.
- **Weaker internet than the rest of India.** In 2022 only about 32% of Bihar used the internet. The app must stay light, fast and usable on slow phones.

### Where a small team wins
1. **Accuracy on official papers.** Real previous papers with the official answer key and a solution for every question. Many apps get this wrong. You already have DSSSB and BPSC AEDO done this way.
2. **Hindi first, Bihar first.** Every screen, solution and video in simple Hindi, built around Bihar exam calendars.
3. **Free weekly "All-Bihar Mock" with a state rank.** This is your main marketing engine. It brings students in for free and the rank keeps them coming back.
4. **Local trust.** Tie-ups with coaching centres in Patna (Musallahpur, Boring Road, Bhikhna Pahari) and district towns. Offer them your platform under their own name.
5. **Speed.** You can publish a mock within days of a notification, while big apps take weeks.

**Verdict:** start with 3–4 exams (BPSC TRE 4, BPSC CCE, Bihar Police/BSSC, DSSSB), win on quality and free mocks, and grow from there.

---

## 2. Do we need Java?

**No.** The platform already uses Laravel (PHP) for the server and Next.js (React) for the website. Both run the largest Indian ed-tech sites at much bigger scale. What makes a system robust for 10,000 students at once is not the language. It is:
- good hosting with enough servers behind a load balancer,
- a managed database with backups,
- caching (Redis, already in place),
- sending video through YouTube or a video CDN instead of our own server,
- monitoring, so we know about a problem before students do.

Adding Java would mean a second codebase to maintain and slow everything down for no gain.

---

## 3. Money: a realistic picture

### Prices that fit Bihar
| Product | Price |
|---|---|
| Single exam test series (like DSSSB TGT CS) | ₹199–₹399 |
| "Complete" bundle: test series + notes + weekly live doubt class | ₹699–₹999 |
| Live course for one exam (3–4 months) | ₹1,499–₹2,999 |
| Coaching centre white-label (their brand on our platform) | ₹5,000–₹15,000 per month per centre |
| Home-tuition marketplace | 10–15% commission or a teacher listing fee |

### Example first year (an illustration, not a promise)
| Month | Registered students | Paying | Average order | Monthly income |
|---|---|---|---|---|
| 3 | 5,000 | 3% = 150 | ₹350 | about ₹52,000 |
| 6 | 25,000 | 4% = 1,000 | ₹450 | about ₹4.5 lakh |
| 12 | 80,000 | 5% = 4,000 | ₹500 | about ₹20 lakh, plus 3–5 coaching centres |

These numbers only happen if the free mock and YouTube/Telegram funnel works. Paid ads stay small until you know your own cost per sale.

### Monthly running costs once on the cloud
| Item | Approx. per month |
|---|---|
| Servers, database, Redis, storage (start size) | ₹4,000–₹10,000 |
| Domain, e-mail, Cloudflare | ₹500 |
| SMS for sign-in codes (or your own phone gateway, nearly free) | ₹0–₹2,000 |
| Razorpay fees | about 2% of sales |
| Ads (testing budget) | ₹15,000 (₹500 a day) |

---

## 4. The plan, phase by phase

Each phase lists what **I build** and what **you do**. A phase is done when its checklist is ticked.

### Phase 0 — Make it solid on the laptop (now, about 1 week)
**I build**
- [x] Fix the crashes (materials, admin settings, syllabus, admin courses).
- [ ] Course content: admin uploads PDF, video, audio, image and YouTube links; students open them. *(in progress)*
- [ ] Live classes: start, join, comments, raise hand, polls, end. Guide in `LIVE_CLASSES_GUIDE.md`. *(in progress)*
- [x] "Change my password" for admins (Admin → Settings) and students (Settings).
- [x] Database and uploads backup: `scripts/host/backup-db.ps1` (keeps 14). You schedule it nightly with one command, written at the top of that file.

**You do**
- [ ] Change the admin password.
- [ ] Put your domain osdhyan.online on Cloudflare and run `cloudflared tunnel login` once, for a link that never changes.
- [ ] Click Create on the GitHub pull request.

### Phase 1 — Content for the exams that matter next (weeks 1–4)
**I build**
- [ ] BPSC TRE 4.0 series (applications in Sept 2026, so this is the most urgent): official TRE 1–3 papers with keys and solutions, 10 mocks, subject and chapter tests, notes.
- [ ] BPSC CCE (71st/72nd) prelims series in Hindi and English.
- [ ] Bihar Police constable / BSSC inter-level series.
- [ ] A free "All-Bihar Mock" every Sunday with a state rank list and certificate.

**You do**
- [ ] Send me the official papers or PDFs you have (like you did for DSSSB).
- [ ] Review the 15 doubtful DSSSB answers in the trend-analysis PDF.
- [ ] Decide prices for each series in Admin → Test Series.

### Phase 2 — Make the business legal and able to take money (weeks 2–4, in parallel)
**You do**
- [ ] Register the business: Udyam (MSME) registration for a sole proprietorship is free and online. Open a current account in the business name.
- [ ] Razorpay account and KYC: PAN, bank account, business proof, and a website that shows Terms, Privacy, Refund policy and Contact. Razorpay checks these pages.
- [ ] Talk to a CA about GST. Registration is required once yearly turnover crosses ₹20 lakh, and online coaching is taxed at 18%.
- [ ] A Gmail address for the business and an app password for sending sign-in codes.

**I build**
- [ ] Terms, Privacy, Refund and Contact pages (you give me the business name, address and phone).
- [ ] Switch payments from test mode to live Razorpay keys; GST invoice on every order.
- [ ] Real sign-in codes by e-mail and SMS.

### Phase 3 — Move off the laptop to the cloud (weeks 4–6)
A laptop goes down on every restart, power cut or internet drop. It cannot serve 10,000 students.

**I build**
- [ ] Production setup on an Indian cloud region (Mumbai): two app servers behind a load balancer, managed PostgreSQL with daily backups, Redis, Cloudflare in front.
- [ ] Load test with 10,000 simulated students taking a mock at the same minute; fix what breaks.
- [ ] Error alerts and uptime monitoring to your phone.
- [ ] Mobile app (Android first) updated to match the website, and published on Google Play.

**You do**
- [ ] Create the cloud account (AWS, DigitalOcean or similar) with a card; I set it up.
- [ ] Google Play developer account (a one-time US$25 fee).

### Phase 4 — Launch and marketing (weeks 6–10)
**Free channels first: these are where Bihar students actually are**
- [ ] **YouTube:** daily 5–10 minute Hindi videos solving real previous-year questions, plus Shorts. Every video links to the free mock.
- [ ] **Telegram and WhatsApp channels** per exam: daily quiz, results of the Sunday mock, new-test alerts.
- [ ] **Sunday All-Bihar Mock:** free, with a rank list. Students share their rank, which brings in more students.
- [ ] **Referral:** a student who brings a friend gets ₹50 off; the friend also gets ₹50 off.
- [ ] **Coaching centre tie-ups:** visit 10 centres in Patna and 10 in district towns. Offer their students free mocks under the centre's name, then a paid white-label plan.
- [ ] **College and library posters** with a QR code to the free mock.

**Paid ads, small and measured**
- [ ] Facebook and Instagram ads at ₹500 a day, in Hindi, targeting Bihar ages 18–32. Advertise the free mock, not the paid series.
- [ ] Retarget people who took a free mock with the paid bundle offer.
- [ ] Track cost per free sign-up and cost per sale. Raise spend only when one sale costs less than half its price.
- [ ] Google Play app-install ads only after the app has 4+ star reviews.

**I build**
- [ ] Rank list and certificate for the Sunday mock, shareable on WhatsApp.
- [ ] Referral codes and coupons.
- [ ] A dashboard showing sign-ups, free mocks taken, sales and money by day and by source.

### Phase 5 — Grow income (months 3–6)
- [ ] Weekly live doubt classes (YouTube Live plus our chat) included in the bundle.
- [ ] Full live courses for TRE 4 and BPSC CCE with teachers paid per class or by revenue share.
- [ ] Coaching centre white-label: their logo, their batches, our tests and analytics.
- [ ] Home-tuition marketplace: verified teachers in Patna first, commission per booking.
- [ ] Price tests: try ₹299 versus ₹399, and bundles versus single series, and keep what earns more.

### Phase 6 — Run it like a business (ongoing)
Check these numbers every Monday:

| Number | Healthy target |
|---|---|
| Free sign-ups per week | growing every week |
| Free mock to paid conversion | 3–5% |
| Cost per sale from ads | under half the product price |
| Refund requests | under 2% |
| Site uptime | 99.9% |
| Students active in the last 7 days | over 30% of those who paid |

---

## 5. What to do this week

1. Change the admin password.
2. Put osdhyan.online on Cloudflare and run `cloudflared tunnel login`.
3. Click Create on the GitHub pull request.
4. Send me the BPSC TRE 1–3 official papers (PDFs).
5. Start the Udyam registration and the Razorpay account.

---

Sources: [BPSC 70th applications (Careers360)](https://news.careers360.com/bpsc-70th-cce-exam-date-not-postponed-normalisation-calls-server-issue-allegations-baseless-4-80-lakh-registered) ·
[BPSC 70th prelims result (Careers360)](https://news.careers360.com/bpsc-70th-cce-prelims-result-2025-declared-link-on-bpsc-bih-nic-in-21581-qualify) ·
[TRE 4 vacancies (Patna Press)](https://patnapress.com/bpsc-tre-4-0-32388-school-teacher-posts-announced-applications-open-from-september-1/) ·
[TRE phases (Careers360)](https://news.careers360.com/bpsc-tre-4-notification-bihar-education-department-proposes-32388-posts-recruitment-delay-cm-samrat-choudhary/amp) ·
[Bihar mobile use (Patna Press)](https://patnapress.com/?p=28963) ·
[Bihar internet penetration (Storyboard18 / IAMAI-Kantar)](https://www.storyboard18.com/how-it-works/active-internet-users-to-reach-900-mn-by-2025-report-7736.htm) ·
[Adda247 FY25 (Inc42)](https://inc42.com/?p=532454) ·
[Adda247 revenue (IPOMarket)](https://www.ipomarket.in/news/adda247-ipo-2026-date-price-review) ·
[PW Bihar test series prices](https://www.pw.live/bihar/test-series) ·
[StudyIQ Bihar](https://www.studyiq.com/goal/bihar?goalId=14) ·
[Education ad lead costs in India (Sotros)](https://sotrosinfotech.com/blog/meta-ads-cost-per-lead-education-india-southeast-asia-2026/) ·
[Meta ads India benchmarks (OwlClaw)](https://owlclaw.com/benchmarks/meta-ads-benchmarks-india)
