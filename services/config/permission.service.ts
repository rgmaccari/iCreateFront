import * as ImagePicker from 'expo-image-picker';

export async function ensureMediaLibraryPermission() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

export async function ensureCameraPermission() {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}
