import { afterEach, describe, expect, it } from 'vitest';
import {
  clearFullSitePreference,
  detectMobileDevice,
  hasFullSiteOptOut,
  type MobileEnv,
  shouldRedirectToMobile,
} from '../src/lib/mobile';
import { DEFAULT_SELECTED_FLOOR } from '../src/pages/Home';

const DESKTOP: MobileEnv = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
  userAgentMobile: false,
  maxTouchPoints: 0,
  coarsePointer: false,
  innerWidth: 1440,
};

afterEach(() => {
  clearFullSitePreference();
});

describe('mobile device detection', () => {
  it('detects iPhones and Android phones from user agent even in landscape', () => {
    expect(
      detectMobileDevice({
        ...DESKTOP,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
        userAgentMobile: undefined,
        maxTouchPoints: 5,
        coarsePointer: true,
        innerWidth: 844,
      }),
    ).toBe(true);

    expect(
      detectMobileDevice({
        ...DESKTOP,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/128.0.0.0 Mobile Safari/537.36',
        userAgentMobile: true,
        maxTouchPoints: 5,
        coarsePointer: true,
        innerWidth: 915,
      }),
    ).toBe(true);
  });

  it('detects Client Hints userAgentData.mobile === true', () => {
    expect(detectMobileDevice({ ...DESKTOP, userAgentMobile: true })).toBe(true);
  });

  it('detects touch devices at phone width and narrow phone viewports', () => {
    expect(detectMobileDevice({ ...DESKTOP, coarsePointer: true, maxTouchPoints: 5, innerWidth: 740 })).toBe(true);
    expect(detectMobileDevice({ ...DESKTOP, innerWidth: 390 })).toBe(true);
  });

  it('does not flag desktop browsers or wide tablets as mobile phones', () => {
    expect(detectMobileDevice(DESKTOP)).toBe(false);
    expect(
      detectMobileDevice({
        ...DESKTOP,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
        userAgentMobile: false,
        maxTouchPoints: 10,
        coarsePointer: true,
        innerWidth: 1024,
      }),
    ).toBe(false);
  });
});

describe('mobile full-site default behavior', () => {
  const IPHONE: MobileEnv = {
    ...DESKTOP,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148',
    userAgentMobile: undefined,
    maxTouchPoints: 5,
    coarsePointer: true,
    innerWidth: 390,
  };

  it('keeps mobile users on the full site instead of redirecting to a minimized view', () => {
    expect(shouldRedirectToMobile('', IPHONE)).toBe(false);
    expect(shouldRedirectToMobile('', DESKTOP)).toBe(false);
    expect(hasFullSiteOptOut('?view=full')).toBe(true);
    expect(shouldRedirectToMobile('?view=full', IPHONE)).toBe(false);
  });

  it('starts the full site with Floor 7 automatically selected', () => {
    expect(DEFAULT_SELECTED_FLOOR).toBe(7);
  });
});
