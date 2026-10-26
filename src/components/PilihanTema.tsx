import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme, type Mode } from "../context/theme";

const OPSI: {
  key: Mode;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  {
    key: "terang",
    label: "Terang",
    icon: "sunny-outline",
  },
  {
    key: "gelap",
    label: "Gelap",
    icon: "moon-outline",
  },
  {
    key: "sistem",
    label: "Ikuti Sistem",
    icon: "phone-portrait-outline",
  },
];

export default function PilihanTema() {
  const { mode, setMode, colors } = useTheme();

  return (
    <View>
      <Text style={[styles.judul, { color: colors.text }]}>
        Tampilan Aplikasi
      </Text>

      {OPSI.map((opsi) => {
        const aktif = mode === opsi.key;

        return (
          <Pressable
            key={opsi.key}
            onPress={() => setMode(opsi.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: aktif }}
            style={[
              styles.item,
              {
                backgroundColor: colors.card,
                borderColor: aktif ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={opsi.icon}
              size={22}
              color={aktif ? colors.primary : colors.muted}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              {opsi.label}
            </Text>

            {aktif && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.primary}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  judul: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
});
