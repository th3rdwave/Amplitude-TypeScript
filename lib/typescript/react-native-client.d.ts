import { AppStateStatus } from 'react-native';
import { AmplitudeCore } from '@amplitude/analytics-core';
import { ReactNativeConfig, ReactNativeOptions, ReactNativeClient, Identify as IIdentify, EventOptions, Event, Result } from '@amplitude/analytics-types';
import { ReactNativeAttributionOptions } from '@amplitude/analytics-types/lib/esm/config';
export declare class AmplitudeReactNative extends AmplitudeCore {
    appState: AppStateStatus;
    private appStateChangeHandler;
    explicitSessionId: number | undefined;
    config: ReactNativeConfig;
    init(apiKey?: string, userId?: string, options?: ReactNativeOptions): import("@amplitude/analytics-types").AmplitudeReturn<void>;
    protected _init(options: ReactNativeOptions & {
        apiKey: string;
    }): Promise<void>;
    shutdown(): void;
    runAttributionStrategy(attributionConfig?: ReactNativeAttributionOptions, isNewSession?: boolean): Promise<void>;
    getUserId(): string | undefined;
    setUserId(userId: string | undefined): void;
    getDeviceId(): string | undefined;
    setDeviceId(deviceId: string): void;
    identify(identify: IIdentify, eventOptions?: EventOptions): import("@amplitude/analytics-types").AmplitudeReturn<Result>;
    reset(): void;
    getSessionId(): number | undefined;
    setSessionId(sessionId: number): void;
    extendSession(): void;
    private setSessionIdInternal;
    process(event: Event): Promise<Result>;
    currentTimeMillis(): number;
    private startNewSessionIfNeeded;
    private isWithinMinTimeBetweenSessions;
    private inSession;
    private readonly handleAppStateChange;
}
export declare const createInstance: () => ReactNativeClient;
declare const _default: ReactNativeClient;
export default _default;
//# sourceMappingURL=react-native-client.d.ts.map