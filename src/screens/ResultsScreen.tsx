// src/screens/ResultsScreen.tsx

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface ResultsScreenProps {
  results: any;
  onReset: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, onReset }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results Screen</Text>
      <Text style={styles.resultsText}>Speed: {results.speed} km/h</Text>
      <Button title="Analyze Another" onPress={onReset} />
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
  resultsText: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default ResultsScreen;
