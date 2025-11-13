// Supabase client initialization for React Native
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Database } from '@/types/database';
import Constants from 'expo-constants';

// Secure storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting item from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting item in SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing item from SecureStore:', error);
    }
  },
};

// Get environment variables
const supabaseUrl =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper functions for common operations
export const supabaseHelpers = {
  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Get current user profile
  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) throw error;
    return data;
  },

  // Get current user sensory profile
  async getSensoryProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('sensory_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Upload photo to storage
  async uploadPhoto(uri: string, bucket: string = 'avatars') {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      // Get file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}.${ext}`;

      // Fetch file as blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, arrayBuffer, {
        contentType: `image/${ext}`,
        upsert: true,
      });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  // Delete photo from storage
  async deletePhoto(url: string, bucket: string = 'avatars') {
    try {
      // Extract path from URL
      const path = url.split(`${bucket}/`)[1];
      if (!path) throw new Error('Invalid photo URL');

      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },
};
