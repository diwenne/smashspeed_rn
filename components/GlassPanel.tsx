import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

// Define the component's props, allowing children and custom styles
interface GlassPanelProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, style }) => {
  return (
    // The main container handles shape, border, shadow, and custom layout styles.
    // `overflow: 'hidden'` is crucial for the inner layers to respect the border radius.
    <View style={[styles.container, style]}>
      {/* BlurView provides the frosted glass effect. It's positioned absolutely to fill the container. */}
      <BlurView
        style={styles.absolute}
        blurType="dark" // Options: "light", "dark", "xlight", "regular", "prominent"
        blurAmount={10} // Controls the intensity of the blur
      />

      {/* LinearGradient overlays the blur, also positioned absolutely. */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.15)',
          'rgba(255, 255, 255, 0.05)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }} // Top-left
        end={{ x: 1, y: 1 }}   // Bottom-right
        style={styles.absolute}
      />

      {/* The content (children) is rendered on top of the background layers */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 35,
    overflow: 'hidden', // Clips the children, blur, and gradient to the rounded shape
    // --- Style Translations from SwiftUI ---
    // .stroke(.white.opacity(0.2), lineWidth: 1)
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // .shadow(color: .black.opacity(0.1), radius: 20, y: 10)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24, // For Android shadow
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default GlassPanel;