// src/screens/TrimmingScreen.tsx

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import Video, {VideoRef, OnProgressData} from 'react-native-video';
import {Slider} from '@miblanchard/react-native-slider';
import GlassPanel from '../components/GlassPanel';
// Note: For icons, you might need to install react-native-vector-icons
// import Icon from 'react-native-vector-icons/Ionicons';

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
  const [isSliding, setIsSliding] = useState(false); // State to track trim slider interaction
  const [paused, setPaused] = useState(true); // State for play/pause
  const [progress, setProgress] = useState(0); // State for video progress
  const playerRef = useRef<VideoRef>(null);

  useEffect(() => {
    if (videoDuration > 0) {
      setRange([0, videoDuration]);
    }
  }, [videoDuration]);

  const handleVideoLoad = (meta: any) => {
    setVideoDuration(meta.duration);
  };

  // Handles scrubbing the trim range slider
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

  // Handles scrubbing the main progress slider
  const handleProgressScrub = (value: number[]) => {
    if (playerRef.current) {
      playerRef.current.seek(value[0]);
    }
  };

  // Updates the progress bar as the video plays
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
      const outputUri = await VideoTrimmer.trim(
        videoUri,
        range[0],
        range[1],
      );
      console.log('Native trim completed successfully:', outputUri);
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
          resizeMode="contain"
          repeat={false}
          paused={paused}
        />

        {/* Playback Controls */}
        <View style={styles.playbackControls}>
          <TouchableOpacity onPress={() => setPaused(!paused)} style={styles.playButton}>
            <Text style={styles.playButtonText}>{paused ? 'Play' : 'Pause'}</Text>
          </TouchableOpacity>
          <Slider
            containerStyle={styles.progressSlider}
            value={[progress]}
            onValueChange={handleProgressScrub}
            minimumValue={0}
            maximumValue={videoDuration}
            step={0.01}
            thumbTintColor="#FFFFFF"
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
          />
        </View>

        {/* Trimming Controls */}
        <View style={styles.sliderContainer}>
          <Slider
            value={range}
            onValueChange={handleRangeChange}
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={() => setIsSliding(false)}
            minimumValue={0}
            maximumValue={videoDuration}
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

        <View style={styles.buttonContainer}>
          <Button title="Cancel" onPress={onCancel} color="#007AFF" />
          <Button
            title="Confirm Trim"
            onPress={validateAndProceed}
            disabled={videoDuration === 0 || range[1] <= range[0]}
          />
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
});

export default TrimmingScreen;
