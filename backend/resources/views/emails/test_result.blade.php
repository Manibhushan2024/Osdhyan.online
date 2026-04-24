<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your Test Result — OSDHYAN</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; color: #1e293b; }
  .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%); padding: 32px; text-align: center; }
  .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
  .header p { color: rgba(255,255,255,0.6); margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
  .body { padding: 32px; }
  .greeting { font-size: 18px; font-weight: 700; margin: 0 0 16px; }
  .score-card { background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%); border-radius: 14px; padding: 28px 24px; text-align: center; margin: 20px 0; color: #fff; }
  .score-card .score-val { font-size: 52px; font-weight: 900; line-height: 1; }
  .score-card .score-label { font-size: 13px; opacity: 0.75; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; font-weight: 700; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .stat { background: #f8fafc; border-radius: 10px; padding: 16px; text-align: center; }
  .stat .val { font-size: 22px; font-weight: 800; color: #1e293b; }
  .stat .lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; margin-top: 4px; }
  .correct .val { color: #16a34a; }
  .wrong .val { color: #dc2626; }
  .time .val { color: #7c3aed; }
  .text { font-size: 15px; line-height: 1.7; color: #475569; margin: 0 0 20px; }
  .cta { text-align: center; margin: 24px 0; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn { display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-size: 13px; font-weight: 800; letter-spacing: 0.5px; }
  .btn-outline { background: transparent; color: #1d4ed8; border: 2px solid #1d4ed8; }
  .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>OSDHYAN</h1>
    <p>Test Result Summary</p>
  </div>

  <div class="body">
    <p class="greeting">Great effort, {{ $name }}!</p>
    <p class="text">Here's your result for <strong>{{ $testName }}</strong>:</p>

    <div class="score-card">
      <div class="score-val">{{ $totalScore }}<span style="font-size:24px; opacity:0.6">/{{ $totalMarks }}</span></div>
      <div class="score-label">Total Score &nbsp;·&nbsp; {{ $accuracy }}% Accuracy</div>
    </div>

    <div class="stats">
      <div class="stat correct">
        <div class="val">{{ $correctCount }}</div>
        <div class="lbl">Correct</div>
      </div>
      <div class="stat wrong">
        <div class="val">{{ $incorrectCount }}</div>
        <div class="lbl">Wrong</div>
      </div>
      <div class="stat time">
        <div class="val">{{ $timeTaken }}</div>
        <div class="lbl">Time Taken</div>
      </div>
    </div>

    @if($accuracy >= 75)
      <p class="text" style="color:#15803d; font-weight:600;">
        Excellent performance! You're in the top accuracy band. Keep up the consistency.
      </p>
    @elseif($accuracy >= 50)
      <p class="text" style="color:#b45309; font-weight:600;">
        Good effort! Review the solutions to understand your mistakes — that's where the real learning happens.
      </p>
    @else
      <p class="text" style="color:#dc2626; font-weight:600;">
        Don't be discouraged. Every attempt reveals a gap to close. Check the solutions and create revision notes.
      </p>
    @endif

    <div class="cta">
      <a href="{{ $resultUrl }}" class="btn">View Full Result →</a>
      <a href="{{ $solutionsUrl }}" class="btn btn-outline">Review Solutions</a>
    </div>
  </div>

  <div class="footer">
    <p>OSDHYAN · India's focused exam prep platform · <a href="mailto:support@osdhyan.com" style="color:#94a3b8;">support@osdhyan.com</a></p>
  </div>
</div>
</body>
</html>
