// Login Screen with Email & Password
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.toLowerCase().trim(), password);
      // Navigation is handled automatically by auth state change
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(email.toLowerCase().trim(), password);
      Alert.alert('Success', 'Account created! Please complete your profile.', [{ text: 'OK' }]);
      // Navigation is handled automatically by auth state change
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo/Icon placeholder */}
          <View
            style={[
              styles.logoContainer,
              {
                backgroundColor: theme.colors.primary,
                marginBottom: theme.spacing['2xl'],
              },
            ]}
          >
            <Text style={styles.logoText}>🎀</Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontSize: theme.typography.sizes['3xl'],
                fontWeight: theme.typography.weights.bold,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            Welcome to{'\n'}The Ribbon Club
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.text.secondary,
                fontSize: theme.typography.sizes.md,
                marginBottom: theme.spacing['2xl'],
                lineHeight: theme.typography.lineHeights.relaxed * theme.typography.sizes.md,
              },
            ]}
          >
            An inclusive space for neurodivergent-friendly connections
          </Text>

          <Input
            label="Email address"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            accessibilityLabel="Email address"
            accessibilityHint="Enter your email address"
            containerStyle={{ marginBottom: theme.spacing.md }}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={isSignUp ? 'password-new' : 'password'}
            accessibilityLabel="Password"
            accessibilityHint={
              isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'
            }
            containerStyle={{ marginBottom: theme.spacing.lg }}
          />

          {isSignUp ? (
            <>
              <Button
                title="Create Account"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
                accessibilityHint="Create a new account"
                style={{ marginBottom: theme.spacing.md }}
              />

              <Button
                title="Already have an account? Sign In"
                variant="ghost"
                onPress={() => setIsSignUp(false)}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <Button
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                disabled={loading}
                accessibilityHint="Sign in to your account"
                style={{ marginBottom: theme.spacing.md }}
              />

              <Button
                title="Don't have an account? Sign Up"
                variant="ghost"
                onPress={() => setIsSignUp(true)}
                disabled={loading}
              />
            </>
          )}

          <Text
            style={{
              color: theme.colors.text.tertiary,
              fontSize: theme.typography.sizes.xs,
              textAlign: 'center',
              lineHeight: theme.typography.lineHeights.normal * theme.typography.sizes.xs,
              paddingHorizontal: theme.spacing.md,
              marginTop: theme.spacing.xl,
            }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
});
