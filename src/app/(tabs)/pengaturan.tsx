// app/(tabs)/pengaturan.tsx
import { useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PilihanTema from "../../components/PilihanTema";
import { useTheme } from "../../context/theme";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const { colors } = useTheme();

  async function hapusDataTersimpan() {
    const lanjut = async () => {
      try {
        await hapusSemuaCache();
        setPesan("Data cuaca tersimpan sudah dihapus.");
      } catch {
        setPesan("Gagal menghapus data cuaca.");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Hapus semua data cuaca tersimpan?")) {
        await lanjut();
      }
      return;
    }

    Alert.alert(
      "Hapus Data Cuaca",
      "Yakin ingin menghapus semua data cuaca tersimpan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            void lanjut();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
        backgroundColor: colors.bg,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: colors.text,
        }}
      >
        Pengaturan
      </Text>

      {/* Komponen Pilihan Tema */}
      <PilihanTema />

      {/* Bagian Hapus Cache / Data Tersimpan */}
      <View
        style={{
          padding: 16,
          gap: 12,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          backgroundColor: colors.card,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
          }}
        >
          Data Tersimpan
        </Text>

        <Text style={{ color: colors.muted }}>
          Hapus cache cuaca yang tersimpan di aplikasi.
        </Text>

        <Button
          title="Hapus Data Cuaca Tersimpan"
          onPress={hapusDataTersimpan}
          color={colors.danger}
        />

        {pesan && (
          <Text accessibilityLabel={pesan} style={{ color: colors.text }}>
            {pesan}
          </Text>
        )}
      </View>

      {/* Informasi Versi Aplikasi */}
      <View style={{ gap: 4 }}>
        <Text style={{ color: colors.text, fontWeight: "bold" }}>
          Jelajah Aman
        </Text>
        <Text style={{ color: colors.muted }}>Versi 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}
