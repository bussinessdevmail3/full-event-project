import { StyleSheet, Text, View, Pressable } from 'react-native';
import { TextInput as RNTextInput } from 'react-native';
import type { ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '../../theme/tokens';

interface TextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  icon?: React.ReactNode;
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export function TextInput({
  label, value, onChangeText, placeholder, error, secureTextEntry,
  keyboardType = 'default', autoCapitalize = 'none', icon, style, multiline, numberOfLines,
}: TextInputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <RNTextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign="right"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  inputError: {
    borderColor: colors.error[400],
  },
  icon: {
    marginEnd: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.text,
    padding: 0,
    minHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingVertical: spacing.sm,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  errorText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.error[500],
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
