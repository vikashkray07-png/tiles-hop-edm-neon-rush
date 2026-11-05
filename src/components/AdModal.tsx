import React, { useEffect } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export type AdType = 'skin_unlock' | 'skin_coin_purchase' | 'level_complete' | 'continue_revive';

interface AdModalProps {
  type: AdType;
  title?: string;
  subtitle?: string;
  skinName?: string;
  adNumber?: number;
  totalAds?: number;
  onComplete: () => void;
  onClose?: () => void;
}

/**
 * Safe fallback while the native AdMob SDK is not installed/configured.
 * This component deliberately never calls onComplete: closing an unavailable
 * ad must not grant a revive, skin progress, currency, or any other reward.
 */
export const AdModal: React.FC<AdModalProps> = ({ type, skinName, onClose }) => {
  useEffect(() => {
    soundEngine.stopBackgroundMusic();
  }, []);

  const title = type === 'continue_revive'
    ? 'Rewarded revive unavailable'
    : type === 'skin_unlock'
      ? 'Rewarded skin ad unavailable'
      : type === 'level_complete'
        ? 'Interstitial ad unavailable'
        : 'Ad unavailable';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#1b0933] to-[#0d021c] p-6 text-center shadow-[0_0_40px_rgba(251,191,36,0.15)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
          <ShieldAlert className="h-7 w-7 text-amber-300" />
        </div>
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
          Real advertisement not configured
        </div>
        <h2 className="mb-3 text-xl font-black text-white">{title}</h2>
        <p className="mb-4 text-sm leading-relaxed text-white/70">
          No real ad was played, so no reward has been granted. Please try again later.
        </p>
        {skinName && (
          <p className="mb-4 rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white/60">
            Skin: <strong className="text-white">{skinName}</strong>
          </p>
        )}
        <p className="mb-5 text-[11px] text-white/40">
          Development fallback · Demo timers and simulated reward claims are disabled.
        </p>
        <button
          onClick={onClose}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15"
        >
          <X className="h-4 w-4" />
          CLOSE
        </button>
      </div>
    </div>
  );
};
