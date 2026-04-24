<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to OSDHYAN</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; color: #1e293b; }
  .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
  .header { background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%); padding: 40px 32px; text-align: center; }
  .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.75); margin: 6px 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; }
  .body { padding: 36px 32px; }
  .greeting { font-size: 20px; font-weight: 700; margin: 0 0 12px; }
  .text { font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 20px; }
  .features { background: #f8fafc; border-radius: 12px; padding: 20px 24px; margin: 24px 0; }
  .features ul { margin: 0; padding: 0; list-style: none; }
  .features ul li { font-size: 14px; color: #334155; padding: 6px 0; padding-left: 24px; position: relative; font-weight: 600; }
  .features ul li::before { content: '✓'; position: absolute; left: 0; color: #22c55e; font-weight: 900; }
  .cta { text-align: center; margin: 28px 0; }
  .btn { display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; }
  .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>OSDHYAN</h1>
    <p>Exam Preparation &amp; Mastery Platform</p>
  </div>

  <div class="body">
    <p class="greeting">Namaste, {{ $name }}!</p>
    <p class="text">
      Your OSDHYAN account is now active. You're one step closer to cracking
      <strong>{{ $exam }}</strong>. Thousands of serious aspirants are already using OSDHYAN
      to build consistency, track progress, and reach their target score.
    </p>

    <div class="features">
      <ul>
        <li>Unlimited mock tests with detailed solutions</li>
        <li>Bilingual questions — English &amp; Hindi</li>
        <li>AI-powered performance insights and weak-area analysis</li>
        <li>Daily &amp; weekly study planner with section timers</li>
        <li>Study streak tracker to build consistency</li>
        <li>NCERT notes, PYQs, and subject-wise courses</li>
      </ul>
    </div>

    <p class="text">
      Start with a free mock test today — no setup needed. Your dashboard is ready.
    </p>

    <div class="cta">
      <a href="{{ $dashboardUrl }}" class="btn">Go to My Dashboard →</a>
    </div>

    <p class="text" style="font-size:13px; color:#94a3b8;">
      If you didn't create this account, ignore this email — no action is needed.
    </p>
  </div>

  <div class="footer">
    <p>
      OSDHYAN · India's focused exam prep platform<br />
      <a href="{{ $dashboardUrl }}" style="color:#4f46e5; text-decoration:none;">osdhyan.com</a>
      &nbsp;·&nbsp;
      <a href="mailto:support@osdhyan.com" style="color:#94a3b8; text-decoration:none;">support@osdhyan.com</a>
    </p>
  </div>
</div>
</body>
</html>
