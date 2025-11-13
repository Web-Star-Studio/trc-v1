// Photo Picker Component for Profile Photos
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/lib/context/ThemeContext';
import { useSensory } from '@/lib/context/SensoryContext';
import { supabaseHelpers } from '@/lib/supabase';

interface PhotoPickerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoPicker({ photos, onPhotosChange, maxPhotos = 6 }: PhotoPickerProps) {
  const { theme } = useTheme();
  const { triggerHaptic } = useSensory();
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload photos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can upload up to ${maxPhotos} photos.`);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        triggerHaptic('light');

        // Upload to Supabase
        const photoUrl = await supabaseHelpers.uploadPhoto(result.assets[0].uri, 'photos');

        // Add to photos array
        onPhotosChange([...photos, photoUrl]);
        triggerHaptic('success');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
      triggerHaptic('error');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (url: string, index: number) => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            triggerHaptic('light');
            // Delete from storage
            await supabaseHelpers.deletePhoto(url, 'photos');

            // Remove from array
            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
            triggerHaptic('success');
          } catch (error) {
            console.error('Error removing photo:', error);
            Alert.alert('Error', 'Failed to remove photo. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          color: theme.colors.text.primary,
          fontSize: theme.typography.sizes.sm,
          fontWeight: theme.typography.weights.semibold,
          marginBottom: theme.spacing.sm,
        }}
      >
        Photos ({photos.length}/{maxPhotos})
      </Text>

      <View style={styles.photosGrid}>
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.photoContainer,
              {
                borderRadius: theme.borderRadius.md,
                overflow: 'hidden',
              },
            ]}
            onPress={() => removePhoto(photo, index)}
            activeOpacity={0.7}
          >
            <Image source={{ uri: photo }} style={styles.photo} />
            <View style={styles.removeOverlay}>
              <Text style={styles.removeText}>✕</Text>
            </View>
          </TouchableOpacity>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={[
              styles.addPhotoButton,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.borderRadius.md,
                borderWidth: 2,
                borderColor: theme.colors.border,
                borderStyle: 'dashed',
              },
            ]}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Text style={{ fontSize: 32, marginBottom: 4 }}>+</Text>
                <Text
                  style={{
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.sizes.xs,
                  }}
                >
                  Add Photo
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={{
          color: theme.colors.text.tertiary,
          fontSize: theme.typography.sizes.xs,
          marginTop: theme.spacing.sm,
        }}
      >
        Add at least one photo to help others get to know you
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 120,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 28,
    height: 28,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
