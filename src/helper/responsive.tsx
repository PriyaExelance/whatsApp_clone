import { RFValue } from 'react-native-responsive-fontsize';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';

export const wp = (val: number) => widthPercentageToDP((val * 100) / 375);
export const hp = (val: number) => heightPercentageToDP((val * 100) / 812);

export const fontSize = (val: number) => RFValue(val, 812);
