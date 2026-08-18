import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../../theme';

interface SectionTitleProps {
  title: string;
  hint?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, hint }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          fontSize: 13.5,
          fontWeight: 'bold',
          color: theme.colors.foreground,
        }}
      >
        {title}
      </Text>
      {hint && (
        <Text
          style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: theme.colors.mutedForeground,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};
