import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typeScale } from "../../constants/styles";
import { useTheme } from "../../context/theme";

export default function Tentang() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.kartu,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          accessibilityLabel="Judul halaman Tentang"
          style={[
            styles.judul,
            {
              color: colors.text,
              fontSize: typeScale.judul,
            },
          ]}
        >
          Tentang Jelajah Aman
        </Text>

        <Text
          style={[
            styles.isi,
            {
              color: colors.text,
              fontSize: typeScale.isi,
            },
          ]}
        >
          Nama Aplikasi: Jelajah Aman
        </Text>

        <Text
          style={[
            styles.isi,
            {
              color: colors.text,
              fontSize: typeScale.isi,
            },
          ]}
        >
          Versi: 1.0.0
        </Text>

        <Text
          style={[
            styles.isi,
            {
              color: colors.text,
              fontSize: typeScale.isi,
            },
          ]}
        >
          Pembuat: Laelatul Hidayah
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kartu: {
    margin: spacing.besar,
    padding: spacing.besar,
    borderWidth: 1,
    borderRadius: 12,
  },
  judul: {
    fontWeight: "bold",
    marginBottom: spacing.sedang,
  },
  isi: {
    marginTop: spacing.kecil,
  },
});
