import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';

interface TextInputComponentProps extends TextInputProps {
  value?: string;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  style?: any;
}

const TextInputComponent = ({
  value = '',
  placeholder = '',
  onChangeText = () => {},
  style = {},
  ...rest
}: TextInputComponentProps) => {
  return (
    <TextInput
      value={value}
      placeholder={placeholder}
      onChangeText={onChangeText}
      style={style}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({});

export default TextInputComponent;
