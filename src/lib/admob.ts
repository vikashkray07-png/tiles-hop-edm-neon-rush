import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentStatus } from '@capacitor-community/admob';

// Google-provided Android test IDs only. Replace only after an adult account
// owner has completed the required AdMob, store, and privacy setup.
const TEST_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_REWARDED_ID = 'ca-app-pub-3940256099942544/5224354917';
const TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

let initialization: Promise<boolean> | null = null;
let interstitialInFlight = false;

export const isNativeAdMobAvailable = () => Capacitor.isNativePlatform();

export function initializeAdMob(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return Promise.resolve(false);
  if (!initialization) {
    initialization = (async () => {
      try {
        let consent = await AdMob.requestConsentInfo({ tagForUnderAgeOfConsent: true });
        if (consent.isConsentFormAvailable && consent.status === AdmobConsentStatus.REQUIRED) {
          consent = await AdMob.showConsentForm();
        }
        if (!consent.canRequestAds) return false;
        await AdMob.initialize();
        return true;
      } catch (error) {
        console.warn('[AdMob] Initialization/consent unavailable; gameplay continues without ads.', error);
        initialization = null;
        return false;
      }
    })();
  }
  return initialization;
}

export async function showRewardedTestAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !(await initializeAdMob())) return false;
  try {
    await AdMob.prepareRewardVideoAd({
      adId: TEST_REWARDED_ID,
      isTesting: true,
      npa: true,
    });
    const reward = await AdMob.showRewardVideoAd();
    return Number(reward?.amount) > 0;
  } catch (error) {
    console.warn('[AdMob] Rewarded test ad was not completed.', error);
    return false;
  }
}

export async function showInterstitialTestAd(): Promise<void> {
  if (!Capacitor.isNativePlatform() || interstitialInFlight || !(await initializeAdMob())) return;
  interstitialInFlight = true;
  try {
    await AdMob.prepareInterstitial({
      adId: TEST_INTERSTITIAL_ID,
      isTesting: true,
      npa: true,
    });
    await AdMob.showInterstitial();
  } catch (error) {
    console.warn('[AdMob] Interstitial test ad unavailable; continuing gameplay.', error);
  } finally {
    interstitialInFlight = false;
  }
}
