// android/app/src/main/java/com/smashspeed/VideoTrimmerModule.kt

package com.smashspeed

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

    override fun getName() = "VideoTrimmer"

    @ReactMethod
    fun trim(uriString: String, startTime: Double, endTime: Double, promise: Promise) {
        val context = reactApplicationContext
        
        try {
            val inputFileDescriptor = context.contentResolver.openFileDescriptor(Uri.parse(uriString), "r")
            if (inputFileDescriptor == null) {
                promise.reject("E_FILE_NOT_FOUND", "Could not open file descriptor for URI: $uriString")
                return
            }
            val outputFile = File(context.cacheDir, "trimmed-${System.currentTimeMillis()}.mp4")

            // Perform the trimming operation with the new robust function
            genVideoUsingMuxer(inputFileDescriptor.fileDescriptor, outputFile.absolutePath, startTime, endTime)
            
            inputFileDescriptor.close()
            promise.resolve(Uri.fromFile(outputFile).toString())

        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("E_TRIM_FAILED", "Video trimming failed with error: ${e.message}", e)
        }
    }

    /**
     * A more robust video trimming function that handles both video and audio tracks.
     * It ensures a video track exists before proceeding and correctly copies samples
     * for all tracks within the specified time range.
     */
    private fun genVideoUsingMuxer(srcFd: java.io.FileDescriptor, dstPath: String, startSecs: Double, endSecs: Double) {
        val extractor = MediaExtractor()
        extractor.setDataSource(srcFd)
        
        val muxer = MediaMuxer(dstPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

        val trackIndexMap = mutableMapOf<Int, Int>()
        var videoTrackFound = false

        // 1. Find all video and audio tracks and add them to the muxer
        for (i in 0 until extractor.trackCount) {
            val format = extractor.getTrackFormat(i)
            val mime = format.getString(MediaFormat.KEY_MIME)
            if (mime?.startsWith("video/") == true) {
                val newTrackIndex = muxer.addTrack(format)
                trackIndexMap[i] = newTrackIndex
                videoTrackFound = true
            } else if (mime?.startsWith("audio/") == true) {
                val newTrackIndex = muxer.addTrack(format)
                trackIndexMap[i] = newTrackIndex
            }
        }

        // 2. If no video track was found, throw a clear error
        if (!videoTrackFound) {
            muxer.release()
            extractor.release()
            throw IllegalArgumentException("No video track found in source file.")
        }

        muxer.start()

        val buffer = ByteBuffer.allocate(1024 * 1024) // 1MB buffer
        val bufferInfo = MediaCodec.BufferInfo()
        val startTimeUs = (startSecs * 1_000_000).toLong()
        val endTimeUs = (endSecs * 1_000_000).toLong()

        // 3. Process each track (both video and audio)
        trackIndexMap.forEach { (sourceTrackIndex, destTrackIndex) ->
            extractor.selectTrack(sourceTrackIndex)
            // Seek to the start time for the current track
            extractor.seekTo(startTimeUs, MediaExtractor.SEEK_TO_PREVIOUS_SYNC)

            while (true) {
                val sampleSize = extractor.readSampleData(buffer, 0)
                if (sampleSize < 0) break // End of stream

                val presentationTimeUs = extractor.sampleTime
                if (presentationTimeUs < startTimeUs) {
                    extractor.advance() // Skip samples before the start time
                    continue
                }
                if (presentationTimeUs > endTimeUs) break // Stop when past the end time

                // Write the sample to the new file
                bufferInfo.size = sampleSize
                bufferInfo.offset = 0
                bufferInfo.presentationTimeUs = presentationTimeUs - startTimeUs // Adjust timestamp
                bufferInfo.flags = extractor.sampleFlags

                muxer.writeSampleData(destTrackIndex, buffer, bufferInfo)
                extractor.advance()
            }
            extractor.unselectTrack(sourceTrackIndex)
        }

        // 4. Clean up all resources
        muxer.stop()
        muxer.release()
        extractor.release()
    }
}
