"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.createInstance = exports.AmplitudeReactNative = void 0;
var _reactNative = require("react-native");
var _analyticsCore = require("@amplitude/analytics-core");
var _analyticsClientCommon = require("@amplitude/analytics-client-common");
var _context = require("./plugins/context");
var _config = require("./config");
var _cookieMigration = require("./cookie-migration");
var _platform = require("./utils/platform");
const START_SESSION_EVENT = 'session_start';
const END_SESSION_EVENT = 'session_end';
class AmplitudeReactNative extends _analyticsCore.AmplitudeCore {
  appState = 'background';

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  init() {
    let apiKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    let userId = arguments.length > 1 ? arguments[1] : undefined;
    let options = arguments.length > 2 ? arguments[2] : undefined;
    return (0, _analyticsCore.returnWrapper)(this._init({
      ...options,
      userId,
      apiKey
    }));
  }
  async _init(options) {
    var _this$config$loggerPr;
    // Step 0: Block concurrent initialization
    if (this.initializing) {
      return;
    }
    this.initializing = true;
    this.explicitSessionId = options.sessionId;

    // Step 1: Read cookies stored by old SDK
    const oldCookies = await (0, _cookieMigration.parseOldCookies)(options.apiKey, options);

    // Step 2: Create react native config
    const reactNativeOptions = await (0, _config.useReactNativeConfig)(options.apiKey, {
      ...options,
      deviceId: oldCookies.deviceId ?? options.deviceId,
      sessionId: oldCookies.sessionId,
      optOut: options.optOut ?? oldCookies.optOut,
      lastEventTime: oldCookies.lastEventTime,
      userId: options.userId || oldCookies.userId
    });
    await super._init(reactNativeOptions);

    // Set up the analytics connector to integrate with the experiment SDK.
    // Send events from the experiment SDK and forward identifies to the
    // identity store.
    const connector = (0, _analyticsClientCommon.getAnalyticsConnector)();
    connector.identityStore.setIdentity({
      userId: this.config.userId,
      deviceId: this.config.deviceId
    });

    // Step 3: Install plugins
    // Do not track any events before this
    await this.add(new _analyticsCore.Destination()).promise;
    await this.add(new _context.Context()).promise;
    await this.add(new _analyticsClientCommon.IdentityEventSender()).promise;

    // Step 4: Manage session
    this.appState = _reactNative.AppState.currentState;
    const isNewSession = this.startNewSessionIfNeeded();
    (_this$config$loggerPr = this.config.loggerProvider) === null || _this$config$loggerPr === void 0 ? void 0 : _this$config$loggerPr.log(`Init: startNewSessionIfNeeded = ${isNewSession ? 'yes' : 'no'}, sessionId = ${this.getSessionId() ?? 'undefined'}`);
    this.appStateChangeHandler = _reactNative.AppState.addEventListener('change', this.handleAppStateChange);
    this.initializing = false;

    // Step 5: Track attributions
    await this.runAttributionStrategy(options.attribution, isNewSession);

    // Step 6: Run queued functions
    await this.runQueuedFunctions('dispatchQ');

    // Step 7: Add the event receiver after running remaining queued functions.
    connector.eventBridge.setEventReceiver(event => {
      void this.track(event.eventType, event.eventProperties);
    });
  }
  shutdown() {
    var _this$appStateChangeH;
    (_this$appStateChangeH = this.appStateChangeHandler) === null || _this$appStateChangeH === void 0 ? void 0 : _this$appStateChangeH.remove();
  }
  async runAttributionStrategy(attributionConfig) {
    var _this = this;
    let isNewSession = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if ((0, _platform.isNative)()) {
      return;
    }
    const track = function () {
      return _this.track(...arguments).promise;
    };
    const onNewCampaign = this.setSessionId.bind(this, this.currentTimeMillis());
    const storage = await (0, _config.createCookieStorage)(this.config);
    const campaignTracker = new _analyticsClientCommon.CampaignTracker(this.config.apiKey, {
      ...attributionConfig,
      storage,
      track,
      onNewCampaign
    });
    await campaignTracker.send(isNewSession);
  }
  getUserId() {
    var _this$config;
    return (_this$config = this.config) === null || _this$config === void 0 ? void 0 : _this$config.userId;
  }
  setUserId(userId) {
    if (!this.config) {
      this.q.push(this.setUserId.bind(this, userId));
      return;
    }
    this.config.userId = userId;
    (0, _analyticsClientCommon.setConnectorUserId)(userId);
  }
  getDeviceId() {
    var _this$config2;
    return (_this$config2 = this.config) === null || _this$config2 === void 0 ? void 0 : _this$config2.deviceId;
  }
  setDeviceId(deviceId) {
    if (!this.config) {
      this.q.push(this.setDeviceId.bind(this, deviceId));
      return;
    }
    this.config.deviceId = deviceId;
    (0, _analyticsClientCommon.setConnectorDeviceId)(deviceId);
  }
  identify(identify, eventOptions) {
    if (eventOptions !== null && eventOptions !== void 0 && eventOptions.user_id) {
      this.setUserId(eventOptions.user_id);
    }
    if (eventOptions !== null && eventOptions !== void 0 && eventOptions.device_id) {
      this.setDeviceId(eventOptions.device_id);
    }
    return super.identify(identify, eventOptions);
  }
  reset() {
    this.setUserId(undefined);
    this.setDeviceId((0, _analyticsCore.UUID)());
  }
  getSessionId() {
    var _this$config3;
    return (_this$config3 = this.config) === null || _this$config3 === void 0 ? void 0 : _this$config3.sessionId;
  }
  setSessionId(sessionId) {
    if (!this.config) {
      this.q.push(this.setSessionId.bind(this, sessionId));
      return;
    }
    this.explicitSessionId = sessionId;
    void this.setSessionIdInternal(sessionId, this.currentTimeMillis());
  }
  extendSession() {
    if (!this.config) {
      this.q.push(this.extendSession.bind(this));
      return;
    }
    this.config.lastEventTime = this.currentTimeMillis();
  }
  setSessionIdInternal(sessionId, eventTime) {
    const previousSessionId = this.config.sessionId;
    if (previousSessionId === sessionId) {
      return;
    }
    this.config.sessionId = sessionId;
    if (this.config.trackingSessionEvents) {
      var _this$config$loggerPr2, _this$config$loggerPr3;
      (_this$config$loggerPr2 = this.config.loggerProvider) === null || _this$config$loggerPr2 === void 0 ? void 0 : _this$config$loggerPr2.log(`SESSION_END event: previousSessionId = ${previousSessionId ?? 'undefined'}`);
      if (previousSessionId !== undefined) {
        const sessionEndEvent = {
          event_type: END_SESSION_EVENT,
          time: this.config.lastEventTime !== undefined ? this.config.lastEventTime + 1 : sessionId,
          // increment lastEventTime to sort events properly in UI - session_end should be the last event in a session
          session_id: previousSessionId
        };
        void this.track(sessionEndEvent);
      }
      (_this$config$loggerPr3 = this.config.loggerProvider) === null || _this$config$loggerPr3 === void 0 ? void 0 : _this$config$loggerPr3.log(`SESSION_START event: sessionId = ${sessionId}`);
      const sessionStartEvent = {
        event_type: START_SESSION_EVENT,
        time: eventTime,
        session_id: sessionId
      };
      void this.track(sessionStartEvent);
    }
    this.config.lastEventTime = eventTime;
  }
  async process(event) {
    if (!this.config.optOut) {
      const eventTime = event.time ?? this.currentTimeMillis();
      if (event.time === undefined) {
        event = {
          ...event,
          time: eventTime
        };
      }
      if (event.event_type != START_SESSION_EVENT && event.event_type != END_SESSION_EVENT) {
        if (this.appState !== 'active') {
          this.startNewSessionIfNeeded(eventTime);
        }
      }
      this.config.lastEventTime = eventTime;
      if (event.session_id == undefined) {
        event.session_id = this.getSessionId();
      }
      if (event.event_id === undefined) {
        const eventId = (this.config.lastEventId ?? -1) + 1;
        event = {
          ...event,
          event_id: eventId
        };
        this.config.lastEventId = eventId;
      }
    }
    return super.process(event);
  }
  currentTimeMillis() {
    return Date.now();
  }
  startNewSessionIfNeeded(eventTime) {
    eventTime = eventTime ?? this.currentTimeMillis();
    const sessionId = this.explicitSessionId ?? eventTime;
    if (this.inSession() && (this.explicitSessionId === this.config.sessionId || this.explicitSessionId === undefined && this.isWithinMinTimeBetweenSessions(sessionId))) {
      this.config.lastEventTime = eventTime;
      return false;
    }
    this.setSessionIdInternal(sessionId, eventTime);
    return true;
  }
  isWithinMinTimeBetweenSessions(eventTime) {
    return eventTime - (this.config.lastEventTime ?? 0) < this.config.sessionTimeout;
  }
  inSession() {
    return this.config.sessionId != undefined;
  }
  handleAppStateChange = nextAppState => {
    const currentAppState = this.appState;
    this.appState = nextAppState;
    if (currentAppState !== nextAppState && nextAppState === 'active') {
      var _this$config$loggerPr4;
      (_this$config$loggerPr4 = this.config.loggerProvider) === null || _this$config$loggerPr4 === void 0 ? void 0 : _this$config$loggerPr4.log('App Activated');
      this.startNewSessionIfNeeded();
    }
  };
}
exports.AmplitudeReactNative = AmplitudeReactNative;
const createInstance = () => {
  const client = new AmplitudeReactNative();
  return {
    init: (0, _analyticsCore.debugWrapper)(client.init.bind(client), 'init', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config'])),
    add: (0, _analyticsCore.debugWrapper)(client.add.bind(client), 'add', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.plugins'])),
    remove: (0, _analyticsCore.debugWrapper)(client.remove.bind(client), 'remove', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.plugins'])),
    track: (0, _analyticsCore.debugWrapper)(client.track.bind(client), 'track', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    logEvent: (0, _analyticsCore.debugWrapper)(client.logEvent.bind(client), 'logEvent', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    identify: (0, _analyticsCore.debugWrapper)(client.identify.bind(client), 'identify', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    groupIdentify: (0, _analyticsCore.debugWrapper)(client.groupIdentify.bind(client), 'groupIdentify', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    setGroup: (0, _analyticsCore.debugWrapper)(client.setGroup.bind(client), 'setGroup', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    revenue: (0, _analyticsCore.debugWrapper)(client.revenue.bind(client), 'revenue', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    flush: (0, _analyticsCore.debugWrapper)(client.flush.bind(client), 'flush', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config.apiKey', 'timeline.queue.length'])),
    getUserId: (0, _analyticsCore.debugWrapper)(client.getUserId.bind(client), 'getUserId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config', 'config.userId'])),
    setUserId: (0, _analyticsCore.debugWrapper)(client.setUserId.bind(client), 'setUserId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config', 'config.userId'])),
    getDeviceId: (0, _analyticsCore.debugWrapper)(client.getDeviceId.bind(client), 'getDeviceId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config', 'config.deviceId'])),
    setDeviceId: (0, _analyticsCore.debugWrapper)(client.setDeviceId.bind(client), 'setDeviceId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config', 'config.deviceId'])),
    reset: (0, _analyticsCore.debugWrapper)(client.reset.bind(client), 'reset', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config', 'config.userId', 'config.deviceId'])),
    getSessionId: (0, _analyticsCore.debugWrapper)(client.getSessionId.bind(client), 'getSessionId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config'])),
    setSessionId: (0, _analyticsCore.debugWrapper)(client.setSessionId.bind(client), 'setSessionId', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config'])),
    extendSession: (0, _analyticsCore.debugWrapper)(client.extendSession.bind(client), 'extendSession', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config'])),
    setOptOut: (0, _analyticsCore.debugWrapper)(client.setOptOut.bind(client), 'setOptOut', (0, _analyticsCore.getClientLogConfig)(client), (0, _analyticsCore.getClientStates)(client, ['config']))
  };
};
exports.createInstance = createInstance;
var _default = createInstance();
exports.default = _default;
//# sourceMappingURL=react-native-client.js.map