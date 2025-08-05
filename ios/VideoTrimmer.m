//
//  VideoTrimmer.m
//  smashspeed
//
//  Created by Diwen Huang on 2025-08-04.
//

#import <React/RCTBridgeModule.h>

// This macro exposes the Swift class "VideoTrimmer" to React Native.
// The first argument is the name you will use in JavaScript (`NativeModules.VideoTrimmer`).
// The second argument is the actual Swift class name.
@interface RCT_EXTERN_MODULE(VideoTrimmer, NSObject)

// This macro exposes the 'trim' method from your Swift class.
// It maps the Swift function to a method that can be called from JS.
// The method signature must match what you defined in Swift.
RCT_EXTERN_METHOD(trim:(NSString *)uri
                  startTime:(double)startTime
                  endTime:(double)endTime
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// This tells React Native that this module doesn't need to be initialized on the main thread,
// which can improve startup performance.
+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
