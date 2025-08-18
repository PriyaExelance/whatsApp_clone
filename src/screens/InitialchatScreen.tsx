import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  FlatList,
} from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';

import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';

import { lightTheme, darkTheme, colors } from '../helper/colors';

import Modal from 'react-native-modal';
import { useEffect, useState } from 'react';

import firestore from '@react-native-firebase/firestore';
import auth, { getAuth, signOut } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InitialchatScreen = () => {
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(true);
  const [isVisible, setVisible] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [users, setUsers] = useState([]);
  const [phone, setPhone] = useState('');
  const [img, setImage] = useState('');
  const colorScheme = useColorScheme();
  const [selectedItem, setSelectedItem] = useState(1);
  const [showSearchinput, setSearchinput] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(users);
  const user = auth().currentUser?.uid;
  const [selected, setSelected] = useState([]);
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;
  const toggleSearch = () => {
    setSearchinput(!showSearchinput);
    if (showSearchinput) {
      setSearch('');
      fetchUsers();
    }
  };

  const handleSearch = text => {
    setSearch(text);
    const filtered = users.filter(
      item =>
        item.firstname.toLowerCase().includes(text.toLowerCase()) ||
        item.lastname.toLowerCase().includes(text.toLowerCase()),
    );
    if (filtered.length > 0) {
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  };
  useEffect(() => {
    fetchUsers();
    if (user) {
      setModalVisible(!isModalVisible);
    }
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      navigation.navigate('WelcomeScreen');
    } catch (error) {
      console.error('Error removing user token:', error);
    }
  };

  const wp_categories = [
    { id: 1, name: 'Chats' },
    { id: 2, name: 'Status' },
    { id: 3, name: 'Calls' },
  ];
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

  const getUsers = async () => {
    try {
      const userSnapshot = await firestore().collection('users').get();
      const users = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(users);
      return users;
    } catch (error) {
      console.error('Error fetching user data ', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const userList = await getUsers();
      setUsers(userList);
      setFilteredData(userList);
    } catch (error) {
      Alert.alert('Error in fetching users', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.images_render}>
      <TouchableOpacity
        onPress={() => {
          setImage(item.img_1), setVisible(!isVisible);
        }}
      >
        <Image source={{ uri: item.img_1 }} style={styles.images_sizing} />
      </TouchableOpacity>
    </View>
  );

  const renderItem1 = ({ item }) => {
    {
      return (
        <TouchableOpacity
          style={styles.user_list}
          onPress={() =>
            navigation.navigate('ChatScreen', {
              id: item.id,
              img: item.img,
              firstname: item.firstname,
              lastname: item.lastname,
            })
          }
        >
          <View style={styles.profile_pic}>
            <Image source={{ uri: item.img }} style={styles.profile_imgSize} />
          </View>
          <View style={styles.name_view2}>
            <Text style={[styles.names, { color: themeStyles.texts }]}>
              {item.firstname} {item.lastname}
            </Text>
            <Text style={styles.phone_no}>{item.phone}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const addUserData = async userData => {
    if (user) {
      console.log('users ', user);
      const uid = user;
      console.log('u id ', uid);
      firestore()
        .collection('users')
        .doc(uid)
        .set({
          ...userData,
        })
        .then(() => {
          console.log('User data added to Firestore!');
        })
        .catch(error => {
          console.error('Error adding user data to Firestore:', error);
        });
    }
  };
  const handleSubmit = async () => {
    if (!img || !firstname || !lastname || !phone) {
      Alert.alert('Error', 'Please field all the fields');
      setModalVisible(!isModalVisible);
      return;
    }
    const userData = { img, firstname, lastname, phone };
    try {
      {
        await addUserData(userData);
        Alert.alert('Success', 'User Added successfully');
      }
      setImage('');
      setFirstname('');
      setLastname('');
      setPhone('');
    } catch (error) {
      Alert.alert('error', error.message);
      console.log('abvvv', error);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeStyles.background }]}
    >
      <View style={styles.header_color}>
        {showSearchinput ? (
          <View style={styles.search_text}>
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder=" Ask Meta AI or Search..."
              placeholderTextColor="white"
              style={styles.search_textInput}
              cursorColor="white"
            />
            <TouchableOpacity
              onPress={() => {
                toggleSearch();
              }}
            >
              <Image source={images.cross} style={styles.cross_img} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.whatsApp_header}>
              <Text style={styles.whtsapp_color}>{texts.whatsapp}</Text>
            </View>
            <View style={styles.header_icons}>
              <TouchableOpacity onPress={() => toggleSearch()}>
                <Image source={images.search} style={styles.img_size} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLogout()}>
                <Image source={images.settings} style={styles.settings} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.chats_header}>
          <Image source={images.camera} />
          {wp_categories.map(item => (
            <TouchableOpacity
              style={[
                styles.categories_header,
                {
                  borderBottomWidth: selectedItem === item.id ? 2 : 0,
                  borderBottomColor: selectedItem === item.id ? 'white' : '',
                },
              ]}
              key={item.id}
              onPress={() => {
                setSelectedItem(item.id);
              }}
            >
              <Text style={styles.category_name}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.floating_btn}>
        <Image source={images.add_chats} />
      </TouchableOpacity>
      {users.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.contentStyle}
          data={filteredData}
          renderItem={renderItem1}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={<View style={styles.user_listSeprator} />}
          ListEmptyComponent={
            search.length > 0 && (
              <View style={styles.empty_list}>
                <Text style={styles.noContacts}>No Contacts Found</Text>
              </View>
            )
          }
        />
      ) : (
        <View style={styles.initialHeader}>
          <Image source={images.first} />
          <Text style={styles.chat_text}>{texts.chat_yet}</Text>
          <TouchableOpacity style={styles.start_chatting}>
            <Text style={styles.start_btn}>{texts.start}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(!isModalVisible)}
      >
        <View style={styles.user_modal}>
          <Text style={styles.user_header}>{texts.user_details}</Text>
          <TouchableOpacity
            style={styles.selecting_img}
            onPress={() => setVisible(!isVisible)}
          >
            <Image source={{ uri: img }} style={styles.profile_imgUri} />
          </TouchableOpacity>

          <View style={styles.name_view}>
            <Text>{texts.first_name} :</Text>
            <TextInput
              placeholder="Enter First Name"
              value={firstname}
              onChangeText={txt => setFirstname(txt)}
            />
          </View>
          <View style={styles.name_view}>
            <Text>{texts.last_name} :</Text>
            <TextInput
              placeholder="Enter Last Name"
              value={lastname}
              onChangeText={txt => setLastname(txt)}
            />
          </View>
          <View style={styles.name_view}>
            <Text>{texts.phone} :</Text>
            <TextInput
              maxLength={10}
              placeholder="Enter Phone number"
              value={phone}
              onChangeText={txt => setPhone(txt)}
            />
          </View>
          <TouchableOpacity
            style={styles.submit_btn}
            onPress={() => {
              handleSubmit();
              setModalVisible(!isModalVisible);
            }}
          >
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => setVisible(!isVisible)}
      >
        <FlatList
          data={imgs}
          renderItem={renderItem}
          numColumns={2}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.gallery_imgList}
        />
      </Modal>
    </View>
  );
};

export default InitialchatScreen;

const styles = StyleSheet.create({
  gallery_imgList: {
    backgroundColor: colors.white,
    borderRadius: wp(20),
    paddingHorizontal: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(30),
  },
  submit_btn: {
    backgroundColor: colors.green,
    padding: wp(10),
    borderRadius: wp(16),
    marginTop: hp(10),
  },
  last_name: { flexDirection: 'row', alignItems: 'center' },
  name_view: { flexDirection: 'row', alignItems: 'center', marginTop: hp(10) },
  profile_imgUri: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    resizeMode: 'contain',
  },
  selecting_img: {
    marginTop: hp(10),
    width: wp(50),
    height: hp(50),
    borderRadius: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  user_header: { fontSize: fontSize(24) },
  user_modal: {
    backgroundColor: colors.white,
    borderRadius: wp(20),
    paddingHorizontal: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(30),
  },
  start_btn: { color: colors.white, fontSize: fontSize(20) },
  start_chatting: {
    width: wp(180),
    height: hp(55),
    borderRadius: wp(30),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.green,
    marginTop: hp(27),
  },
  chat_text: { fontSize: fontSize(32), marginTop: hp(85) },
  initialHeader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noContacts: { fontSize: fontSize(16), fontWeight: 'bold' },
  empty_list: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  contentStyle: { flex: 1 },
  user_listSeprator: { height: hp(0.5), backgroundColor: colors.cream },
  categories_header: { alignItems: 'center', flex: 1, paddingBottom: hp(8) },
  whatsApp_header: { flex: 1 },
  cross_img: { width: wp(20), height: hp(20), tintColor: colors.white },
  search_textInput: { color: colors.white, flex: 1 },
  search_text: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(15),
    marginTop: hp(36),
    borderRadius: wp(16),
    backgroundColor: colors.dark_gray,
    justifyContent: 'space-between',
    paddingHorizontal: wp(12),
  },
  phone_no: { color: colors.light_gray },
  names: { fontSize: fontSize(14), fontWeight: 'bold' },
  name_view2: { marginLeft: wp(20) },
  profile_imgSize: { width: wp(50), height: wp(50), borderRadius: wp(25) },
  profile_pic: { width: wp(50), height: wp(50), borderRadius: wp(25) },
  user_list: {
    paddingVertical: hp(15),
    paddingHorizontal: wp(16),
    flexDirection: 'row',
  },
  images_sizing: {
    width: wp(150),
    height: hp(150),
    margin: 10,
    resizeMode: 'cover',
  },
  images_render: { marginBottom: hp(10), borderRadius: wp(8) },
  floating_btn: {
    width: wp(53),
    height: hp(53),
    borderRadius: wp(26.5),
    backgroundColor: colors.btn,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 60,
    right: 25,
  },
  category_name: {
    fontSize: fontSize(14),
    color: colors.white,
    fontWeight: 'bold',
  },
  chats_header: {
    flexDirection: 'row',
    marginTop: hp(22),
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
  },
  header_icons: { flexDirection: 'row' },
  settings: { tintColor: colors.white, marginLeft: wp(23) },
  img_size: { width: wp(20), height: wp(20) },
  whtsapp_color: {
    fontSize: fontSize(20),
    color: colors.white,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(15),
    marginTop: hp(36),
  },
  header_color: { backgroundColor: colors.darkgreen },
  container: { flex: 1 },
});
