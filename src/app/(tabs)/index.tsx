import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";

import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import type { HasilGeocoding } from "../../types/geocoding";
import type {
  HasilCuacaOffline,
  RingkasanKotaTersimpan,
} from "../../types/cache";
import { tambahRiwayat } from "../../lib/storage";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] =
    useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] =
    useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const params = useLocalSearchParams<{
    q?: string | string[];
    t?: string | string[];
  }>();

  const namaDariRute = Array.isArray(params.q)
    ? params.q[0]
    : params.q;

  const pemicuRute = Array.isArray(params.t)
    ? params.t[0]
    : params.t;

  const teksTertunda = useDebounce(teksCari, 500);

  const requestIdRef = useRef(0);
  const pencarianIdRef = useRef(0);
  const ruteDiprosesRef = useRef("");

  async function muatKotaTersimpan() {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch (error) {
      console.warn("Gagal memuat cache kota:", error);
    }
  }

  useEffect(() => {
    void bersihkanCacheLama(BATAS_CACHE_MS)
      .then(() => muatKotaTersimpan())
      .catch((error) => {
        console.warn("Gagal membersihkan cache lama:", error);
      });
  }, []);

  async function pilihKota(
    kota: HasilGeocoding,
    paksaPerbarui = false
  ) {
    const idPermintaan = ++requestIdRef.current;

    setKotaTerpilih(kota);
    setSedangMemuat(true);
    setPesanError(null);
    setHasilPencarian([]);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kota.id,
          nama: kota.name,
          latitude: kota.latitude,
          longitude: kota.longitude,
        },
        { paksaPerbarui }
      );

      // Abaikan respons yang berasal dari permintaan sebelumnya.
      if (idPermintaan !== requestIdRef.current) return;

      setHasil(data);

      // Simpan riwayat setelah data cuaca berhasil dimuat.
      try {
        await tambahRiwayat(kota.name);
      } catch (error) {
        console.warn("Gagal menyimpan riwayat:", error);
      }

      await muatKotaTersimpan();
    } catch (error) {
      if (idPermintaan !== requestIdRef.current) return;

      console.error("Gagal mengambil data cuaca:", error);
      setHasil(null);
      setPesanError(
        "Data cuaca gagal dimuat. Periksa koneksi internet atau coba lagi."
      );
    } finally {
      if (idPermintaan === requestIdRef.current) {
        setSedangMemuat(false);
      }
    }
  }

  // Membuka kota yang dipilih dari halaman riwayat.
  useEffect(() => {
    if (!namaDariRute?.trim()) return;

    const namaKota = namaDariRute.trim();
    const kunciRute = `${namaKota}:${pemicuRute ?? ""}`;

    // Hindari pemrosesan ulang parameter rute yang sama.
    if (ruteDiprosesRef.current === kunciRute) return;
    ruteDiprosesRef.current = kunciRute;

    let aktif = true;

    setTeksCari(namaKota);
    setHasilPencarian([]);
    setPesanError(null);

    void (async () => {
      try {
        const daftar = await cariKota(namaKota);

        if (!aktif) return;

        const kotaCocok = daftar.find(
          (item) =>
            item.name.toLowerCase() === namaKota.toLowerCase()
        );

        const kota = kotaCocok ?? daftar[0];

        if (kota) {
          await pilihKota(kota);
        } else {
          setPesanError(
            `Kota "${namaKota}" tidak ditemukan.`
          );
        }
      } catch (error) {
        if (!aktif) return;

        console.error("Gagal mencari kota dari riwayat:", error);
        setPesanError(
          "Pencarian kota gagal. Periksa koneksi internet."
        );
      }
    })();

    return () => {
      aktif = false;
    };
  }, [namaDariRute, pemicuRute]);

  // Pencarian manual tetap berjalan meskipun URL memiliki parameter q.
  useEffect(() => {
    const kataKunci = teksTertunda.trim();
    const idPencarian = ++pencarianIdRef.current;

    if (!kataKunci) {
      setHasilPencarian([]);
      return;
    }

    // Jangan membuat permintaan pencarian kedua untuk kota dari rute.
    if (
      namaDariRute &&
      kataKunci.toLowerCase() === namaDariRute.trim().toLowerCase()
    ) {
      setHasilPencarian([]);
      return;
    }

    void cariKota(kataKunci)
      .then((daftar) => {
        if (idPencarian === pencarianIdRef.current) {
          setHasilPencarian(daftar);
        }
      })
      .catch(() => {
        if (idPencarian === pencarianIdRef.current) {
          setHasilPencarian([]);
        }
      });

    return () => {
      pencarianIdRef.current += 1;
    };
  }, [teksTertunda, namaDariRute]);

  function ubahPencarian(teks: string) {
    setTeksCari(teks);
    setPesanError(null);
  }

  async function gunakanLokasiSaatIni() {
    try {
      const status = await mintaIzinLokasi();

      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual."
        );
        return;
      }

      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak tersedia. Silakan cari kota secara manual."
        );
        return;
      }

      setPesanLokasi(null);

      const koordinat = await ambilKoordinatSaatIni();

      await pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (error) {
      console.error("Gagal mengambil lokasi:", error);
      setPesanLokasi(
        "Lokasi gagal diambil. Silakan coba lagi."
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={ubahPencarian} />

        <Button
          title="Gunakan Lokasi Saat Ini"
          onPress={() => void gunakanLokasiSaatIni()}
        />

        {pesanLokasi !== null && (
          <Text accessibilityLabel={pesanLokasi}>
            {pesanLokasi}
          </Text>
        )}

        {hasilPencarian.map((kota) => (
          <TouchableOpacity
            key={`${kota.id}-${kota.name}`}
            onPress={() => void pilihKota(kota)}
            style={{ paddingVertical: 8 }}
          >
            <Text>{kota.name}</Text>
          </TouchableOpacity>
        ))}

        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "bold" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>

            {kotaTersimpan.map((kota) => (
              <TouchableOpacity
                key={kota.kunci}
                onPress={() =>
                  void pilihKota({
                    id: kota.id,
                    name: kota.nama,
                    latitude: kota.latitude,
                    longitude: kota.longitude,
                    country: "",
                  })
                }
                style={{ paddingVertical: 6 }}
              >
                <Text>{kota.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator />}

        {pesanError !== null && (
          <View style={{ gap: 8 }}>
            <Text accessibilityLabel={pesanError}>
              {pesanError}
            </Text>

            <Button
              title="Coba Lagi"
              disabled={!kotaTerpilih || sedangMemuat}
              onPress={() => {
                if (kotaTerpilih) {
                  void pilihKota(kotaTerpilih, true);
                }
              }}
            />
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <>
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(
                hasil.kualitasUdara.indeksAQI
              )}
            />

            <Text style={{ fontSize: 12, color: "#888888" }}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
              {" • "}Angin {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <Button
              title="Perbarui Sekarang"
              onPress={() => void pilihKota(kotaTerpilih, true)}
            />

            <Button
              title="Tambahkan ke Favorit"
              onPress={() =>
                router.push({
                  pathname: "../tambah-favorit",
                  params: {
                    id: String(kotaTerpilih.id),
                    nama: kotaTerpilih.name,
                    lat: String(kotaTerpilih.latitude),
                    lon: String(kotaTerpilih.longitude),
                  },
                })
              }
            />
          </>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
