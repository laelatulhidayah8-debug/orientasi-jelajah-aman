import { View, Button, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import WeatherCard from "../../components/WeatherCard";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{
    kota: string;
  }>();

  function bukaFavorit() {
    if (!kota) {
      Alert.alert(
        "Peringatan",
        "Nama kota tidak ditemukan."
      );
      return;
    }

    router.push({
      pathname: "/tambah-favorit" as any,
      params: {
        id: kota,
        nama: kota,
        lat: "",
        lon: "",
      },
    });
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 16,
      }}
    >
      <WeatherCard
        kota={kota || "Tidak diketahui"}
        suhu={29}
        tingkatAQI="BAIK"
      />

      <Button
        title="Tambahkan ke Favorit"
        onPress={bukaFavorit}
      />
    </View>
  );
}
