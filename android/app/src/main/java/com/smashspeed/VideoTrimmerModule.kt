// android/app/src/main/java/com/smashspeed/VideoTrimmerModule.kt

package com.smashspeed // <-- IMPORTANT: Change "smashspeed" to your actual package name

import android.media.MediaCodec
import android.media.MediaExtractor
import android.media.MediaFormat
import android.media.MediaMuxer
import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.nio.ByteBuffer

class VideoTrimmerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // This is the name that will be used to access the module from JavaScript
    override fun getName() = "VideoTrimmer"

    @ReactMethod
    fun trim(uriString: String, startTime: Double, endTime: Double, promise: Promise) {
        val context = reactApplicationContext
        
        try {
            // 1. Set up the input and output file paths
            val inputFileDescriptor = context.contentResolver.openFileDescriptor(Uri.parse(uriString), "r")
            if (inputFileDescriptor == null) {
                promise.reject("E_FILE_NOT_FOUND", "Could not open file descriptor for URI: $uriString")
                return
            }
            val outputFile = File(context.cacheDir, "trimmed-${System.currentTimeMillis()}.mp4")

            // 2. Perform the trimming operation
            genVideoUsingMuxer(inputFileDescriptor.fileDescriptor, outputFile.absolutePath, startTime, endTime)
            
            // 3. Clean up and resolve the promise with the new file URI
            inputFileDescriptor.close()
            promise.resolve(Uri.fromFile(outputFile).toString())

        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("E_TRIM_FAILED", "Video trimming failed with error: ${e.message}", e)
        }
    }

    // This function does the actual work of reading frames from the original video
    // and writing the selected range to a new file without re-encoding.
    private fun genVideoUsingMuxer(srcFd: java.io.FileDescriptor, dstPath: String, startSecs: Double, endSecs: Double) {
        val extractor = MediaExtractor()
        extractor.setDataSource(srcFd)

        val trackCount = extractor.trackCount
        var muxer: MediaMuxer? = null
        var videoTrackIndex = -1

        // Find the video track and configure the muxer
        for (i in 0 until trackCount) {
            val format = extractor.getTrackFormat(i)
            val mime = format.getString(MediaFormat.KEY_MIME)
            if (mime?.startsWith("video/") == true) {
                videoTrackIndex = i
                muxer = MediaMuxer(dstPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)
                muxer.addTrack(format)
                break
            }
        }

        if (muxer == null) {
            throw RuntimeException("Video track not found in source.")
        }

        muxer.start()

        val buffer = ByteBuffer.allocate(1024 * 1024) // 1MB buffer
        val bufferInfo = MediaCodec.BufferInfo()

        extractor.selectTrack(videoTrackIndex)
        // Seek to the start time
        extractor.seekTo((startSecs * 1_000_000).toLong(), MediaExtractor.SEEK_TO_PREVIOUS_SYNC)

        while (true) {
            val sampleSize = extractor.readSampleData(buffer, 0)
            if (sampleSize < 0) {
                break // End of stream
            }

            val presentationTimeUs = extractor.sampleTime
            if (presentationTimeUs > (endSecs * 1_000_000)) {
                break // Past the end time
            }

            bufferInfo.size = sampleSize
            bufferInfo.offset = 0
            // Adjust presentation time for the new file
            bufferInfo.presentationTimeUs = presentationTimeUs - (startSecs * 1_000_000).toLong()
            bufferInfo.flags = extractor.sampleFlags

            muxer.writeSampleData(videoTrackIndex, buffer, bufferInfo)
            extractor.advance()
        }

        // Clean up resources
        muxer.stop()
        muxer.release()
        extractor.release()
    }
}