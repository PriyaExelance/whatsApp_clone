//import liraries
import React, { Component, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { lightTheme, darkTheme } from '../helper/colors';
import { hp, wp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';
import { images } from '../assets/images';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import moment from 'moment';
// create a component
const ChatScreen = ({ route }) => {
  const { id, img, firstname, lastname } = route.params;

  const colorScheme = useColorScheme();
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const reversedMessages = [...messages].reverse();
  const navigation = useNavigation();

  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const currentUserId = auth().currentUser?.uid || '';

  const otherUserId = id;
  const chatID =
    currentUserId > otherUserId
      ? `${otherUserId}-${currentUserId}`
      : `${currentUserId}-${otherUserId}`;

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection('chats')
      .doc(chatID)
      .onSnapshot(snapshot => {
        const data = snapshot.data();
        if (data && data.messages) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      });

    return () => unsubscribe();
  }, [chatID]);
  const handleSend = async (messageText, userId) => {
    try {
      const chatRef = firebase.firestore().collection('chats').doc(chatID);
      await chatRef.update({
        messages: firebase.firestore.FieldValue.arrayUnion({
          text: messageText,
          createdAt: new Date(),
          sender_id: userId,
        }),
      });
      console.log('Message added to array!');
    } catch (error) {
      const chatRef = firebase.firestore().collection('chats').doc(chatID);
      await chatRef.set({
        messages: firebase.firestore.FieldValue.arrayUnion({
          text: messageText,
          createdAt: new Date(),
          sender_id: userId,
        }),
      });
      console.log('Message added to array!');
    }
  };

  const renderMessage = ({ item }) => {
    const msgid = item.sender_id === currentUserId;
    return (
      <View
        style={[
          styles.render_senderMsg,
          { alignItems: msgid ? 'flex-end' : 'flex-start' },
        ]}
      >
        <Text>{item.text}</Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>
          {item.createdAt?.toDate().toLocaleTimeString()}
        </Text>
      </View>
    );
  };
  const handleSendMessage = () => {
    if (msg.trim()) {
      handleSend(msg, currentUserId);
      setMsg('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeStyles.chat_background },
      ]}
    >
      <View style={{ backgroundColor: '#008069' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(36),
            paddingHorizontal: wp(5),
            marginBottom: hp(10),
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack('InitialchatScreen')}
          >
            <Image
              source={images.back_arrow}
              style={{ width: wp(20), height: wp(20) }}
            />
          </TouchableOpacity>

          <View
            style={{
              width: wp(53),
              height: hp(53),
              borderRadius: wp(26.5),
              marginLeft: wp(4),
            }}
          >
            <Image
              source={{ uri: img }}
              style={{ width: wp(53), height: hp(53), borderRadius: wp(26.5) }}
            />
          </View>
          <View style={{ flex: 1, marginLeft: wp(14) }}>
            <Text
              style={{
                fontSize: fontSize(18),
                color: '#FFFFFF',
                fontWeight: 'bold',
              }}
            >
              {firstname} {lastname}
            </Text>
            <Text style={{ color: '#FFFFFF' }}>Online</Text>
          </View>
          <Image source={images.video} style={{ marginRight: wp(26) }} />
          <Image source={images.phone} style={{ marginRight: wp(26) }} />
          <Image source={images.settings} style={{ tintColor: '#FFFFFF' }} />
        </View>
      </View>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: wp(22),
          paddingVertical: hp(24),
        }}
        data={reversedMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted={true}
      />{' '}
      <View
        style={{
          paddingHorizontal: wp(12),
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: hp(18),
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            justifyContent: 'space-between',
            borderRadius: wp(25),
            flexDirection: 'row',
            paddingHorizontal: wp(15),
            flex: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={images.emoji} />
            <TextInput
              placeholder="Message"
              value={msg}
              onChangeText={txt => setMsg(txt)}
              placeholderTextColor="#8798A0"
              style={{ fontSize: fontSize(18), marginLeft: wp(20) }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image source={images.attach} />
            <Image source={images.payment} style={{ marginLeft: wp(14) }} />
            <Image source={images.camera2} style={{ marginLeft: wp(18) }} />
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: wp(50),
            height: hp(50),
            borderRadius: wp(25),
            backgroundColor: '#02A884',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: wp(14),
          }}
          onPress={handleSendMessage}
        >
          <Image source={images.mike} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  render_senderMsg: {
    padding: wp(10),
    marginTop: hp(5),
    borderRadius: wp(10),
    backgroundColor: '#E7FFDB',
  },

  container: {
    flex: 1,
  },
});

//make this component available to the app
export default ChatScreen;
