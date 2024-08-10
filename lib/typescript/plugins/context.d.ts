import { BeforePlugin, ReactNativeConfig, Event, ReactNativeTrackingOptions } from '@amplitude/analytics-types';
import UAParser from '@amplitude/ua-parser-js';
type NativeContext = {
    version: string;
    platform: string;
    language: string;
    osName: string;
    osVersion: string;
    deviceBrand: string;
    deviceManufacturer: string;
    deviceModel: string;
    carrier: string;
    adid: string;
    appSetId: string;
    idfv: string;
};
export interface AmplitudeReactNative {
    getApplicationContext(options: ReactNativeTrackingOptions): Promise<NativeContext>;
}
export declare class Context implements BeforePlugin {
    name: string;
    type: "before";
    config: ReactNativeConfig;
    uaResult: UAParser.IResult;
    nativeModule: AmplitudeReactNative | undefined;
    library: string;
    constructor();
    setup(config: ReactNativeConfig): Promise<undefined>;
    execute(context: Event): Promise<Event>;
}
export {};
//# sourceMappingURL=context.d.ts.map