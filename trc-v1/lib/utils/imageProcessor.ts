// Image processing utilities
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
}

/**
 * Pick image from library with compression and EXIF stripping
 */
export async function pickImage(): Promise<ImagePickerResult | null> {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Media library permission not granted');
      return null;
    }

    // Launch picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];

    // Process image: compress and strip EXIF
    const processed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1080 } }], // Max width 1080px
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: processed.uri,
      width: processed.width,
      height: processed.height,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

/**
 * Take photo with camera
 */
export async function takePhoto(): Promise<ImagePickerResult | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      console.warn('Camera permission not granted');
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];

    // Process image
    const processed = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return {
      uri: processed.uri,
      width: processed.width,
      height: processed.height,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}
