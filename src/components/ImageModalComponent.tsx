import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface ReusableModalProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
  showFooter?: boolean;
  footerContent?: React.ReactNode;
}

const ImageModalComponent: React.FC<ReusableModalProps> = ({
  isVisible,
  onClose,
  children,
  containerStyle,
  showFooter = false,
  footerContent,
}) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={styles.modal}>
      <View style={[styles.container, containerStyle]}>
        {children}

        {showFooter && footerContent && <View>{footerContent}</View>}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: wp(10),
    borderTopRightRadius: wp(10),
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
});

export default ImageModalComponent;
