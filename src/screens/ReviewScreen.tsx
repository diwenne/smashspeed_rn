// src/screens/ReviewScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ReviewScreenProps {
  calibrationData: any;
  onComplete: (results: any) => void;
  onCancel: () => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ calibrationData, onComplete, onCancel }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Screen</Text>
      {/* In a real app, you would have frame-by-frame review UI here */}
      <Button title="Finish & Save" onPress={() => onComplete({ speed: 100 })} />
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
});

export default ReviewScreen;
