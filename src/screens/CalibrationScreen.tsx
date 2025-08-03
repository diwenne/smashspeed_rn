// src/screens/CalibrationScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface CalibrationScreenProps {
  videoUri: string;
  onComplete: (calibrationData: any) => void;
  onCancel: () => void;
}

const CalibrationScreen: React.FC<CalibrationScreenProps> = ({ videoUri, onComplete, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calibration Screen</Text>
      <Text style={styles.uriText}>Video URI: {videoUri}</Text>
      {/* In a real app, you would have video calibration UI here */}
      <Button title="Start Analysis" onPress={() => onComplete({ scaleFactor: 1.0 })} />
      <Button title="Cancel" onPress={onCancel} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  uriText: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});

export default CalibrationScreen;
