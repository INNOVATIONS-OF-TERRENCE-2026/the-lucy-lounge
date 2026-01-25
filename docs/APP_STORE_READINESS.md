# App Store Readiness

> Compliance checklist for wrapping Lucy AI as a native app.
> Version: 1.0.0 | Last Updated: 2026-01-25

## Overview

Lucy AI can be distributed through app stores using:
1. **PWA** - Direct install from browser (current)
2. **Capacitor/Cordova** - Native wrapper
3. **Electron** - Desktop app wrapper

This document covers compliance requirements for app store submission.

---

## Apple App Store Requirements

### Technical Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| No autoplay audio | ✅ | Gesture-gated |
| No autoplay video (unmuted) | ✅ | Muted autoplay only |
| User-initiated permissions | ✅ | All permissions from buttons |
| No private API usage | ✅ | Standard web APIs only |
| Minimum iOS version | ✅ | iOS 15+ |

### Privacy Requirements

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Privacy Policy | ⚠️ | Create /privacy page |
| App Privacy Labels | ⚠️ | Document data collection |
| Purpose strings | ⚠️ | Add to Info.plist |

#### Required Purpose Strings

```xml
<!-- For microphone -->
<key>NSMicrophoneUsageDescription</key>
<string>Lucy uses your microphone for voice conversations.</string>

<!-- For camera (if added) -->
<key>NSCameraUsageDescription</key>
<string>Lucy uses your camera for vision features.</string>

<!-- For speech recognition -->
<key>NSSpeechRecognitionUsageDescription</key>
<string>Lucy uses speech recognition for voice input.</string>
```

### Content Guidelines

| Guideline | Compliance |
|-----------|------------|
| No adult content | ✅ |
| No gambling | ✅ |
| No violence | ✅ |
| AI content disclosure | ⚠️ Add disclosure |

---

## Google Play Store Requirements

### Technical Requirements

| Requirement | Status | Notes |
|-------------|--------|-------|
| Target SDK 34+ | ⚠️ | Set in build.gradle |
| 64-bit support | ✅ | Web-based |
| Permissions declared | ⚠️ | Add to AndroidManifest |

### Privacy Requirements

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| Privacy Policy | ⚠️ | Create /privacy page |
| Data Safety form | ⚠️ | Complete in Play Console |

#### Required Permissions

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-feature android:name="android.hardware.microphone" android:required="false" />
```

---

## PWA to Native Wrapper

### Capacitor Setup (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize
npx cap init "Lucy AI" "com.lucyai.app"

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync
```

### Configuration

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lucyai.app',
  appName: 'Lucy AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a0f2e',
    },
  },
};

export default config;
```

---

## Media Policy Compliance

### Audio

| Platform | Requirement | Status |
|----------|-------------|--------|
| iOS | No background audio without entitlement | ✅ Gesture-gated |
| iOS | Audio session category | ⚠️ Configure in native |
| Android | No autoplay | ✅ Gesture-gated |

### Camera/Microphone

| Requirement | Status |
|-------------|--------|
| Request on user action only | ✅ |
| Clear purpose explanation | ✅ |
| Handle denial gracefully | ✅ |

---

## App Store Listing

### Required Assets

| Asset | Size | Format |
|-------|------|--------|
| App Icon | 1024x1024 | PNG |
| Screenshots (iOS) | Various | PNG |
| Screenshots (Android) | Various | PNG |
| Feature Graphic (Android) | 1024x500 | PNG |

### App Description Template

```
Lucy AI - Beyond Intelligence

Your advanced AI assistant with:
• Natural conversations
• Voice input support  
• Memory across sessions
• Beautiful interface

Lucy combines the power of advanced AI with an elegant, 
intuitive interface designed for mobile.

PRIVACY
- Your conversations are private
- No data sold to third parties
- Full control over your data

REQUIREMENTS
- iOS 15+ / Android 8+
- Internet connection for AI features
- Microphone permission for voice (optional)
```

---

## Compliance Checklist

### Before Submission

- [ ] Privacy Policy page exists
- [ ] Terms of Service page exists
- [ ] AI disclosure present (conversations are AI-generated)
- [ ] Microphone permission explained
- [ ] No autoplay audio on load
- [ ] All permissions user-initiated
- [ ] Error messages user-friendly
- [ ] Offline mode works
- [ ] Age rating appropriate

### iOS Specific

- [ ] Purpose strings in Info.plist
- [ ] App Transport Security configured
- [ ] No private APIs
- [ ] TestFlight beta tested

### Android Specific

- [ ] Permissions in AndroidManifest
- [ ] Data Safety form completed
- [ ] Content rating questionnaire done
- [ ] Internal/closed testing done

---

## Post-Submission

### Monitoring

- [ ] Crash reporting enabled
- [ ] Analytics tracking installs
- [ ] Review response plan ready

### Updates

- [ ] Update mechanism tested
- [ ] Version numbering scheme defined
- [ ] Changelog template ready

---

## Timeline Estimate

| Phase | Duration | Blockers |
|-------|----------|----------|
| Privacy/Legal docs | 1 week | Legal review |
| Capacitor setup | 2-3 days | None |
| iOS build/test | 1 week | Apple Developer account |
| Android build/test | 1 week | Play Console account |
| App Store submission | 1-2 weeks | Review process |
| Play Store submission | 2-3 days | Review process |

---

## Resources

- [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWA to Native Guide](https://web.dev/pwa-to-native/)
