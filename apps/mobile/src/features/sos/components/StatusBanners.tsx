import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { RefreshCw, WifiOff, CloudOff, PhoneCall } from 'lucide-react-native';
import { theme } from '../../../theme';
import { formatSyncTime } from '../utils/offline-sync';

interface SyncStatusBannerProps {
  syncedAt?: string;
  justSynced?: boolean;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  syncedAt,
  justSynced,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: `${theme.colors.success}40`,
        backgroundColor: `${theme.colors.success}14`,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: `${theme.colors.success}26`,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <RefreshCw
          size={14}
          color={theme.colors.success}
          strokeWidth={2.5}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.colors.success,
            marginBottom: 2,
          }}
        >
          {justSynced ? 'Emergency resources updated' : 'Emergency resources synced'}
        </Text>
        <Text style={{ fontSize: 11, color: theme.colors.mutedForeground }}>
          Last sync: {syncedAt ? formatSyncTime(syncedAt) : 'Just now'}
        </Text>
      </View>
    </View>
  );
};

interface OfflineBannerProps {
  syncedAt?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ syncedAt }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: `${theme.colors.warning}4D`,
        backgroundColor: `${theme.colors.warning}1A`,
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: `${theme.colors.warning}33`,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <WifiOff size={14} color={theme.colors.warning} strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: theme.colors.warning,
            marginBottom: 2,
          }}
        >
          Offline emergency mode
        </Text>
        <Text style={{ fontSize: 11, color: theme.colors.mutedForeground }}>
          Using previously synchronized emergency resources
          {syncedAt ? ` · ${formatSyncTime(syncedAt)}` : ''}.
        </Text>
      </View>
    </View>
  );
};

export const OfflineNotice: React.FC<{ className?: string }> = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <CloudOff size={14} color={theme.colors.mutedForeground} />
      <Text style={{ fontSize: 11, color: theme.colors.mutedForeground }}>
        Internet connection required for live emergency services.
      </Text>
    </View>
  );
};

export const UnverifiedNotice: React.FC = () => {
  return (
    <Text
      style={{
        fontSize: 11,
        fontStyle: 'italic',
        color: theme.colors.mutedForeground,
      }}
    >
      Availability cannot be verified in real time.
    </Text>
  );
};

interface CallButtonProps {
  label: string;
  phone: string;
  tone?: 'primary' | 'emergency';
  style?: any;
}

export const CallButton: React.FC<CallButtonProps> = ({
  label,
  phone,
  tone = 'primary',
  style,
}) => {
  const handleCall = () => {
    Linking.openURL(`tel:${phone}`);
  };

  const isPrimary = tone === 'primary';

  return (
    <TouchableOpacity
      onPress={handleCall}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: isPrimary ? 'transparent' : theme.colors.emergency,
          borderWidth: isPrimary ? 1 : 0,
          borderColor: `${theme.colors.primary}4D`,
          ...theme.shadows.shadowFloat,
        },
        style,
      ]}
      activeOpacity={0.8}
    >
      <PhoneCall
        size={16}
        color={isPrimary ? theme.colors.primary : theme.colors.emergencyForeground}
        strokeWidth={2.4}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: 'bold',
          color: isPrimary ? theme.colors.primary : theme.colors.emergencyForeground,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};
