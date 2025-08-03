// AppIcon.tsx

import React from 'react';
import { Platform } from 'react-native';
import { SFSymbol } from 'react-native-sfsymbols'; // CHANGED: Using a named import
import VectorIcon from 'react-native-vector-icons/Feather';

interface AppIconProps {
  name: string;
  fallbackName: string;
  size: number;
  color: string;
  style?: object;
}

const AppIcon: React.FC<AppIconProps> = ({ name, fallbackName, ...props }) => {
  // On iOS, we render the high-fidelity SF Symbol.
  if (Platform.OS === 'ios') {
    return <SFSymbol name={name} {...props} />;
  }

  // On Android, we render the fallback icon from react-native-vector-icons.
  return <VectorIcon name={fallbackName} {...props} />;
};

export default AppIcon;