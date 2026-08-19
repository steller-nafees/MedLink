import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Phone, Send, Check, MapPin } from 'lucide-react-native';
import { theme } from '../../../theme';
import type { RankedDonor } from '../utils/blood';

interface BloodDropProps {
  group: string;
  size?: 'sm' | 'md';
  tone?: 'emergency' | 'muted';
}

export const BloodDrop: React.FC<BloodDropProps> = ({ group, size = 'md', tone = 'emergency' }) => {
  const isSm = size === 'sm';
  const isEmergency = tone === 'emergency';

  return (
    <View
      style={{
        width: isSm ? 36 : 44,
        height: isSm ? 36 : 44,
        borderRadius: theme.radii.md,
        backgroundColor: isEmergency ? `${theme.colors.emergency}1A` : theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: isSm ? 12 : 13,
          fontWeight: '800',
          color: isEmergency ? theme.colors.emergency : theme.colors.foreground,
          opacity: isEmergency ? 1 : 0.7,
        }}
      >
        {group}
      </Text>
    </View>
  );
};

interface EligibilityPillProps {
  eligible: boolean;
  daysLeft: number;
}

export const EligibilityPill: React.FC<EligibilityPillProps> = ({ eligible, daysLeft }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: eligible ? `${theme.colors.success}1A` : `${theme.colors.warning}1A`,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: eligible ? theme.colors.success : theme.colors.warning,
        }}
      />
      <Text
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          color: eligible ? theme.colors.success : theme.colors.warning,
        }}
      >
        {eligible ? 'Eligible to donate' : `Available in ${daysLeft} days`}
      </Text>
    </View>
  );
};

interface DonorCardProps {
  donor: RankedDonor;
  onCall?: () => void;
  onRequest?: () => void;
  requested?: boolean;
}

export const DonorCard: React.FC<DonorCardProps> = ({
  donor,
  onCall,
  onRequest,
  requested = false,
}) => {
  const handleCall = () => {
    Linking.openURL(`tel:${donor.phone}`);
    onCall?.();
  };

  const handleRequest = () => {
    onRequest?.();
  };

  return (
    <View
      style={{
        borderRadius: theme.radii.xxl,
        borderWidth: 1,
        borderColor: `${theme.colors.border}99`,
        backgroundColor: theme.colors.card,
        padding: 14,
        ...theme.shadows.shadowCard,
      }}
    >
      {/* Header with blood drop and info */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <BloodDrop group={donor.group} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14.5,
              fontWeight: 'bold',
              marginBottom: 6,
              color: theme.colors.foreground,
            }}
            numberOfLines={1}
          >
            {donor.name}
          </Text>
          <View style={{ gap: 6, marginBottom: 6 }}>
            <EligibilityPill eligible={donor.eligibility.eligible} daysLeft={donor.eligibility.daysLeft} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                backgroundColor:
                  donor.status === 'online' ? `${theme.colors.success}1A` : theme.colors.surfaceVariant,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: donor.status === 'online' ? theme.colors.success : theme.colors.muted,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 'bold',
                  color:
                    donor.status === 'online' ? theme.colors.success : theme.colors.mutedForeground,
                }}
              >
                {donor.status === 'online' ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: theme.colors.surfaceVariant,
              marginBottom: 6,
            }}
          >
            <MapPin size={12} color={theme.colors.mutedForeground} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: theme.colors.mutedForeground }}>
              {donor.distanceKm} km from hospital
            </Text>
          </View>
          <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>
            {donor.donations} previous donations
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          onPress={handleCall}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: 10,
          }}
          activeOpacity={0.7}
        >
          <Phone size={14} color={theme.colors.foreground} strokeWidth={2} />
          <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRequest}
          disabled={requested}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            borderRadius: 999,
            backgroundColor: requested ? theme.colors.success : theme.colors.emergency,
            paddingVertical: 10,
            opacity: requested ? 1 : 0.9,
            ...theme.shadows.shadowCard,
          }}
          activeOpacity={0.8}
        >
          {requested ? (
            <>
              <Check size={14} color={theme.colors.white} strokeWidth={2.5} />
              <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.white }}>
                Request sent
              </Text>
            </>
          ) : (
            <>
              <Send size={14} color={theme.colors.white} strokeWidth={2} />
              <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.white }}>
                {donor.status === 'online' ? 'Send request' : 'Notify donor'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
