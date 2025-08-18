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
import { lightTheme, darkTheme, colors } from '../helper/colors';
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
  const [docsVisible, setDocsVisible] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const reversedMessages = [...messages].reverse();
  const navigation = useNavigation();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const currentUserId = auth().currentUser?.uid || '';
  const [selectedImg, setSelectedImg] = useState([]);

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

  const sendPhotos = async (url, userId) => {
    try {
      const chatRef = firebase.firestore().collection('chats').doc(chatID);
      const docExists = await chatRef.get();
      if (docExists.exists) {
        await chatRef.update({
          messages: firebase.firestore.FieldValue.arrayUnion({
            img: url,
            createdAt: new Date(),
            sender_id: userId,
            type: 'image',
          }),
        });
        setSelectedImg([]);
        setVisible(!isVisible);
      } else {
        await chatRef.set({
          messages: firebase.firestore.FieldValue.arrayUnion({
            img: url,
            createdAt: new Date(),
            sender_id: userId,
            type: 'image',
          }),
        });
        setSelectedImg([]);
        setVisible(!isVisible);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSend = async (messageText, userId) => {
    try {
      const chatRef = firebase.firestore().collection('chats').doc(chatID);
      const docRef = await chatRef.get();
      if (docRef.exists) {
        await chatRef.update({
          messages: firebase.firestore.FieldValue.arrayUnion({
            text: messageText,
            createdAt: new Date(),
            sender_id: userId,
            type: 'text',
          }),
        });
      } else {
        await chatRef.set({
          messages: firebase.firestore.FieldValue.arrayUnion({
            text: messageText,
            createdAt: new Date(),
            sender_id: userId,
            type: 'text',
          }),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const render_Attachments = ({ item }) => (
    <View style={styles.render_gallery}>
      <TouchableOpacity>
        <Image source={{ uri: item.img_1 }} style={styles.atach_img} />
      </TouchableOpacity>
    </View>
  );

  const handleImageSelection = (id, url) => {
    const exists = selectedImg.some(item_id => item_id === id);
    if (exists) {
      setSelectedImg(selectedImg.filter(img_id => img_id !== id));
    } else {
      setSelectedImg([...selectedImg, { id, url }]);
    }
  };

  const renderItem = ({ item }) => {
    const selected = selectedImg.some(img => img.id === item.id);

    return (
      <View style={styles.render_gallery}>
        <TouchableOpacity
          style={[styles.selected_img, { opacity: selected ? 0.5 : 1 }]}
          onPress={() => {
            handleImageSelection(item.id, item.img_1);
          }}
        >
          <Image source={{ uri: item.img_1 }} style={[styles.gallery_img]} />
        </TouchableOpacity>
        {selected && (
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {' '}
            <Image
              source={images.check}
              style={{ width: wp(20), height: wp(20) }}
            />{' '}
          </View>
        )}
      </View>
    );
  };
  const renderMessage = ({ item }) => {
    const msgid = item.sender_id === currentUserId;

    return (
      <ScrollView
        style={[
          styles.render_senderMsg,
          {
            alignSelf: msgid ? 'flex-end' : 'flex-start',
            backgroundColor: themeStyles.msges,
          },
        ]}
      >
        {item.type === 'text' && (
          <Text style={{ color: themeStyles.texts }}>{item.text}</Text>
        )}{' '}
        {item.type === 'image' && item.img
          ? item.img.map((imgObj, index) => (
              <TouchableOpacity>
                <Image
                  key={imgObj.id || index}
                  source={{ uri: imgObj.url }}
                  style={{
                    width: wp(150),
                    height: wp(150),
                    borderRadius: 8,
                    marginBottom: hp(5),
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          : ''}
        <Text style={styles.created_date}>
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
      <View style={styles.header_view}>
        <View style={styles.header_name}>
          <TouchableOpacity
            onPress={() => navigation.goBack('InitialchatScreen')}
          >
            <Image source={images.back_arrow} style={styles.profile_pic} />
          </TouchableOpacity>

          <View style={styles.pic_view}>
            <Image source={{ uri: img }} style={styles.pic_sizing} />
          </View>
          <View style={styles.chat_name}>
            <Text style={styles.text_style}>
              {firstname} {lastname}
            </Text>
            <Text style={styles.online_txt}>Online</Text>
          </View>
          <Image source={images.video} style={styles.icon_margin} />
          <Image source={images.phone} style={styles.icon_margin} />
          <Image source={images.settings} style={styles.setting_img} />
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.message_list}
        data={reversedMessages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted={true}
      />{' '}
      <View style={styles.text_msgview}>
        <View
          style={[
            styles.send_msgview,
            { backgroundColor: themeStyles.msg_text },
          ]}
        >
          <View style={styles.textinput_msg}>
            <Image source={images.emoji} />
            <TextInput
              placeholder="Message"
              value={msg}
              onChangeText={txt => {
                setMsg(txt);
              }}
              placeholderTextColor="#8798A0"
              style={[styles.txt_inputStyle, { color: themeStyles.texts }]}
            />
          </View>
          <View style={styles.icons_view}>
            <TouchableOpacity onPress={() => setDocsVisible(!docsVisible)}>
              <Image source={images.attach} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Image source={images.payment} style={styles.payment_icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setVisible(!isVisible)}>
              <Image source={images.camera2} style={styles.camera_icon} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.mike_icon} onPress={handleSendMessage}>
          {msg.length > 0 ? (
            <Image source={images.send} style={styles.send_icon} />
          ) : (
            <Image source={images.mike} />
          )}
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isVisible}
        style={styles.modal_open}
        onBackdropPress={() => setVisible(!isVisible)}
      >
        <View style={styles.modal_viewStyle}>
          <FlatList
            data={imgs}
            renderItem={renderItem}
            numColumns={2}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list_imgs}
          />
          <TouchableOpacity
            style={{
              backgroundColor: colors.dd,
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => sendPhotos(selectedImg, currentUserId)}
          >
            <Text style={{ color: colors.white }}>Send</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        isVisible={docsVisible}
        style={styles.modal_open}
        onBackdropPress={() => setDocsVisible(false)}
      >
        <View style={styles.modal_viewStyle}>
          <FlatList
            data={imgs}
            renderItem={render_Attachments}
            numColumns={3}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list_imgs}
          />
        </View>
      </Modal>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  selected_img: {
    width: wp(150),
    height: hp(150),
    margin: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  list_img: { width: wp(20), height: hp(20) },
  modal_viewStyle: {
    backgroundColor: 'white',
    borderTopLeftRadius: wp(16),
    borderTopRightRadius: wp(16),
  },
  list_imgs: { backgroundColor: 'white' },
  modal_open: { justifyContent: 'flex-end' },
  send_icon: {
    tintColor: 'white',
    width: wp(20),
    height: wp(20),
    resizeMode: 'contain',
  },
  mike_icon: {
    width: wp(50),
    height: hp(50),
    borderRadius: wp(25),
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: wp(14),
  },
  camera_icon: { marginLeft: wp(18) },
  payment_icon: { marginLeft: wp(14) },
  icons_view: { flexDirection: 'row', alignItems: 'center' },
  txt_inputStyle: {
    fontSize: fontSize(18),
    marginLeft: wp(20),
    flex: 1,
  },
  textinput_msg: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  send_msgview: {
    justifyContent: 'space-between',
    borderRadius: wp(25),
    flexDirection: 'row',
    paddingHorizontal: wp(15),
    flex: 1,
  },
  text_msgview: {
    paddingHorizontal: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(18),
  },
  message_list: { paddingHorizontal: wp(22), paddingVertical: hp(24) },
  setting_img: { tintColor: colors.white },
  icon_margin: { marginRight: wp(26) },
  online_txt: { color: colors.white },
  text_style: {
    fontSize: fontSize(18),
    color: colors.white,
    fontWeight: 'bold',
  },
  chat_name: { flex: 1, marginLeft: wp(14) },
  pic_sizing: { width: wp(53), height: hp(53), borderRadius: wp(26.5) },
  pic_view: {
    width: wp(53),
    height: wp(53),
    borderRadius: wp(26.5),
    marginLeft: wp(4),
  },
  profile_pic: { width: wp(20), height: wp(20) },
  header_name: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(36),
    marginBottom: hp(10),
  },
  header_view: { backgroundColor: colors.darkgreen, paddingHorizontal: wp(10) },
  created_date: { fontSize: 12, color: colors.gray, alignSelf: 'flex-end' },
  gallery_img: {
    width: wp(150),
    height: hp(150),

    resizeMode: 'cover',
  },
  atach_img: {
    width: wp(90),
    height: wp(90),
    marginHorizontal: wp(10),
    marginVertical: hp(10),
  },
  render_gallery: { borderRadius: wp(8) },

  render_senderMsg: {
    padding: wp(10),
    marginTop: hp(5),
    borderRadius: wp(10),
    backgroundColor: colors.yellow,
    paddingHorizontal: wp(16),
  },

  render_images: {
    flexDirection: 'row', // Arrange images horizontally
    alignItems: 'center', // Align images vertically in the center
    justifyContent: 'center', // Center images horizontally within the container
    padding: 5, // Add some padding around the images
  },
  container: {
    flex: 1,
  },
});

//make this component available to the app
export default ChatScreen;
