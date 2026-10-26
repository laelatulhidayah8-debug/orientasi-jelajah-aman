import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../context/theme";
import { konfirmasi } from "../../lib/konfirmasi";
import {
  CacheKota,
  getCacheSemua,
  getRiwayat,
  hapusCache,
} from "../../lib/storage";

export default function Riwayat() {
  const { colors } = useTheme();
  const router = useRouter();
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const [cache, setCache] = useState<Record<string, CacheKota>>({});

  const muat = useCallback(async () => {
    setRiwayat(await getRiwayat());
    setCache(await getCacheSemua());
  }, []);

  // dimuat ulang setiap tab Riwayat dibuka
  useFocusEffect(
    useCallback(() => {
      muat();
    }, [muat]),
  );

  const bukaKota = (kota: string) =>
    router.navigate({
      pathname: "/",
      params: { q: kota, t: String(Date.now()) },
    });

  const onHapus = (kota: string) =>
    konfirmasi(
      "Hapus cache?",
      `Data cache untuk "${kota}" akan dihapus dari perangkat.`,
      async () => {
        await hapusCache(kota);
        await muat();
      },
    );

  return (
    <View style={[s.wrap, { backgroundColor: colors.bg }]}>
      <Text style={[s.judul, { color: colors.text }]}>Riwayat Pencarian</Text>
      <FlatList
        data={riwayat}
        keyExtractor={(k) => k}
        ListEmptyComponent={
          <Text style={{ color: colors.muted }}>
            Belum ada riwayat pencarian.
          </Text>
        }
        renderItem={({ item }) => {
          const data = cache[item.toLowerCase()];
          return (
            <View
              style={[
                s.item,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Pressable
                style={s.kiri}
                onPress={() => bukaKota(item)}
                accessibilityLabel={`Cari ulang ${item}`}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={colors.muted}
                />
                <View>
                  <Text style={{ color: colors.text, fontSize: 16 }}>
                    {item}
                  </Text>
                  {data && (
                    <Text style={{ color: colors.muted, fontSize: 12 }}>
                      Tersimpan offline · {data.suhu}°C
                    </Text>
                  )}
                </View>
              </Pressable>
              {data && (
                <Pressable
                  onPress={() => onHapus(item)}
                  hitSlop={10}
                  accessibilityLabel={`Hapus cache ${item}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={colors.danger}
                  />
                </Pressable>
              )}
            </View>
          );
        }}
        // TODO: taruh daftar favorit lama di ListFooterComponent dengan judul "Favorit"
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  judul: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  kiri: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
});
