import { useState } from "react";
import { View, Text, Button, Alert, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { tambahFavorit } from "../services/favoritStorage";

export default function ModalTambahFavorit() {
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id?: string;
    nama?: string;
    lat?: string;
    lon?: string;
  }>();

  const [menyimpan, setMenyimpan] = useState(false);

  async function simpan() {
    const idAngka = Number(id);
    const latitude = Number(lat);
    const longitude = Number(lon);

    if (
      !id ||
      !nama ||
      !lat ||
      !lon ||
      !Number.isFinite(idAngka) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      const pesan = "Data kota tidak lengkap atau tidak valid.";

      if (Platform.OS === "web") {
        window.alert(pesan);
      } else {
        Alert.alert("Data tidak valid", pesan);
      }

      return;
    }

    try {
      setMenyimpan(true);

      await tambahFavorit({
        id: idAngka,
        nama: String(nama),
        latitude,
        longitude,
      });

      router.back();
    } catch (error) {
      console.error("Gagal menyimpan favorit:", error);

      const pesan = "Kota gagal disimpan ke daftar favorit.";

      if (Platform.OS === "web") {
        window.alert(pesan);
      } else {
        Alert.alert("Gagal", pesan);
      }
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        Tambah Favorit
      </Text>

      <Text>
        Tambahkan {nama ? String(nama) : "kota ini"} ke daftar favorit?
      </Text>

      <Button
        title={menyimpan ? "Menyimpan..." : "Simpan"}
        onPress={simpan}
        disabled={menyimpan}
      />

      <Button
        title="Batal"
        onPress={() => router.back()}
        disabled={menyimpan}
      />
    </View>
  );
}
