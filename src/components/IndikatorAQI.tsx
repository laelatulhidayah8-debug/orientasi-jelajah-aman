import { Text, View } from "react-native";
import { LaporanUdara } from "../../types/cuaca";

interface IndikatorAQIProps {
  laporan: LaporanUdara;
}

export default function IndikatorAQI({ laporan }: IndikatorAQIProps) {
  const warnaAQI =
    laporan.tingkat === "BAIK"
      ? "green"
      : laporan.tingkat === "SEDANG"
        ? "orange"
        : laporan.tingkat === "TIDAK_SEHAT"
          ? "red"
          : "purple";

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{laporan.kota}</Text>

      <Text style={{ fontSize: 16 }}>Indeks AQI: {laporan.indeksAQI}</Text>

      <Text style={{ color: warnaAQI, fontWeight: "bold" }}>
        Kualitas Udara: {laporan.tingkat}
      </Text>

      {laporan.diperbaruiPada && (
        <Text>Diperbarui: {laporan.diperbaruiPada}</Text>
      )}
    </View>
  );
}
