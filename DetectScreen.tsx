import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

// NOTE: The placeholder modals from the previous step would go here.

const DetectScreen: React.FC = () => {
  const [showInputSelector, setShowInputSelector] = useState(false);
  const [showRecordingGuide, setShowRecordingGuide] = useState(false);

  return (
    // Use LinearGradient as the main background container
    <LinearGradient
      colors={['#EAF6FF', '#D3E9F8', '#CADDFA']}
      style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* --- Custom Header --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="zap" size={20} color="#007AFF" />
            <Text style={styles.appName}>Smashspeed</Text>
          </View>
          <TouchableOpacity>
            <Icon name="info" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Detect</Text>

        {/* --- Main Centered Content --- */}
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={() => setShowInputSelector(true)}>
            <Icon name="arrow-up" size={50} color="rgba(0,0,0,0.5)" />
          </TouchableOpacity>

          <Text style={styles.promptText}>Select a video to begin</Text>

          <TouchableOpacity
            style={styles.guideButton}
            onPress={() => setShowRecordingGuide(true)}>
            <Icon name="help-circle" size={16} color="#007AFF" />
            <Text style={styles.guideButtonText}>How to Record</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      {/* Your Modals for input selection and the guide would be here */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 4,
  },
  // Main content styles
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60, // Offset to balance the header's height
  },
  mainButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Lighter, translucent button
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  promptText: {
    marginTop: 24,
    fontSize: 17,
    color: '#3C3C43', // Darker text color
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#E9E9EB', // Pill background color
    borderRadius: 20,
  },
  guideButtonText: {
    color: '#007AFF', // Blue text color
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DetectScreen;