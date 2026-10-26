import { Alert, Platform } from 'react-native';

export function konfirmasi(judul: string, pesan: string, onYa: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${judul}\n\n${pesan}`)) onYa();
    return;
  }
  Alert.alert(judul, pesan, [
    { text: 'Batal', style: 'cancel' },
    { text: 'Hapus', style: 'destructive', onPress: onYa },
  ]);
}