// src/screens/DetectScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import AppIcon from '../components/AppIcon';
import GlassPanel from '../components/GlassPanel';

// Import the placeholder screens
import TrimmingScreen from './TrimmingScreen';
import CalibrationScreen from './CalibrationScreen';
import ReviewScreen from './ReviewScreen';
import ResultsScreen from './ResultsScreen';

// Define the different states of the application flow
type AppState = 'IDLE' | 'TRIMMING' | 'CALIBRATING' | 'REVIEWING' | 'RESULTS';

const DetectScreen: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [calibrationData, setCalibrationData] = useState<any>(null);
  const [reviewResults, setReviewResults] = useState<any>(null);

  const [showInputSelector, setShowInputSelector] = useState(false);

  const handleResponse = (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled video picker');
    } else if (response.errorCode) {
      Alert.alert('Error', response.errorMessage);
    } else if (response.assets && response.assets[0].uri) {
      setVideoUri(response.assets[0].uri);
      setAppState('TRIMMING');
    }
    setShowInputSelector(false);
  };

  const handleRecordVideo = () => {
    launchCamera({ mediaType: 'video' }, handleResponse);
  };

  const handleChooseVideo = () => {
    launchImageLibrary({ mediaType: 'video' }, handleResponse);
  };

  const resetFlow = () => {
    setAppState('IDLE');
    setVideoUri(null);
    setCalibrationData(null);
    setReviewResults(null);
  };

  // This function renders the main UI for the IDLE state
  const renderIdleView = () => (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/aurora_background.png')}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/AppLabel.png')}
              style={styles.headerImage}
            />
            <Text style={styles.title}>Detect</Text>
          </View>
          <TouchableOpacity>
            <AppIcon name="info.circle" fallbackName="info" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TouchableOpacity onPress={() => setShowInputSelector(true)}>
            <GlassPanel style={styles.mainButton}>
              <AppIcon
                name="arrow.up.circle.fill"
                fallbackName="arrow-up"
                size={70}
                color="rgba(255,255,255,0.8)"
                style={styles.mainButtonIcon}
              />
            </GlassPanel>
          </TouchableOpacity>
          <Text style={styles.promptText}>Select a video to begin</Text>
          <TouchableOpacity style={styles.guideButton}>
            <AppIcon name="questionmark.circle" fallbackName="help-circle" size={16} color="#007AFF" />
            <Text style={styles.guideButtonText}>How to Record</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showInputSelector}
        onRequestClose={() => setShowInputSelector(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Analyze a Smash</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleRecordVideo}>
              <Text style={styles.modalButtonText}>Record New Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleChooseVideo}>
              <Text style={styles.modalButtonText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowInputSelector(false)}>
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );

  // This switch statement controls which view is currently displayed
  switch (appState) {
    case 'TRIMMING':
      return <TrimmingScreen videoUri={videoUri!} onComplete={(trimmedUri) => { setVideoUri(trimmedUri); setAppState('CALIBRATING'); }} onCancel={resetFlow} />;
    case 'CALIBRATING':
      return <CalibrationScreen videoUri={videoUri!} onComplete={(data) => { setCalibrationData(data); setAppState('REVIEWING'); }} onCancel={resetFlow} />;
    case 'REVIEWING':
      return <ReviewScreen calibrationData={calibrationData} onComplete={(results) => { setReviewResults(results); setAppState('RESULTS'); }} onCancel={resetFlow} />;
    case 'RESULTS':
      return <ResultsScreen results={reviewResults} onReset={resetFlow} />;
    case 'IDLE':
    default:
      return renderIdleView();
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  headerImage: {
    width: 150,
    height: 35,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  mainButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainButtonIcon: {
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  promptText: {
    marginTop: 20,
    fontSize: 17,
    fontWeight: '600',
    color: 'gray',
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 20,
  },
  guideButtonText: {
    color: '#007AFF',
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E5E5EA',
  },
  cancelButtonText: {
    color: '#007AFF',
  },
});

export default DetectScreen;
