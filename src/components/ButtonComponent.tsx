// AppButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../helper/colors';
import { fontSize, hp, wp } from '../helper/responsive';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  style?: any;
  textStyle?: any;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  onPress,
  title,
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.dd,
    borderRadius: wp(16),
    paddingHorizontal: wp(10),
    borderWidth: wp(1),
    padding: wp(10),
    marginTop: hp(10),
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: fontSize(16),
    fontWeight: 'bold',
  },
});

export default ButtonComponent;
