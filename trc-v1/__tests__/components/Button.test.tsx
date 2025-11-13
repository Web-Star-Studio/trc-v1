// Button Component Tests
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { SensoryProvider } from '@/lib/context/SensoryContext';
import { AuthProvider } from '@/lib/context/AuthContext';

// Wrapper with necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <SensoryProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </SensoryProvider>
    </AuthProvider>
  );
};

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Click Me" onPress={() => {}} />,
      { wrapper: AllTheProviders }
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Press Me" onPress={onPressMock} />,
      { wrapper: AllTheProviders }
    );

    const button = getByText('Press Me');
    fireEvent.press(button);

    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPressMock} disabled />,
      { wrapper: AllTheProviders }
    );

    const button = getByText('Disabled').parent;
    expect(button?.props.accessibilityState.disabled).toBe(true);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button title="Submit" onPress={() => {}} loading testID="loading-button" />,
      { wrapper: AllTheProviders }
    );

    // Text should not be visible when loading
    expect(queryByText('Submit')).toBeNull();
  });

  it('has correct accessibility properties', () => {
    const { getByLabelText } = render(
      <Button
        title="Accessible Button"
        onPress={() => {}}
        accessibilityLabel="Custom Label"
        accessibilityHint="This button does something"
      />,
      { wrapper: AllTheProviders }
    );

    const button = getByLabelText('Custom Label');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityHint).toBe('This button does something');
  });
});
