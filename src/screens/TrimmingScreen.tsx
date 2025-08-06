// src/screens/TrimmingScreen.tsx

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  NativeModules,
  TouchableOpacity, // <-- Import TouchableOpacity
} from 'react-native';
import Video, {VideoRef, OnLoadData, OnProgressData} from 'react-native-video';
import {Slider} from '@miblanchard/react-native-slider';
import GlassPanel from '../components/GlassPanel';

// Define the interface for our new native module
interface VideoTrimmerInterface {
  trim(
    uri: string,
    startTime: number,
    endTime: number,
  ): Promise<string>; // It will return the new URI as a string
}

// Access our native module
const {VideoTrimmer} = NativeModules as {VideoTrimmer: VideoTrimmerInterface};

interface TrimmingScreenProps {
  videoUri: string;
  onComplete: (trimmedUri: string) => void;
  onCancel: () => void;
}

const TrimmingScreen: React.FC<TrimmingScreenProps> = ({
  videoUri,
  onComplete,
  onCancel,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [range, setRange] = useState([0, 0]);
  const [isSliding, setIsSliding] = useState(false);
  const [paused, setPaused] = useState(true);
  const [progress, setProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const playerRef = useRef<VideoRef>(null);

  const handleVideoLoad = (meta: OnLoadData) => {
    console.log('Video metadata loaded:', meta);
    if (meta.duration > 0) {
      setVideoDuration(meta.duration);
      setVideoLoaded(true);
    }
  };

  useEffect(() => {
    if (videoDuration > 0) {
      setRange([0, videoDuration]);
    }
  }, [videoDuration]);

  const handleVideoError = (error: any) => {
    console.error('Video Component Error:', error);
    Alert.alert(
      'Video Error',
      'An error occurred while trying to load the video. The file may be unsupported.',
      [{text: 'OK', onPress: onCancel}],
    );
  };

  const handleOnEnd = () => {
    setPaused(true);
    playerRef.current?.seek(0);
  };

  const handleRangeChange = (newRange: number[]) => {
    const [oldStartTime, oldEndTime] = range;
    const [newStartTime, newEndTime] = newRange;
    setRange(newRange);
    if (playerRef.current) {
      if (newStartTime !== oldStartTime) {
        playerRef.current.seek(newStartTime);
      } else if (newEndTime !== oldEndTime) {
        playerRef.current.seek(newEndTime);
      }
    }
  };

  const handleProgressScrub = (value: number[]) => {
    if (playerRef.current) {
      playerRef.current.seek(value[0]);
    }
  };

  const handleProgressUpdate = (data: OnProgressData) => {
    if (!isSliding) {
      setProgress(data.currentTime);
    }
  };

  const validateAndProceed = () => {
    const selectedDuration = range[1] - range[0];
    const maxDurationAllowed = 0.8;
    if (selectedDuration <= 0) {
      Alert.alert('Invalid Range', 'The end time must be after the start time.');
      return;
    }
    if (selectedDuration > maxDurationAllowed) {
      Alert.alert(
        'Clip Too Long',
        `Trim the clip to under ${maxDurationAllowed}s. The current duration is ${selectedDuration.toFixed(
          2,
        )}s.`,
        [{text: 'OK'}],
      );
    } else {
      trimVideoWithNativeModule();
    }
  };

  const trimVideoWithNativeModule = async () => {
    setIsExporting(true);
    try {
      const outputUri = await VideoTrimmer.trim(videoUri, range[0], range[1]);
      onComplete(outputUri);
    } catch (error: any) {
      console.error('An error occurred during native video trimming:', error);
      Alert.alert(
        'Export Failed',
        error.message || 'Could not trim the video. Please try again.',
      );
      onCancel();
    } finally {
      setIsExporting(false);
    }
  };

  if (isExporting) {
    return (
      <View style={styles.centered}>
        <GlassPanel style={styles.progressContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.progressText}>Trimming Video...</Text>
        </GlassPanel>
      </View>
    );
  }

  const isConfirmDisabled = !videoLoaded || range[1] <= range[0];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Trim to the Smash</Text>
        <Text style={styles.description}>
          Isolate the moment of impact. The final clip should be very short
          (~0.25 seconds).
        </Text>

        <Video
          ref={playerRef}
          source={{uri: videoUri}}
          style={styles.videoPlayer}
          onLoad={handleVideoLoad}
          onProgress={handleProgressUpdate}
          onError={handleVideoError}
          onEnd={handleOnEnd}
          resizeMode="contain"
          repeat={false}
          paused={paused}
          useTextureView={true} // FIX #1: Improves video playback stability on Android
        />

        <View style={styles.playbackControls}>
          <TouchableOpacity
            onPress={() => setPaused(!paused)}
            style={styles.playButton}>
            <Text style={styles.playButtonText}>{paused ? 'Play' : 'Pause'}</Text>
          </TouchableOpacity>
          <Slider
            containerStyle={styles.progressSlider}
            value={[progress]}
            onValueChange={handleProgressScrub}
            minimumValue={0}
            maximumValue={videoDuration || 1}
            step={0.01}
            thumbTintColor="#FFFFFF"
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
          />
        </View>

        <View style={styles.sliderContainer}>
          <Slider
            value={range}
            onValueChange={handleRangeChange}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={() => setIsSliding(false)}
            minimumValue={0}
            maximumValue={videoDuration || 1}
            step={0.01}
            thumbTintColor="#FFFFFF"
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#D1D1D6"
            containerStyle={styles.sliderControl}
          />
          <View style={styles.timeLabels}>
            <Text style={styles.timeText}>{range[0].toFixed(2)}s</Text>
            <Text style={styles.durationText}>
              Duration: {(range[1] - range[0]).toFixed(2)}s
            </Text>
            <Text style={styles.timeText}>{range[1].toFixed(2)}s</Text>
          </View>
        </View>

        {/* FIX #2: Replaced Button with styled TouchableOpacity for reliability */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onCancel} style={styles.button}>
            <Text style={styles.buttonTextCancel}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={validateAndProceed}
            style={[
              styles.button,
              styles.confirmButton,
              isConfirmDisabled && styles.disabledButton,
            ]}
            disabled={isConfirmDisabled}>
            <Text style={styles.buttonTextConfirm}>Confirm Trim</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  progressContainer: {
    padding: 40,
    borderRadius: 35,
    alignItems: 'center',
  },
  progressText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  videoPlayer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: 'black',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  playButton: {
    padding: 10,
  },
  playButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSlider: {
    flex: 1,
    marginLeft: 10,
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  sliderControl: {
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  durationText: {
    fontSize: 12,
    color: '#3C3C43',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 'auto',
    paddingVertical: 10,
  },
  // New styles for TouchableOpacity buttons
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  buttonTextCancel: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonTextConfirm: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default TrimmingScreen;