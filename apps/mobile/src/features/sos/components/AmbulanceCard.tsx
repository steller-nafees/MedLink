import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { Truck, Phone, Check, Clock, X } from 'lucide-react-native';
import { theme } from '../../../theme';
import type { Ambulance } from '../utils/data';

interface RegPlateProps {
  reg: string;
  tone?: 'default' | 'live';
}

const RegPlate: React.FC<RegPlateProps> = ({ reg, tone = 'default' }) => {
  const isLive = tone === 'live';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: isLive ? `${theme.colors.success}59` : theme.colors.border,
        backgroundColor: isLive ? `${theme.colors.success}0D` : theme.colors.surfaceVariant,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Truck
        size={16}
        color={isLive ? theme.colors.success : theme.colors.foreground}
        strokeWidth={2.3}
        style={{ opacity: isLive ? 1 : 0.7 }}
      />
      <Text
        style={{
          fontSize: 14.5,
          fontWeight: 'extrabold',
          color: isLive ? theme.colors.success : theme.colors.foreground,
          letterSpacing: 0.02,
          textTransform: 'uppercase',
        }}
        numberOfLines={1}
      >
        {reg}
      </Text>
    </View>
  );
};

interface AmbulanceCardProps {
  ambulance: Ambulance;
  booked?: boolean;
  onRequest?: () => void;
  onCancel?: () => void;
}

export const AmbulanceCard: React.FC<AmbulanceCardProps> = ({
  ambulance: a,
  booked = false,
  onRequest,
  onCancel,
}) => {
  const typeLabel: Record<string, string> = {
    ALS: 'ALS Ambulance',
    BLS: 'Basic Life Support',
    'Critical Care': 'Critical Care',
  };

  const statusChip: Record<string, { label: string; color: string; bgColor: string }> = {
    available: {
      label: 'Available',
      color: theme.colors.success,
      bgColor: `${theme.colors.success}1A`,
    },
    en_route: {
      label: 'En route',
      color: theme.colors.warning,
      bgColor: `${theme.colors.warning}1A`,
    },
    on_scene: { label: 'On scene', color: theme.colors.info, bgColor: `${theme.colors.info}1A` },
    returning: {
      label: 'Returning',
      color: theme.colors.mutedForeground,
      bgColor: theme.colors.surfaceVariant,
    },
  };

  const status = statusChip[a.status];

  if (booked) {
    return (
      <View
        style={{
          borderRadius: theme.radii.xxxl,
          borderWidth: 1,
          borderColor: `${theme.colors.success}59`,
          backgroundColor: theme.colors.card,
          padding: 16,
          ...theme.shadows.shadowCard,
        }}
      >
        {/* Status badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderRadius: 999,
              backgroundColor: `${theme.colors.success}1A`,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.success,
              }}
            />
            <Text style={{ fontSize: 10.5, fontWeight: 'bold', color: theme.colors.success }}>
              ON THE WAY
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={14} color={theme.colors.emergency} />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: 'bold',
                color: theme.colors.emergency,
              }}
            >
              ETA {a.etaMin} min
            </Text>
          </View>
        </View>

        {/* Registration plate */}
        <View style={{ marginBottom: 10 }}>
          <RegPlate reg={a.reg} tone="live" />
        </View>

        {/* Details */}
        <View style={{ marginBottom: 12, gap: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: `${theme.colors.border}99`,
            }}
          >
            <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>Driver / EMT</Text>
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
              {a.driver}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: `${theme.colors.border}99`,
            }}
          >
            <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>Contact</Text>
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
              {a.phone}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12.5, color: theme.colors.mutedForeground }}>Vehicle</Text>
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.foreground }}>
              {typeLabel[a.type]}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${a.phone}`)}
            style={{
              flex: 1.3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 999,
              backgroundColor: theme.colors.primary,
              minHeight: 44,
              ...theme.shadows.shadowFloat,
            }}
            activeOpacity={0.8}
          >
            <Phone size={16} color={theme.colors.primaryForeground} strokeWidth={2.4} />
            <Text
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: theme.colors.primaryForeground,
              }}
            >
              Call Driver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: `${theme.colors.emergency}4D`,
              backgroundColor: theme.colors.card,
              minHeight: 44,
            }}
            activeOpacity={0.7}
          >
            <X size={16} color={theme.colors.emergency} strokeWidth={2.5} />
            <Text style={{ fontSize: 12.5, fontWeight: 'bold', color: theme.colors.emergency }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Unbooked ambulance card
  return (
    <View
      style={{
        borderRadius: theme.radii.xxl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.card,
        padding: 14,
        ...theme.shadows.shadowCard,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View>
          <Text style={{ fontSize: 13.5, fontWeight: 'bold', marginBottom: 2, color: theme.colors.foreground }}>
            {a.callSign} · {a.provider}
          </Text>
          <Text style={{ fontSize: 11.5, color: theme.colors.mutedForeground }}>
            {a.distanceKm} km away · ETA {a.etaMin} min
          </Text>
        </View>
        <View
          style={{
            borderRadius: 999,
            backgroundColor: status.bgColor,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: status.color }}>
            {status.label}
          </Text>
        </View>
      </View>

      <View style={{ marginBottom: 10 }}>
        <RegPlate reg={a.reg} tone="default" />
      </View>

      <TouchableOpacity
        onPress={onRequest}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderRadius: 999,
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          ...theme.shadows.shadowFloat,
        }}
        activeOpacity={0.8}
      >
        <Check size={16} color={theme.colors.primaryForeground} strokeWidth={2} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: theme.colors.primaryForeground,
          }}
        >
          Request this ambulance
        </Text>
      </TouchableOpacity>
    </View>
  );
};
