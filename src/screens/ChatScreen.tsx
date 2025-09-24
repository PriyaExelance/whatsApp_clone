//import liraries
import React, { useState, useEffect, useContext } from 'react';
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
import { texts } from '../helper/strings';
import { ThemeContext } from '../helper/themeContext';

const ChatScreen = ({ route }: { route: any }) => {
  const { theme } = useContext(ThemeContext);
  const { id, img, firstname, lastname } = route.params;
  const colorScheme = useColorScheme();
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [docsVisible, setDocsVisible] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const navigation = useNavigation();
  const currentUserId = auth().currentUser?.uid || '';
  const [selectedImg, setSelectedImg] = useState([]);
  const [imgVisible, setImgVisible] = useState(false);
  const [image_select, setImageSelect] = useState([]);
  const [date, setDate] = useState([]);

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

  const attach_icons = [
    {
      id: 1,
      icon: require('../assets/images/contact.png'),
      name: 'Contact',
    },
    { id: 2, icon: require('../assets/images/doc_camera.png'), name: 'Camera' },
    { id: 3, icon: require('../assets/images/docs.png'), name: 'Document' },
    { id: 4, icon: require('../assets/images/gallery.png'), name: 'Gallery' },
    { id: 5, icon: require('../assets/images/location.png'), name: 'Location' },
    { id: 6, icon: require('../assets/images/poll.png'), name: 'Poll' },
    { id: 7, icon: require('../assets/images/rupees.png'), name: 'Pay' },
    { id: 8, icon: require('../assets/images/music.png'), name: 'Audio' },
    { id: 9, icon: require('../assets/images/gallery.png'), name: 'Ai Images' },
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
          setMessages(data.messages.reverse());
        } else {
          setMessages([]);
        }
      });

    return () => unsubscribe();
  }, [chatID]);

  const sendPhotos = async (url: any, userId: string) => {
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

  const handleSend = async (messageText: string, userId: string) => {
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

  type Attachment = {
    icon: any;
    name: string;
  };

  const render_Attachments = ({ item }: { item: Attachment }) => (
    <View style={styles.render_attachments}>
      <TouchableOpacity style={styles.attach_imgrender}>
        <Image source={item.icon} />
        <Text>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );

  const render_Images = ({ item }: { item: any }) => {
    return (
      <View style={styles.render_gallery}>
        <TouchableOpacity>
          <Image source={{ uri: item.url }} style={styles.preview_imgs} />
        </TouchableOpacity>
      </View>
    );
  };

  const handleImageSelection = (id, url) => {
    setSelectedImg(prevSelected => {
      const exists = prevSelected.some(img => img.id === id);
      if (exists) {
        return prevSelected.filter(img => img.id !== id);
      } else {
        return [...prevSelected, { id, url }];
      }
    });
  };
  const renderItem = ({ item }: { item: any }) => {
    const selected = selectedImg.some(img => img.id === item.id);
    return (
      <View>
        <TouchableOpacity
          style={[styles.selected_img, { opacity: selected ? 0.5 : 1 }]}
          onPress={() => {
            handleImageSelection(item.id, item.img_1);
          }}
        >
          <Image source={{ uri: item.img_1 }} style={[styles.gallery_img]} />
        </TouchableOpacity>
        {selected && (
          <View style={styles.added_images}>
            {' '}
            <Image source={images.check} style={styles.profile_pic} />{' '}
          </View>
        )}
      </View>
    );
  };

  const formatWhatsAppTime = timestamp => {
    const messageTime = moment(timestamp);
    const now = moment();

    if (messageTime.isSame(now, 'day')) {
      return 'Today';
    } else if (messageTime.isSame(moment().subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    } else {
      return messageTime.format('DD/MM/YYYY');
    }
  };

  const renderMessage = ({ item, index }) => {
    console.log('messages', item);
    const msgid = item.sender_id === currentUserId;
    const imgArray = Array.isArray(item.img) ? item.img : [];
    let showHeader = false;
    const current_moment = moment(item.createdAt.toDate()).format('DD-MM-YYYY');
    const msgMoment = moment(item.createdAt.toDate());
    const previous_msg = messages[index + 1];
    const prevMoment = previous_msg?.createdAt
      ? moment(previous_msg.createdAt.toDate()).format('DD-MM-YYYY')
      : '';
    if (!previous_msg || current_moment !== prevMoment) {
      showHeader = true;
    }
    return (
      <View>
        {showHeader && (
          <View style={styles.dates_days}>
            <Text style={[styles.time_text, { color: theme.colors.texts }]}>
              {formatWhatsAppTime(msgMoment)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.render_senderMsg,
            {
              alignSelf: msgid ? 'flex-end' : 'flex-start',
              backgroundColor: msgid && theme.colors.msges,
            },
          ]}
        >
          {item.type === 'text' && (
            <Text style={{ color: msgid && theme.colors.texts }}>
              {item.text}
            </Text>
          )}
          {item.type === 'repliedStatus' && (
            <View
              style={[
                styles.reply_status,
                {
                  justifyContent: msgid ? 'flex-end' : 'flex-start',
                  backgroundColor: msgid && theme.colors.msges,
                },
              ]}
            >
              <Image
                source={{ uri: item.msg_txt.img }}
                style={styles.reply_statusImg}
              />
              <Text style={{ color: msgid && theme.colors.texts }}>
                {item.msg_txt.text}
              </Text>
            </View>
          )}

          {item.type === 'image' && (
            <View
              style={[
                styles.image_chat,
                {
                  justifyContent: msgid ? 'flex-end' : 'flex-start',
                  backgroundColor: msgid && theme.colors.msges,
                },
              ]}
            >
              {imgArray.slice(0, 4).map((imgObj, imgIndex) => {
                let t_width = wp(120);
                let t_height = wp(120);
                if (imgArray.length === 3) {
                  if (imgIndex === 0 || 1 || 2) {
                    t_width = wp(120);
                  }
                } else if (imgArray.length === 2) {
                  if (imgIndex === 0 || 1) {
                    t_width = wp(120);
                  }
                } else if (imgArray.length >= 4) {
                  t_width = wp(120);
                }

                const isLast = imgIndex === 3 && imgArray.length > 4;
                const handleImage = () => {
                  setImageSelect(item.img);
                  setDate(item.createdAt);
                  setImgVisible(true);
                };

                return (
                  <TouchableOpacity
                    key={imgObj.id || imgIndex}
                    style={styles.image_click}
                    onPress={() => {
                      handleImage();
                    }}
                  >
                    <Image
                      source={{ uri: imgObj.url }}
                      style={{
                        width: t_width,
                        height: t_height,
                      }}
                    />

                    {isLast && (
                      <TouchableOpacity
                        style={[
                          styles.added_imgtext,
                          { backgroundColor: colors.black_shadow },
                        ]}
                        onPress={handleImage}
                      >
                        <Text style={{ color: colors.white, fontSize: 20 }}>
                          +{imgArray.length - 4}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text
            style={[
              styles.created_date,
              { alignSelf: msgid ? 'flex-end' : 'flex-start' },
            ]}
          >
            {moment(item.createdAt.toDate()).format(' HH:mm')}
          </Text>
        </View>
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
        { backgroundColor: theme.colors.chat_background },
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
            <Text style={styles.online_txt}>{texts.online}</Text>
          </View>
          <Image source={images.video} style={styles.icon_margin} />
          <Image source={images.phone} style={styles.icon_margin} />
          <Image source={images.settings} style={styles.setting_img} />
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.message_list}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        inverted
      />
      <View style={styles.text_msgview}>
        <View
          style={[
            styles.send_msgview,
            { backgroundColor: theme.colors.msg_text },
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
              placeholderTextColor={colors.placeholder}
              style={[styles.txt_inputStyle, { color: theme.colors.texts }]}
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
        style={[styles.modal_open, { margin: 0 }]}
        onBackdropPress={() => setVisible(!isVisible)}
      >
        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: wp(16),
            borderTopRightRadius: wp(16),
            alignItems: 'center',
          }}
        >
          <FlatList
            data={imgs}
            renderItem={renderItem}
            numColumns={2}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={[styles.list_imgs]}
          />
          {selectedImg.length > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: colors.dd,
                padding: wp(10),
                borderRadius: wp(16),
                marginTop: hp(10),
                marginBottom: hp(10),
              }}
              onPress={() => sendPhotos(selectedImg, currentUserId)}
            >
              <Text style={{ color: colors.white }}>{texts.send}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      <Modal
        isVisible={docsVisible}
        style={[styles.modal_open, { margin: 0 }]}
        onBackdropPress={() => setDocsVisible(false)}
      >
        <View style={styles.modal_viewStyle}>
          <FlatList
            data={attach_icons}
            renderItem={render_Attachments}
            numColumns={3}
            keyExtractor={(item: any) => item.id}
            contentContainerStyle={styles.list_imgs}
          />
        </View>
      </Modal>
      <Modal
        isVisible={imgVisible}
        onBackdropPress={() => setImgVisible(!imgVisible)}
      >
        <View>
          <View>
            <Text style={styles.modal_name}>
              {firstname} {lastname}
            </Text>
          </View>

          <FlatList
            data={image_select}
            renderItem={render_Images}
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
  reply_statusImg: { width: wp(150), height: wp(150) },
  reply_status: { flexWrap: 'wrap', maxWidth: wp(250) },
  attach_imgrender: { justifyContent: 'center', alignItems: 'center' },
  added_imgtext: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image_click: { borderRadius: 8, overflow: 'hidden', margin: 2 },
  image_chat: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: wp(250) },
  time_text: { fontSize: 12 },
  dates_days: { alignSelf: 'center', marginVertical: 10 },
  added_images: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  selected_img: {
    width: wp(150),
    height: hp(150),
    marginVertical: wp(10),
    marginHorizontal: wp(10),
  },
  list_img: { width: wp(20), height: hp(20) },
  modal_viewStyle: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(16),
    borderTopRightRadius: wp(16),
    padding: wp(5),
    alignContent: 'center',
  },
  modal_image: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modal_preview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list_imgs: { backgroundColor: colors.white },
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
  message_list: { paddingHorizontal: wp(17), paddingVertical: hp(10) },
  setting_img: { tintColor: colors.white },
  icon_margin: { marginRight: wp(26) },
  online_txt: { color: colors.white },
  text_style: {
    fontSize: fontSize(18),
    color: colors.white,
    fontWeight: 'bold',
  },
  modal_name: {
    fontSize: fontSize(16),
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(10),
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
    borderRadius: wp(10),
  },

  preview_imgs: {
    width: wp(375),
    height: hp(500),
  },
  render_gallery: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  render_attachments: {
    width: wp(70),
    height: wp(70),
    borderRadius: wp(35),
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  render_senderMsg: {
    marginTop: hp(5),
    borderRadius: wp(10),
    backgroundColor: colors.yellow,
    paddingHorizontal: wp(10),
    paddingVertical: hp(5),
  },

  container: {
    flex: 1,
  },
});

export default ChatScreen;
