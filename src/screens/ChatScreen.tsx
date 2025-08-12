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
  ScrollView,
} from 'react-native';
import { lightTheme, darkTheme } from '../helper/colors';
import { hp, wp, fontSize } from '../helper/responsive';
import { images } from '../assets/images';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import firebase from '@react-native-firebase/app';
import moment from 'moment';
import Modal from 'react-native-modal';

// create a component
const ChatScreen = ({ route }) => {
  const { id, img, firstname, lastname } = route.params;
  const colorScheme = useColorScheme();
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isVisible, setVisible] = useState(false);
  const reversedMessages = [...messages].reverse();
  const navigation = useNavigation();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const currentUserId = auth().currentUser?.uid || '';

  const imgs = [
    {
      id: 1,
      img_1:
        'https://images.unsplash.com/photo-1754215683705-ee0a731d7288?q=80&w=1075&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 2,
      img_1:
        'https://images.unsplash.com/photo-1754254082673-68b06be1308f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 3,
      img_1:
        'https://images.unsplash.com/photo-1754231304863-dac7fcbe86dd?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 4,
      img_1:
        'https://images.unsplash.com/photo-1691389694364-cd0570c862ee?q=80&w=802&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 5,
      img_1:
        'https://images.unsplash.com/photo-1754196668084-aad13474e6f2?q=80&w=667&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      id: 6,
      img_1:
        'https://images.unsplash.com/photo-1746555697990-3a405a5152b9?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ];

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

  const renderItem = ({ item }) => (
    <View
      style={{
        marginBottom: hp(10),
        borderRadius: wp(8),
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setVisible(!isVisible);
        }}
      >
        <Image
          source={{ uri: item.img_1 }}
          style={{
            width: wp(150),
            height: hp(150),
            margin: 10,
            resizeMode: 'cover',
          }}
        />
      </TouchableOpacity>
    </View>
  );
  const renderMessage = ({ item }) => {
    const msgid = item.sender_id === currentUserId;
    return (
      <ScrollView
        style={[
          styles.render_senderMsg,
          {
            alignSelf: msgid ? 'flex-end' : 'flex-start',

            backgroundColor: msgid ? themeStyles.msges : '#1F2C34',
          },
        ]}
      >
        <Text style={{ color: themeStyles.texts }}>{item.text}</Text>
        <Text style={{ fontSize: 12, color: 'gray', alignSelf: 'flex-end' }}>
          {item.createdAt
            ?.toDate()
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </ScrollView>
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
      <View style={{ backgroundColor: '#008069', paddingHorizontal: wp(10) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: hp(36),
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
            backgroundColor: themeStyles.msg_text,
            justifyContent: 'space-between',
            borderRadius: wp(25),
            flexDirection: 'row',
            paddingHorizontal: wp(15),
            flex: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Image source={images.emoji} />
            <TextInput
              placeholder="Message"
              value={msg}
              onChangeText={txt => setMsg(txt)}
              placeholderTextColor="#8798A0"
              style={{
                fontSize: fontSize(18),
                marginLeft: wp(20),
                flex: 1,
                color: themeStyles.texts,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity>
              <Image source={images.attach} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={images.payment} style={{ marginLeft: wp(14) }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVisible(!isVisible)}>
              <Image source={images.camera2} style={{ marginLeft: wp(18) }} />
            </TouchableOpacity>
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
          {msg.length > 0 ? (
            <Image
              source={images.send}
              style={{
                tintColor: 'white',
                width: wp(20),
                height: wp(20),
                resizeMode: 'contain',
              }}
            />
          ) : (
            <Image source={images.mike} />
          )}
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isVisible}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onBackdropPress={() => setVisible(false)}
      >
        <FlatList
          data={imgs}
          renderItem={renderItem}
          numColumns={2}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        />
      </Modal>
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
    paddingHorizontal: wp(16),
  },
  container: {
    flex: 1,
  },
});

//make this component available to the app
export default ChatScreen;
