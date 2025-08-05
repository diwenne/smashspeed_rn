//
//  VideoTrimmer.swift
//  smashspeed
//
//  Created by Diwen Huang on 2025-08-04.
//

import Foundation
import AVFoundation

// The @objc(VideoTrimmer) attribute makes this Swift class visible to the Objective-C runtime.
@objc(VideoTrimmer)
class VideoTrimmer: NSObject {

  // This function must also be exposed to Objective-C.
  // The signature matches the one declared in the .m file.
  @objc(trim:startTime:endTime:resolver:rejecter:)
  func trim(uri: String, startTime: Double, endTime: Double, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    
    // 1. Validate the input URL
    guard let url = URL(string: uri) else {
      let error = NSError(domain: "VideoTrimmerError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid video URL"])
      reject("INVALID_URL", "The provided URI is not a valid URL.", error)
      return
    }

    let asset = AVAsset(url: url)
    
    // 2. Create an export session
    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality) else {
      let error = NSError(domain: "VideoTrimmerError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Could not create AVAssetExportSession"])
      reject("EXPORT_FAILED", "Could not create AVAssetExportSession.", error)
      return
    }

    // 3. Define output path and file type
    let tempDirectory = FileManager.default.temporaryDirectory
    let outputURL = tempDirectory.appendingPathComponent(UUID().uuidString + ".mp4")
    
    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4

    // 4. Define the time range for trimming
    let startTimeCM = CMTime(seconds: startTime, preferredTimescale: 600)
    let endTimeCM = CMTime(seconds: endTime, preferredTimescale: 600)
    let timeRange = CMTimeRange(start: startTimeCM, end: endTimeCM)
    exportSession.timeRange = timeRange

    // 5. Perform the export asynchronously
    exportSession.exportAsynchronously {
      DispatchQueue.main.async {
        switch exportSession.status {
        case .completed:
          // On success, resolve the promise with the new file URL
          resolve(outputURL.absoluteString)
        case .failed:
          // On failure, reject the promise with an error
          let error = exportSession.error ?? NSError(domain: "VideoTrimmerError", code: 3, userInfo: [NSLocalizedDescriptionKey: "Unknown export error"])
          reject("EXPORT_FAILED", "Video export failed.", error)
        case .cancelled:
          let error = NSError(domain: "VideoTrimmerError", code: 4, userInfo: [NSLocalizedDescriptionKey: "Export was cancelled"])
          reject("EXPORT_CANCELLED", "Video export was cancelled.", error)
        default:
          // Should not happen
          break
        }
      }
    }
  }
}
