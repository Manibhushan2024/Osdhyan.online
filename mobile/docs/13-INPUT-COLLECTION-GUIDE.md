# Mobile Input Collection Guide

This guide shows how to collect every remaining value needed to finish the mobile app and move to preview and production builds.

Use it in this order.

---

## Step 1 - Create Your Local `.env`

Run this from the repo root:

```powershell
cd c:\dev\test-series-platform\mobile\osdhyan
Copy-Item .env.example .env
notepad .env
```

Use this starter content:

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SCHEME=osdhyan
EXPO_PUBLIC_DEEP_LINK_DOMAIN=
OSDHYAN_APP_NAME=OSDHYAN
OSDHYAN_APP_SLUG=osdhyan
OSDHYAN_IOS_BUNDLE_ID=
OSDHYAN_ANDROID_PACKAGE=
EAS_PROJECT_ID=
EXPO_OWNER=
```

---

## Step 2 - Get `EXPO_PUBLIC_API_URL`

This is the most important input. The app cannot be validated properly without it.

### If your backend is already deployed

Take your backend public URL and add `/api`.

Examples:

```text
https://api.yourdomain.com/api
https://yourdomain.com/api
```

If your Laravel backend has `APP_URL=https://yourdomain.com`, then your mobile API URL is usually:

```text
https://yourdomain.com/api
```

### If your backend is only running locally

Do not use `localhost` on a phone or emulator.

1. Find your Windows LAN IP:

```powershell
ipconfig
```

Look for the IPv4 Address on your active Wi-Fi or Ethernet adapter, for example:

```text
192.168.1.100
```

2. Start Laravel so other devices can reach it:

```powershell
cd c:\dev\test-series-platform\backend
php artisan serve --host 0.0.0.0 --port 8000
```

3. Use this value in `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### What exists right now in this repo

Your local backend file [backend/.env](c:/dev/test-series-platform/backend/.env) currently has:

```env
APP_URL=http://localhost:8000
```

That is fine for local browser testing, but it is not valid for a real phone. Replace `localhost` with your machine LAN IP if you are testing from a device.

---

## Step 3 - Decide `OSDHYAN_ANDROID_PACKAGE` And `OSDHYAN_IOS_BUNDLE_ID`

These are the app identifiers used by Google Play and Apple.

### Recommended format

Use reverse-domain format:

```text
com.yourcompany.osdhyan
com.yourcompany.osdhyan.mobile
```

### Fastest decision rule

If you already own a business domain, use it reversed.

Examples:

```text
Domain: osdhyan.com
Android package: com.osdhyan.mobile
iOS bundle ID: com.osdhyan.mobile

Domain: antigravitylabs.in
Android package: in.antigravitylabs.osdhyan
iOS bundle ID: in.antigravitylabs.osdhyan
```

### If you do not have a company domain yet

Use the current default for both:

```env
OSDHYAN_ANDROID_PACKAGE=com.osdhyan.mobile
OSDHYAN_IOS_BUNDLE_ID=com.osdhyan.mobile
```

You can keep this unless you already published another app with the same ID.

---

## Step 4 - Get `EXPO_PUBLIC_DEEP_LINK_DOMAIN`

This is the website domain used for universal links.

### Best option

Use the same domain as your website or backend root domain.

Examples:

```env
EXPO_PUBLIC_DEEP_LINK_DOMAIN=osdhyan.com
EXPO_PUBLIC_DEEP_LINK_DOMAIN=app.osdhyan.com
```

### If you are not ready yet

You can still keep moving with:

```env
EXPO_PUBLIC_DEEP_LINK_DOMAIN=osdhyan.com
```

Then later we will configure:

```text
https://YOUR_DOMAIN/.well-known/assetlinks.json
https://YOUR_DOMAIN/.well-known/apple-app-site-association
```

The immediate thing I need from you is only the domain string.

---

## Step 5 - Get `EXPO_OWNER` And `EAS_PROJECT_ID`

These come from Expo/EAS.

### Run these commands

```powershell
cd c:\dev\test-series-platform\mobile\osdhyan
npx eas login
npx eas whoami
npx eas init
npx eas project:info
```

### What to copy

- `EXPO_OWNER`: the username shown by `npx eas whoami`
- `EAS_PROJECT_ID`: the `projectId` shown by `npx eas project:info`

### Example

```env
EXPO_OWNER=your-expo-username
EAS_PROJECT_ID=12345678-abcd-1234-abcd-1234567890ab
```

If `npx eas init` says the project is already linked, that is fine. Just run `npx eas project:info` and copy the existing ID.

---

## Step 6 - Prepare Branding Assets

These are the files the current Expo config expects:

- [icon.png](c:/dev/test-series-platform/mobile/osdhyan/assets/icon.png)
- [splash-icon.png](c:/dev/test-series-platform/mobile/osdhyan/assets/splash-icon.png)
- [adaptive-icon.png](c:/dev/test-series-platform/mobile/osdhyan/assets/adaptive-icon.png)

### Minimum files you should prepare

1. App icon
2. Splash logo
3. Android adaptive icon foreground

### Recommended specs

```text
icon.png: 1024x1024 PNG
splash-icon.png: centered logo PNG, high resolution
adaptive-icon.png: 1024x1024 PNG, transparent background, foreground only
```

### Fastest way to move forward

If you already have a logo from the website, send me:

1. The logo file
2. Brand colors
3. App name text style preference

I can wire temporary production-safe assets from that.

---

## Step 7 - Get Privacy Policy URL And Support Email

Both stores require this.

### Support email

Use any email you actively monitor.

Example:

```text
support@osdhyan.com
hello@osdhyan.com
```

### Privacy policy URL

Fastest acceptable option:

1. Create a public page on your existing website
2. Put your privacy policy text there
3. Copy that full URL

Example:

```text
https://osdhyan.com/privacy-policy
```

If you do not have this page yet, send me the planned URL path and I will keep the mobile release checklist aligned around it.

---

## Step 8 - Fill `.env`

Once you have the values, paste them into:

[mobile/osdhyan/.env](c:/dev/test-series-platform/mobile/osdhyan/.env)

Example:

```env
EXPO_PUBLIC_API_URL=https://yourdomain.com/api
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SCHEME=osdhyan
EXPO_PUBLIC_DEEP_LINK_DOMAIN=osdhyan.com
OSDHYAN_APP_NAME=OSDHYAN
OSDHYAN_APP_SLUG=osdhyan
OSDHYAN_IOS_BUNDLE_ID=com.osdhyan.mobile
OSDHYAN_ANDROID_PACKAGE=com.osdhyan.mobile
EAS_PROJECT_ID=12345678-abcd-1234-abcd-1234567890ab
EXPO_OWNER=your-expo-username
```

---

## Step 9 - Send Me This Copy-Paste Reply

Send this back after filling the values:

```text
EXPO_PUBLIC_API_URL=
OSDHYAN_ANDROID_PACKAGE=
OSDHYAN_IOS_BUNDLE_ID=
EXPO_PUBLIC_DEEP_LINK_DOMAIN=
EXPO_OWNER=
EAS_PROJECT_ID=
PRIVACY_POLICY_URL=
SUPPORT_EMAIL=
```

If branding is ready, also send:

```text
ICON_FILE=
SPLASH_FILE=
ADAPTIVE_ICON_FILE=
```

---

## Step 10 - What Happens After You Send It

After you send those values, I will continue in this order:

1. wire final environment values into the mobile app
2. validate the app against the real backend
3. fix API mismatches and runtime issues
4. prepare preview builds
5. move to deployment checklist and store packaging
