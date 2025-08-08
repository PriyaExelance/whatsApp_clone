import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  ImageBackground,
  FlatList,
} from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';

import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';

import { lightTheme, darkTheme } from '../helper/colors';

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

  const toggleSearch = () => {
    setSearchinput(!showSearchinput);
    if (showSearchinput) {
      setSearch('');
    }
  };
  const handleSearch = text => {
    setSearch(text);

    const filtered = users.filter(item =>
      item.firstname.toLowerCase().includes(text.toLowerCase()),
    );

    setFilteredData(filtered);
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const user = auth().currentUser?.uid;
  const handleLogout = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      console.log('User token removed successfully!');
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
    } catch (error) {
      Alert.alert('Error in fetching users', error.message);
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
          setImage(item.img_1), setVisible(!isVisible);
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

  const find_user = users.filter(item => user !== item.id);
  const renderItem1 = ({ item }) => {
    return (
      <TouchableOpacity
        style={{
          paddingVertical: hp(15),
          paddingHorizontal: wp(16),
          flexDirection: 'row',
        }}
        onPress={() =>
          navigation.navigate('ChatScreen', {
            id: item.id,
            img: item.img,
            firstname: item.firstname,
            lastname: item.lastname,
          })
        }
      >
        <View
          style={{
            width: wp(50),
            height: wp(50),
            borderRadius: wp(25),
          }}
        >
          <Image
            source={{ uri: item.img }}
            style={{
              width: wp(50),
              height: wp(50),
              borderRadius: wp(25),
            }}
          />
        </View>
        <View style={{ marginLeft: wp(20) }}>
          <Text
            style={{
              fontSize: fontSize(14),
              fontWeight: 'bold',
              color: themeStyles.texts,
            }}
          >
            {item.firstname} {item.lastname}
          </Text>
          <Text style={{ color: '#889095' }}>{item.phone}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  const themeStyles = colorScheme === 'light' ? lightTheme : darkTheme;

  const addUserData = async userData => {
    const user = auth().currentUser?.uid;
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: wp(15),
              marginTop: hp(36),
              borderRadius: wp(16),
              backgroundColor: '#595C6B',
              justifyContent: 'space-between',
              paddingHorizontal: wp(12),
            }}
          >
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder=" Ask Meta AI or Search..."
              placeholderTextColor="white"
              style={{ color: 'white' }}
              cursorColor="white"
            />
            <TouchableOpacity onPress={() => toggleSearch()}>
              <Image
                source={images.cross}
                style={{ width: wp(20), height: hp(20), tintColor: 'white' }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
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
              style={{
                alignItems: 'center',
                flex: 1,
                borderBottomWidth: selectedItem === item.id ? 2 : 0,
                paddingBottom: hp(8),
                borderBottomColor: selectedItem === item.id && 'white',
              }}
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
      {find_user.length > 0 ? (
        <FlatList
          data={find_user}
          renderItem={renderItem1}
          keyExtractor={item => item.id.toString()}
          ItemSeparatorComponent={
            <View
              style={{
                height: hp(0.7),
                backgroundColor: '#cccccc',
              }}
            />
          }
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Image source={images.first} />
          <Text style={{ fontSize: fontSize(32), marginTop: hp(85) }}>
            {texts.chat_yet}
          </Text>
          <TouchableOpacity
            style={{
              width: wp(180),
              height: hp(55),
              borderRadius: wp(30),
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#0CCC83',
              marginTop: hp(27),
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: fontSize(20),
              }}
            >
              {texts.start}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(!isModalVisible)}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: wp(20),
            paddingHorizontal: wp(16),
            justifyContent: 'center',
            alignItems: 'center',
            padding: wp(30),
          }}
        >
          <Text style={{ fontSize: fontSize(24) }}>{texts.user_details}</Text>
          <TouchableOpacity
            style={{
              marginTop: hp(10),
              width: wp(50),
              height: hp(50),
              borderRadius: wp(25),
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
            }}
            onPress={() => setVisible(!isVisible)}
          >
            <Image
              source={{ uri: img }}
              style={{
                width: wp(50),
                height: wp(50),
                borderRadius: wp(25),
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: hp(10),
            }}
          >
            <Text>{texts.first_name} :</Text>
            <TextInput
              placeholder="Enter First Name"
              value={firstname}
              onChangeText={txt => setFirstname(txt)}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{texts.last_name} :</Text>
            <TextInput
              placeholder="Enter Last Name"
              value={lastname}
              onChangeText={txt => setLastname(txt)}
            />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text>{texts.phone} :</Text>
            <TextInput
              maxLength={10}
              placeholder="Enter Phone number"
              value={phone}
              onChangeText={txt => setPhone(txt)}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#0CCC83',
              padding: wp(10),
              borderRadius: wp(16),
              marginTop: hp(10),
            }}
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
          contentContainerStyle={{
            backgroundColor: 'white',
            borderRadius: wp(20),
            paddingHorizontal: wp(16),
            justifyContent: 'center',
            alignItems: 'center',
            padding: wp(30),
          }}
        />
      </Modal>
    </View>
  );
};

export default InitialchatScreen;

const styles = StyleSheet.create({
  floating_btn: {
    width: wp(53),
    height: hp(53),
    borderRadius: wp(26.5),
    backgroundColor: '#008665',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 60,
    right: 25,
  },
  category_name: {
    fontSize: fontSize(14),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chats_header: {
    flexDirection: 'row',
    marginTop: hp(22),
    justifyContent: 'space-between',
    paddingHorizontal: wp(6),
  },
  header_icons: { flexDirection: 'row' },
  settings: { tintColor: '#FFFFFF', marginLeft: wp(23) },
  img_size: { width: wp(20), height: wp(20) },
  whtsapp_color: {
    fontSize: fontSize(20),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(15),
    marginTop: hp(36),
  },
  header_color: { backgroundColor: '#008069' },
  container: { flex: 1 },
});
