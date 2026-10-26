import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_RIWAYAT = 'riwayat_pencarian';
const KEY_CACHE = 'cache_kota';
const MAKS_RIWAYAT = 10;

export type CacheKota = { kota: string; suhu: number; waktu: number };

/* ---------- Riwayat pencarian ---------- */

export async function getRiwayat(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_RIWAYAT);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Panggil setelah pencarian BERHASIL. Kota terbaru di atas, maksimal 10, tanpa duplikat.
export async function tambahRiwayat(kota: string) {
  const nama = kota.trim();
  if (!nama) return;
  const lama = await getRiwayat();
  const sisa = lama.filter(k => k.toLowerCase() !== nama.toLowerCase());
  const baru = [nama, ...sisa].slice(0, MAKS_RIWAYAT);
  await AsyncStorage.setItem(KEY_RIWAYAT, JSON.stringify(baru));
}

/* ---------- Cache kota (offline) ---------- */

export async function getCacheSemua(): Promise<Record<string, CacheKota>> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function simpanCache(data: CacheKota) {
  const semua = await getCacheSemua();
  semua[data.kota.toLowerCase()] = data;
  await AsyncStorage.setItem(KEY_CACHE, JSON.stringify(semua));
}

export async function hapusCache(kota: string) {
  const semua = await getCacheSemua();
  delete semua[kota.toLowerCase()];
  await AsyncStorage.setItem(KEY_CACHE, JSON.stringify(semua));
}