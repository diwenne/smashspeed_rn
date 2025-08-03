// src/screens/DetectScreen.tsx

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ImageBackground, // Using ImageBackground for the aurora effect
  Platform, // ADDED: To detect the operating system
  StatusBar, // ADDED: To get the height of the Android status bar
} from 'react-native';
import AppIcon from '../components/AppIcon';
import GlassPanel from '../components/GlassPanel';

const DetectScreen: React.FC = () => {
  const [showInputSelector, setShowInputSelector] = useState(false);
  const [showRecordingGuide, setShowRecordingGuide] = useState(false);

  return (
    // Using ImageBackground with the correct path to the asset in the root assets folder
    <ImageBackground
      style={styles.container}
      source={require('../../assets/aurora_background.png')}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Using the correct path for the header asset */}
            <Image
              source={require('../../assets/AppLabel.png')}
              style={styles.headerImage}
            />
            <Text style={styles.title}>Detect</Text>
          </View>
          <TouchableOpacity>
            {/* Icon size decreased */}
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
          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => setShowRecordingGuide(true)}>
            <AppIcon name="questionmark.circle" fallbackName="help-circle" size={16} color="#007AFF" />
            <Text style={styles.guideButtonText}>How to Record</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Fallback color in case image fails to load
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 25,
    // CHANGED: Added platform-specific top margin to avoid the Android status bar
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
  },
  headerLeft: {
    alignItems: 'flex-start',
  },
  // Logo size increased
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
});

export default DetectScreen;
