import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert, X, Loader2, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { showRewardedTestAd } from '../lib/admob';

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

export const AdModal: React.FC<AdModalProps> = ({
  type, skinName, adNumber, totalAds, onComplete, onClose,
}) => {
  const [status, setStatus] = useState<'loading' | 'unavailable' | 'rewarded'>('loading');
  const completedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    soundEngine.stopBackgroundMusic();
    mountedRef.current = true;
    let cancelled = false;

    if (type === 'continue_revive' || type === 'skin_unlock') {
      void (async () => {
        const earned = await showRewardedTestAd();
        if (cancelled || !mountedRef.current) return;
        if (earned && !completedRef.current) {
          completedRef.current = true;
          setStatus('rewarded');
          onComplete();
        } else {
          setStatus('unavailable');
        }
      })();
    } else {
      setStatus('unavailable');
    }

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [type, onComplete]);

  const title = type === 'continue_revive'
    ? 'Rewarded revive'
    : type === 'skin_unlock'
      ? 'Rewarded skin unlock'
      : type === 'level_complete'
        ? 'Interstitial unavailable'
        : 'Advertisement unavailable';

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#1b0933] to-[#0d021c] p-6 text-center shadow-[0_0_40px_rgba(251,191,36,0.15)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
          {status === 'loading' ? <Loader2 className="h-7 w-7 animate-spin text-amber-300" /> :
            status === 'rewarded' ? <CheckCircle2 className="h-7 w-7 text-emerald-300" /> :
              <ShieldAlert className="h-7 w-7 text-amber-300" />}
        </div>
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
          {status === 'loading' ? 'Loading Google test advertisement' :
            status === 'rewarded' ? 'Reward verified by ad provider' : 'Advertisement unavailable'}
        </div>
        <h2 className="mb-3 text-xl font-black text-white">{title}</h2>
        <p className="mb-4 text-sm leading-relaxed text-white/70">
          {status === 'loading'
            ? 'Please wait while the test ad is prepared.'
            : status === 'rewarded'
              ? 'The verified reward is being applied.'
              : 'No completed rewarded ad was confirmed. No reward has been granted.'}
        </p>
        {skinName && (
          <p className="mb-4 rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white/60">
            Skin: <strong className="text-white">{skinName}</strong>
            {typeof adNumber === 'number' && typeof totalAds === 'number' && (
              <span className="ml-2">({adNumber}/{totalAds})</span>
            )}
          </p>
        )}
        <p className="mb-5 text-[11px] text-white/40">
          Google test ads only · No real ad revenue or production ads are enabled.
        </p>
        <button
          onClick={onClose}
          disabled={status === 'loading'}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-40"
        >
          <X className="h-4 w-4" /> CLOSE
        </button>
      </div>
    </div>
  );
};
