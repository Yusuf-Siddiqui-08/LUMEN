/**
 * Client-side mobile device detection and opt-out helpers for switching `/` to `/mobile`.
 * Keeps zero cookies and zero persistent storage to match LUMEN's privacy commitments.
 */

export const MOBILE_VIEWPORT_MAX_PX = 639;
export const MOBILE_TOUCH_MAX_PX = 767;

const MOBILE_UA_RE = /Android.+Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|webOS/i;

export interface MobileEnv {
  userAgent: string;
  userAgentMobile?: boolean;
  maxTouchPoints: number;
  coarsePointer: boolean;
  innerWidth: number;
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: { mobile?: boolean };
}

/** Pure detection function for mobile phones (real UAs, Client Hints, touch + phone width, or phone-sized viewport). */
export function detectMobileDevice(env: MobileEnv): boolean {
  if (env.userAgentMobile === true) return true;
  if (MOBILE_UA_RE.test(env.userAgent)) return true;
  if ((env.coarsePointer || env.maxTouchPoints > 0) && env.innerWidth > 0 && env.innerWidth <= MOBILE_TOUCH_MAX_PX) {
    return true;
  }
  if (env.innerWidth > 0 && env.innerWidth <= MOBILE_VIEWPORT_MAX_PX) return true;
  return false;
}

/** Read the current browser environment and report whether it is a mobile device/viewport. */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithUAData;
  const coarsePointer = Boolean(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  return detectMobileDevice({
    userAgent: navigator.userAgent || '',
    userAgentMobile: typeof nav.userAgentData?.mobile === 'boolean' ? nav.userAgentData.mobile : undefined,
    maxTouchPoints: navigator.maxTouchPoints ?? 0,
    coarsePointer,
    innerWidth: window.innerWidth,
  });
}

/** True when the URL explicitly requests the desktop/full site (`?view=full`). */
export function hasFullSiteOptOut(search: string): boolean {
  return new URLSearchParams(search).get('view') === 'full';
}

/** Purely in-memory per-tab flag so tapping "Full site" survives SPA navigation without cookies/storage. */
let fullSitePreferred = false;

export function rememberFullSitePreference(): void {
  fullSitePreferred = true;
}

export function clearFullSitePreference(): void {
  fullSitePreferred = false;
}

export function isFullSitePreferred(): boolean {
  return fullSitePreferred;
}

/** Whether landing on `/` should automatically switch to `/mobile`. */
export function shouldRedirectToMobile(search: string, env?: MobileEnv): boolean {
  if (hasFullSiteOptOut(search) || fullSitePreferred) return false;
  return env ? detectMobileDevice(env) : isMobileDevice();
}
