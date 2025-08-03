// src/components/GlassPanel.tsx

import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

interface GlassPanelProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, style }) => {
  // We extract the borderRadius from the style prop so we can apply it
  // to both the main container and the separate border overlay.
  const flatStyle = StyleSheet.flatten(style);
  const borderRadius = flatStyle.borderRadius;

  return (
    <View style={[styles.container, style]}>
      {/* Blur updated to better match .ultraThinMaterial */}
      <BlurView style={styles.absolute} blurType="light" blurAmount={25} />

      {/* Gradient overlay updated to match SwiftUI version */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.absolute}
      />

      {/* The content (e.g., the icon) is rendered here */}
      {children}

      {/* ADDED: A dedicated overlay view for the border to ensure it's crisp */}
      <View style={[styles.borderOverlay, { borderRadius }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // REMOVED: Border properties are now handled by the dedicated overlay.
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  // ADDED: Style for the new border overlay. It sits on top of everything else.
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default GlassPanel;
