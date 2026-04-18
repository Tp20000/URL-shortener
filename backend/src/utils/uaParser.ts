export interface ParsedUA {
  device: string;
  browser: string;
  os: string;
}

export function parseUserAgent(ua: string): ParsedUA {
  const userAgent = ua || '';

  // ─── Device Detection ─────────────────────────────────
  let device = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    device = 'tablet';
  } else if (
    /mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent)
  ) {
    device = 'mobile';
  }

  // ─── Browser Detection ────────────────────────────────
  let browser = 'unknown';
  if (/edg\//i.test(userAgent)) {
    browser = 'Edge';
  } else if (/opr\//i.test(userAgent) || /opera/i.test(userAgent)) {
    browser = 'Opera';
  } else if (/chrome|crios/i.test(userAgent) && !/edg\//i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/msie|trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  } else if (/curl/i.test(userAgent)) {
    browser = 'curl';
  } else if (/postman/i.test(userAgent)) {
    browser = 'Postman';
  }

  // ─── OS Detection ─────────────────────────────────────
  let os = 'unknown';
  if (/windows nt/i.test(userAgent)) {
    os = 'Windows';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  } else if (/mac os x/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/cros/i.test(userAgent)) {
    os = 'ChromeOS';
  }

  return { device, browser, os };
}