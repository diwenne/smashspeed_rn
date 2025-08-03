// src/screens/TrimmingView.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface TrimmingViewProps {
  videoUri: string;
  onComplete: (trimmedUri: string) => void;
  onCancel: () => void;
}

const TrimmingView: React.FC<TrimmingViewProps> = ({ videoUri, onComplete, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trimming View</Text>
      <Text style={styles.uriText}>Video URI: {videoUri}</Text>
      {/* In a real app, you would have video trimming UI here */}
      <Button title="Confirm Trim" onPress={() => onComplete(videoUri)} />
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

export default TrimmingView;
