import { getOldCookieName } from '@amplitude/analytics-client-common';
import { createCookieStorage, getDefaultConfig, getTopLevelDomain } from '../config';
export const parseOldCookies = async (apiKey, options) => {
  const storage = await createCookieStorage({
    ...options,
    domain: options !== null && options !== void 0 && options.disableCookies ? '' : (options === null || options === void 0 ? void 0 : options.domain) ?? (await getTopLevelDomain())
  });
  const oldCookieName = getOldCookieName(apiKey);
  const cookies = await storage.getRaw(oldCookieName);
  if (!cookies) {
    return {
      optOut: false
    };
  }
  if ((options === null || options === void 0 ? void 0 : options.cookieUpgrade) ?? getDefaultConfig().cookieUpgrade) {
    await storage.remove(oldCookieName);
  }
  const [deviceId, userId, optOut, sessionId, lastEventTime] = cookies.split('.');
  return {
    deviceId,
    userId: decode(userId),
    sessionId: parseTime(sessionId),
    lastEventTime: parseTime(lastEventTime),
    optOut: Boolean(optOut)
  };
};
export const parseTime = num => {
  const integer = parseInt(num, 32);
  if (isNaN(integer)) {
    return undefined;
  }
  return integer;
};
export const decode = value => {
  if (!atob || !escape || !value) {
    return undefined;
  }
  try {
    return decodeURIComponent(escape(atob(value)));
  } catch {
    return undefined;
  }
};
//# sourceMappingURL=index.js.map