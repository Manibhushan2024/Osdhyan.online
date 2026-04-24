<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Your OSDHYAN OTP</title>
<style>
  body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f1f5f9; color: #1e293b; }
  .wrapper { max-width: 480px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.07); }
  .header { background: linear-gradient(135deg, #1e40af 0%, #4f46e5 100%); padding: 28px 32px; text-align: center; }
  .header h1 { margin: 0; color: #fff; font-size: 22px; font-weight: 900; }
  .body { padding: 36px 32px; text-align: center; }
  .greeting { font-size: 17px; font-weight: 700; margin: 0 0 12px; }
  .text { font-size: 14px; line-height: 1.7; color: #64748b; margin: 0 0 28px; }
  .otp-box { background: #f0f4ff; border: 2px dashed #818cf8; border-radius: 14px; padding: 24px; margin: 0 auto 24px; display: inline-block; min-width: 200px; }
  .otp-val { font-size: 48px; font-weight: 900; letter-spacing: 14px; color: #1e40af; line-height: 1; }
  .otp-sub { font-size: 12px; color: #94a3b8; margin-top: 8px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
  .warning { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 10px; padding: 14px; font-size: 13px; color: #9a3412; margin: 0 0 20px; text-align: left; }
  .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { margin: 0; font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>OSDHYAN</h1>
  </div>

  <div class="body">
    <p class="greeting">Hello, {{ $name }}</p>
    <p class="text">
      @if($purpose === 'reset')
        Use this OTP to reset your OSDHYAN password. It expires in <strong>{{ $expiry }}</strong>.
      @else
        Use this OTP to complete your OSDHYAN login. It expires in <strong>{{ $expiry }}</strong>.
      @endif
    </p>

    <div class="otp-box">
      <div class="otp-val">{{ $otp }}</div>
      <div class="otp-sub">One-time password</div>
    </div>

    <div class="warning">
      <strong>Security Notice:</strong> Never share this OTP with anyone.
      OSDHYAN staff will never ask for your OTP. This code expires in {{ $expiry }}.
    </div>

    <p style="font-size:13px; color:#94a3b8;">
      If you didn't request this OTP, please ignore this email.
      Your account is safe.
    </p>
  </div>

  <div class="footer">
    <p>OSDHYAN · <a href="mailto:support@osdhyan.com" style="color:#94a3b8;">support@osdhyan.com</a></p>
  </div>
</div>
</body>
</html>
