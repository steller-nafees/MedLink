import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ViewStyle,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { LucideIcon } from "lucide-react-native";
import { ChevronDown } from "lucide-react-native";
import { theme } from "../../theme";

interface AuthSelectProps {
  icon?: LucideIcon;
  label?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  style?: ViewStyle;
}

export function AuthSelect({
  icon: Icon,
  label,
  options,
  value,
  onChange,
  error,
  style,
}: AuthSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={style}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.selectContainer,
          { borderColor: error ? theme.colors.emergency : theme.colors.border },
        ]}
      >
        <View style={styles.selectContent}>
          {Icon && (
            <Icon
              size={16}
              color={theme.colors.mutedForeground}
              style={styles.icon}
            />
          )}
          <Text style={styles.selectText}>{value}</Text>
        </View>
        <ChevronDown size={16} color={theme.colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select option</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Done</Text>
              </Pressable>
            </View>

            <FlatList
              data={options as string[]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                  style={[
                    styles.option,
                    value === item && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.mutedForeground,
    marginBottom: 6,
    paddingHorizontal: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...theme.shadows.shadowCard,
  },
  selectContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  icon: {
    flexShrink: 0,
  },
  selectText: {
    fontSize: 14.5,
    fontWeight: "500",
    color: theme.colors.foreground,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xxxl,
    borderTopRightRadius: theme.radii.xxxl,
    marginTop: "auto",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.foreground,
  },
  closeButton: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryContainer,
  },
  optionText: {
    fontSize: 15,
    color: theme.colors.foreground,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: theme.colors.primary,
  },
  error: {
    fontSize: 12,
    color: theme.colors.emergency,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
