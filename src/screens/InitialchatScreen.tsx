import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Animated,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { wp, hp, fontSize } from '../helper/responsive';
import { texts } from '../helper/strings';

import { images } from '../assets/images';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../helper/colors';
import Modal from 'react-native-modal';
import { useEffect, useState, useRef, useContext } from 'react';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ThemeContext } from '../hooks/themeContext';

const InitialchatScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [isModalVisible, setModalVisible] = useState(false);
  const [setting_modal, setSettingModal] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const [user_modal, setUserModal] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [users, setUsers] = useState([]);
  const [phone, setPhone] = useState('');
  const [img, setImage] = useState('');
  const [selectedItem, setSelectedItem] = useState(1);
  const [showSearchinput, setSearchinput] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(users);
  const [selectedImg, setSelectedImg] = useState([]);
  const [allStatus, setAllStatus] = useState([]);
  const replyStatus = useRef(null);
  const status_reply = useRef(null);
  const [selectedUserStatuses, setSelectedUserStatuses] = useState([]);
  const [current_index, setCurrentIndex] = useState(0);
  const [reply, setReply] = useState('');
  const [statusReply, setStatusReply] = useState('');
  const user = auth().currentUser?.uid;
  const [preview, setPreview] = useState(false);
  const [user_preview, setUserPreview] = useState(false);
  const [currentUser_preview, setCurrentUser_preview] = useState(false);
  const [currentUserStatus, setCurrentUserStatuses] = useState([]);
  const other_user = selectedUserStatuses?.[0]?.sender_id;
  const find_user = users.find(item => item.id === user);
  const timer = useRef(0);
  const userIndex = useRef(0);
  const statusIndex = useRef(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);
  const [focused, setFocused] = useState(false);
  const [progressPaused, setProgressPaused] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  const animated_progress = (anim, duration, fromValue = 0) => {
    anim.stopAnimation(value => {
      if (progressPaused) setProgressValue(value);
    });
    anim.setValue(fromValue);
    Animated.timing(anim, {
      toValue: 1,
      duration: duration * (1 - fromValue),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setProgressValue(0);
    });
  };

  useEffect(() => {
    if (selectedUserStatuses.length === 0 || progressPaused) return;
    animated_progress(progressAnim, 5000, progressValue);
  }, [current_index, selectedUserStatuses, progressPaused]);

  const chatID =
    user > other_user ? `${other_user}-${user}` : `${user}-${other_user}`;

  useEffect(() => {
    fetchCurrentUserStatus();
    if (selectedItem === 1) {
      fetchUsers();
    } else if (selectedItem === 2) {
      getStatus();
    }
    getAllstatus();
    listenAllStatus();
  }, []);

  const startUserPreviewTimer = () => {
    if (!user_preview || selectedUserStatuses.length === 0 || progressPaused)
      return;
    if (timer.current) clearTimeout(timer.current);

    animated_progress(progressAnim, 5000, progressValue);

    timer.current = setTimeout(() => {
      if (current_index < selectedUserStatuses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setStatusReply('');
        setUserPreview(false);
      }
    }, 5000);
  };

  useEffect(() => {
    startUserPreviewTimer();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [user_preview, current_index, selectedUserStatuses, progressPaused]);

  const stop_Progress = () => {
    setProgressPaused(true);
    progressAnim.stopAnimation(value => setProgressValue(value));
    if (timer.current) clearTimeout(timer.current);
  };

  const resume_Progress = () => {
    setProgressPaused(false);
    startUserPreviewTimer();
  };

  const current_userTimer = () => {
    if (
      !currentUser_preview ||
      selectedUserStatuses.length === 0 ||
      progressPaused
    )
      return;
    if (timer.current) clearTimeout(timer.current);

    animated_progress(progressAnim, 5000, progressValue);

    timer.current = setTimeout(() => {
      if (current_index < selectedUserStatuses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentUser_preview(false);
      }
    }, 5000);
  };

  useEffect(() => {
    current_userTimer();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [
    currentUser_preview,
    current_index,
    selectedUserStatuses,
    progressPaused,
  ]);

  const stopCurrent_timer = () => {
    setProgressPaused(true);
    progressAnim.stopAnimation(value => setProgressValue(value));
    if (timer.current) clearTimeout(timer.current);
  };

  const resumeCurrent_progress = () => {
    setProgressPaused(false);
    current_userTimer();
  };

  const handleReply = text => {
    setReply(text);
  };

  const startTimer = () => {
    if (!preview || allStatus.length === 0 || progressPaused) return;
    statusIndex.current = 0;
    if (preview && allStatus.length > 0) {
      timer.current = setInterval(() => {
        const currentUser = allStatus[userIndex.current];
        const userStatuses =
          currentUser?.statuses?.flatMap(statusObj =>
            statusObj.image_status?.flatMap(
              imgStatus => imgStatus.image?.map(img => img.url) || [],
            ),
          ) || [];
        if (current_index < userStatuses.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setReply('');
        } else {
          if (userIndex.current < allStatus.length - 1) {
            userIndex.current += 1;
            statusIndex.current = 0;
            setReply('');
            const nextUserStatuses =
              allStatus[userIndex.current]?.statuses?.flatMap(statusObj =>
                statusObj.image_status?.flatMap(
                  imgStatus => imgStatus.image?.map(img => img.url) || [],
                ),
              ) || [];

            const img_objects = nextUserStatuses.map(url => ({
              url,
              user_name: allStatus[userIndex.current]?.userName,
              profile_pic: allStatus[userIndex.current]?.userProfile,
              sender_id: allStatus[userIndex.current]?.userId,
            }));
            setSelectedUserStatuses(img_objects);
            setCurrentIndex(0);
          } else {
            setPreview(false);
            clearInterval(timer.current);
          }
        }
      }, 5000);
    }
  };
  useEffect(() => {
    if (!progressPaused) {
      startTimer();
    }

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [preview, current_index, selectedUserStatuses, progressPaused]);

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = 0;
    }
  };

  const stopProgress = () => {
    setProgressPaused(true);
    progressAnim.stopAnimation(value => setProgressValue(value));
    stopTimer();
  };

  const resumeProgress = () => {
    setProgressPaused(false);
    animated_progress(progressAnim, 5000, progressValue);
    startTimer();
  };

  const toggleSearch = () => {
    setSearchinput(!showSearchinput);
    if (showSearchinput) {
      fetchUsers();
      setSearch('');
    }
  };
  const toggleModal = () => {
    setSettingModal(!setting_modal);
  };
  const sendPhotos = async (userId, img_url) => {
    try {
      const statusCollection = firebase
        .firestore()
        .collection('users')
        .doc(userId)
        .collection('status');

      const latestStatusSnap = await statusCollection
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (!latestStatusSnap.empty) {
        const latestDoc = latestStatusSnap.docs[0].ref;

        await latestDoc.update({
          image_status: firebase.firestore.FieldValue.arrayUnion({
            createdAt: new Date(),
            sender_id: userId,
            image: img_url,
          }),
          createdAt: new Date(),
        });
      } else {
        const newStatusRef = statusCollection.doc();
        await newStatusRef.set({
          createdAt: new Date(),
          image_status: [
            {
              createdAt: new Date(),
              sender_id: userId,
              image: img_url,
            },
          ],
        });
      }

      setSelectedImg([]);
      setVisible(false);
      setUserModal(false);
    } catch (error) {
      console.log('Error sending photo status:', error);
    }
  };

  const handleSend = async (messageText, url, userId) => {
    try {
      const chatRef = firebase.firestore().collection('chats').doc(chatID);
      const docRef = await chatRef.get();
      if (docRef.exists) {
        await chatRef.update({
          messages: firebase.firestore.FieldValue.arrayUnion({
            msg_txt: { text: messageText, img: url },
            createdAt: new Date(),
            sender_id: userId,
            type: 'repliedStatus',
          }),
        });
      } else {
        await chatRef.set({
          messages: firebase.firestore.FieldValue.arrayUnion({
            msg_txt: { text: messageText, img: url },
            createdAt: new Date(),
            sender_id: userId,
            type: 'repliedStatus',
          }),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleSendMessage = () => {
    replyStatus.current?.blur();
    Keyboard.dismiss();
    resumeProgress();
    if (reply.trim()) {
      handleSend(reply, selectedUserStatuses[current_index]?.url, user);
      setReply('');
    }
  };

  const handleStatusMessage = () => {
    status_reply.current?.blur();
    Keyboard.dismiss();

    resume_Progress();

    if (statusReply.trim()) {
      handleSend(statusReply, selectedUserStatuses[current_index]?.url, user);
      setStatusReply('');
    }
  };

  const getUsersWithStatus = async () => {
    try {
      const currentUserId = firebase.auth().currentUser.uid;
      const usersSnap = await firebase.firestore().collection('users').get();
      const usersWithStatus = [];
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const userDoc of usersSnap.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        const statusSnap = await firebase
          .firestore()
          .collection('users')
          .doc(userId)
          .collection('status')
          .orderBy('createdAt', 'asc')
          .get();

        let validStatuses = [];

        statusSnap.forEach(doc => {
          const data = doc.data();

          if (Array.isArray(data.image_status)) {
            const filteredImages = data.image_status
              .filter(imgObj => {
                if (!imgObj.createdAt) return false;
                const created = imgObj.createdAt.toDate
                  ? imgObj.createdAt.toDate()
                  : new Date(imgObj.createdAt);
                return created >= cutoff;
              })
              .map(imgObj => ({
                ...imgObj,
                viewed: imgObj.viewedBy?.includes(currentUserId) || false,
              }));

            if (filteredImages.length > 0) {
              validStatuses.push({
                id: doc.id,
                ...data,
                image_status: filteredImages,
              });
            }
          }
        });

        if (validStatuses.length > 0) {
          usersWithStatus.push({
            userId,
            userName: userData?.firstname,
            userProfile: userData?.img,
            statuses: validStatuses,
          });
        }
      }

      setAllStatus(usersWithStatus);
      return usersWithStatus;
    } catch (error) {
      console.error('Error fetching users with status:', error);
    }
  };

  const listenAllStatus = () => {
    const unsubscribe = firestore()
      .collection('users')
      .onSnapshot(async usersSnap => {
        try {
          const currentUserId = firebase.auth().currentUser.uid;
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const usersWithStatus: any[] = [];

          for (const userDoc of usersSnap.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            const statusSnap = await firestore()
              .collection('users')
              .doc(userId)
              .collection('status')
              .orderBy('createdAt', 'asc')
              .get();

            let validStatuses: any[] = [];
            statusSnap.forEach(doc => {
              const data = doc.data();

              if (Array.isArray(data.image_status)) {
                const filteredImages = data.image_status
                  .filter(imgObj => {
                    if (!imgObj.createdAt) return false;
                    const created = imgObj.createdAt.toDate
                      ? imgObj.createdAt.toDate()
                      : new Date(imgObj.createdAt);
                    return created >= cutoff;
                  })
                  .map(imgObj => ({
                    ...imgObj,
                    viewed: imgObj.viewedBy?.includes(currentUserId) || false,
                  }));

                if (filteredImages.length > 0) {
                  validStatuses.push({
                    id: doc.id,
                    ...data,
                    image_status: filteredImages,
                  });
                }
              }
            });

            if (validStatuses.length > 0) {
              usersWithStatus.push({
                userId,
                userName: userData?.firstname,
                userProfile: userData?.img,
                statuses: validStatuses,
              });
            }
          }

          setAllStatus(usersWithStatus.filter(u => u.userId !== user));
        } catch (error) {
          console.error('Error listening to users with status:', error);
        }
      });

    return unsubscribe;
  };

  const markStatusAsViewed = async (
    ownerId: string,
    statusDocId: string,
    imageIndex: number,
  ) => {
    try {
      const currentUserId = auth().currentUser?.uid;
      if (!currentUserId) return;

      const statusRef = firestore()
        .collection('users')
        .doc(ownerId)
        .collection('status')
        .doc(statusDocId);

      const statusDoc = await statusRef.get();
      if (!statusDoc.exists) return;

      const statusData = statusDoc.data();
      const updatedImages = statusData.image_status.map(
        (img: any, idx: number) => {
          const viewedBy = img.viewedBy || [];
          if (idx === imageIndex && !viewedBy.includes(currentUserId)) {
            return { ...img, viewedBy: [...viewedBy, currentUserId] };
          }
          return img;
        },
      );

      await statusRef.update({ image_status: updatedImages });
      console.log('update', updatedImages);
      console.log(imageIndex);
    } catch (err) {
      console.error('Error marking status viewed:', err);
    }
  };
  useEffect(() => {
    if (!preview || selectedUserStatuses.length === 0) return;

    const currentUser = allStatus[userIndex.current];
    const currentStatus = currentUser?.statuses?.[0];
    const currentImage = currentStatus?.image_status?.[current_index];

    if (
      currentUser &&
      currentStatus &&
      currentImage &&
      !currentImage.viewedBy?.includes(user)
    ) {
      markStatusAsViewed(currentUser.userId, currentStatus.id, current_index);
    }
  }, [current_index, preview]);

  const fetchCurrentUserStatus = async () => {
    try {
      const userStatusRef = firestore()
        .collection('users')
        .doc(user)
        .collection('status')
        .orderBy('createdAt', 'asc');

      const unsubscribe = userStatusRef.onSnapshot(
        snapshot => {
          const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const statuses = [];

          snapshot.forEach(doc => {
            const data = doc.data();
            if (Array.isArray(data.image_status)) {
              const filteredImages = data.image_status.filter(imgObj => {
                const created = imgObj.createdAt.toDate
                  ? imgObj.createdAt.toDate()
                  : new Date(imgObj.createdAt);
                return created >= cutoff;
              });

              if (filteredImages.length > 0) {
                filteredImages.forEach(imgObj => {
                  if (Array.isArray(imgObj.image)) {
                    imgObj.image.forEach(i => statuses.push(i.url));
                  } else {
                    statuses.push(imgObj.image?.url);
                  }
                });
              }
            }
          });
          setCurrentUserStatuses(statuses.flat());
        },
        error => {
          console.error("Error listening to current user's status:", error);
        },
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time listener:', error);
      return () => {};
    }
  };

  const getAllstatus = async () => {
    try {
      const status_list = await getUsersWithStatus();
      const filtered_user = status_list.filter(item => item.userId !== user);
      setAllStatus(filtered_user);
    } catch (error) {
      Alert.alert('Error in fetching users', error.message);
    }
  };

  const getStatus = async () => {
    try {
      const status_list = await getUsersWithStatus();
      setAllStatus(status_list);
    } catch (error) {
      Alert.alert('Error in fetching users', error.message);
    }
  };

  const handleSearch = text => {
    setSearch(text);
    const user_data = users.filter(item => item.id !== user);
    const filtered = user_data.filter(
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
      setFilteredData(userList);
      const user_data = userList.filter(item => item.id !== user);
      setFilteredData(user_data);
    } catch (error) {
      Alert.alert('Error in fetching users', error.message);
    }
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

  const renderItem = ({ item }) => {
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
            <Image source={images.check} style={styles.user_pic} />
          </View>
        )}
      </View>
    );
  };

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
              phone_no: item.phone,
            })
          }
        >
          <View style={styles.profile_pic}>
            <Image source={{ uri: item.img }} style={styles.profile_imgSize} />
          </View>
          <View style={styles.name_view2}>
            <Text style={[styles.names, { color: theme.colors.texts }]}>
              {item.firstname} {item.lastname}
            </Text>
            <Text style={styles.phone_no}>{item.phone}</Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderStatus = ({ item, index }) => {
    const totalImages =
      item?.statuses
        ?.map(statusObj =>
          statusObj.image_status
            ?.map(imgStatus => imgStatus.image?.length || 0)
            .reduce((a, b) => a + b, 0),
        )
        .reduce((a, b) => a + b, 0) ?? 0;

    const img_objects = item.statuses.flatMap(statusObj =>
      statusObj.image_status.map((img, idx) => ({
        url: Array.isArray(img.image) ? img.image[0].url : img.image?.url,
        user_name: item.userName,
        profile_pic: item.userProfile,
        sender_id: item.userId,
        statusDocId: statusObj.id,
        imageIndex: idx,
        viewedBy: img.viewedBy || [],
      })),
    );

    const currentUserId = auth().currentUser?.uid;
    const isAllViewed = item.statuses.every(st =>
      st.image_status.every(img => img.viewedBy?.includes(currentUserId)),
    );

    {
      return (
        <TouchableOpacity
          style={[styles.status_list]}
          onPress={() => {
            userIndex.current = index;
            statusIndex.current = 0;
            if (progressPaused) {
              setProgressPaused(false);
              setProgressValue(0);
              startTimer();
            }
            setCurrentIndex(0);
            setSelectedUserStatuses(img_objects);
            setPreview(true);
          }}
        >
          <View style={styles.status_view}>
            <Image
              source={{ uri: item.userProfile }}
              style={[
                styles.userProfile_status,
                {
                  borderWidth: item.statuses?.length > 0 ? wp(3) : wp(0),
                  borderColor: isAllViewed ? 'grey' : colors.green,
                },
              ]}
            />
            <Text style={{ color: theme.colors.texts }}>
              {item.userName} ({totalImages})
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderUsersStatus = ({ item }) => {
    const totalImages =
      item?.statuses
        ?.map(statusObj =>
          statusObj.image_status
            ?.map(imgStatus => imgStatus.image?.length || 0)
            .reduce((a, b) => a + b, 0),
        )
        .reduce((a, b) => a + b, 0) ?? 0;

    const img_objects = item.statuses.flatMap(statusObj =>
      statusObj.image_status.map((img, idx) => ({
        url: Array.isArray(img.image) ? img.image[0].url : img.image?.url,
        user_name: item.userName,
        profile_pic: item.userProfile,
        sender_id: item.userId,
        statusDocId: statusObj.id,
        imageIndex: idx,
        viewedBy: img.viewedBy || [],
      })),
    );

    const currentUserId = auth().currentUser?.uid;
    const isAllViewed = item.statuses.every(st =>
      st.image_status.every(img => img.viewedBy?.includes(currentUserId)),
    );

    {
      return (
        <TouchableOpacity
          onPress={() => {
            if (progressPaused) {
              setProgressPaused(false);
              setProgressValue(0);
              startUserPreviewTimer();
            }
            setSelectedUserStatuses(img_objects),
              setCurrentIndex(0),
              setUserPreview(!user_preview);
          }}
        >
          <View style={styles.status_view_h}>
            <View style={[styles.userProfile_status, { marginRight: wp(8) }]}>
              <Image
                source={{ uri: item.userProfile }}
                style={[
                  styles.userProfile_status,
                  {
                    borderWidth: item.statuses?.length > 0 ? wp(3) : wp(0),
                    borderColor: isAllViewed ? 'grey' : colors.green,
                  },
                ]}
              />
            </View>
            <Text style={{ color: theme.colors.texts }}>
              {item.userName} ({totalImages})
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const addUserData = async userData => {
    if (user) {
      const uid = user;
      firestore()
        .collection('users')
        .doc(uid)
        .set({
          firstname: firstname,
          img: img,
          lastname: lastname,
          phone: phone,
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
      setModalVisible(true);
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
    }
  };

  const handlePrev = () => {
    if (current_index > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgressValue(0);
    }
  };

  const handleNext = () => {
    if (current_index < selectedUserStatuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgressValue(0);
    } else {
      setUserPreview(false);
      setProgressValue(0);
    }
  };

  const handleNext_current = () => {
    if (current_index < selectedUserStatuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgressValue(0);
    } else {
      setCurrentUser_preview(false);
      setProgressValue(0);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header_color}>
        {showSearchinput ? (
          <View style={styles.search_text}>
            <TextInput
              ref={replyStatus}
              value={search}
              onChangeText={handleSearch}
              placeholder="Ask Meta AI or Search..."
              placeholderTextColor={colors.white}
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
              <TouchableOpacity onPress={toggleModal}>
                <Image source={images.settings} style={styles.settings} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.chats_header}>
          <TouchableOpacity onPress={() => Alert.alert('Coming soon')}>
            <Image source={images.camera} />
          </TouchableOpacity>
          {wp_categories.map(item => (
            <TouchableOpacity
              style={[
                styles.categories_header,
                {
                  borderBottomWidth: selectedItem === item.id ? 2 : 0,
                  borderBottomColor:
                    selectedItem === item.id ? colors.white : '',
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
      {users.length > 0 ? (
        selectedItem === 1 ? (
          <FlatList
            style={{ flex: 1 }}
            data={selectedItem === 1 && filteredData}
            renderItem={selectedItem === 1 && renderItem1}
            keyExtractor={item => item.id.toString()}
            ItemSeparatorComponent={
              selectedItem === 1 && <View style={styles.user_listSeprator} />
            }
            ListEmptyComponent={
              search.length > 0 && (
                <View style={styles.empty_list}>
                  <Text style={styles.noContacts}>{texts.no_contacts}</Text>
                </View>
              )
            }
          />
        ) : selectedItem === 2 ? (
          <View style={styles.status_rendering}>
            <View style={styles.status_list}>
              <TouchableOpacity
                style={styles.status_view}
                onPress={() => setUserModal(true)}
              >
                <Image
                  source={{ uri: find_user.img }}
                  style={[
                    styles.status_pic,
                    {
                      borderWidth: currentUserStatus.length > 0 ? 3 : 0,
                      borderColor:
                        currentUserStatus.length > 0 ? colors.green : '',
                    },
                  ]}
                />
                <View style={styles.add_status}>
                  <Image source={images.plus} style={styles.add_status_icon} />
                </View>
                <Text style={{ color: theme.colors.texts }}>
                  {find_user.firstname}
                </Text>
              </TouchableOpacity>
              <FlatList
                data={allStatus}
                renderItem={renderStatus}
                keyExtractor={item => item.id}
                horizontal
              />
            </View>
            <View style={styles.recent_updateHeader}>
              <Text
                style={[
                  styles.recentUpdate_text,
                  { color: theme.colors.texts },
                ]}
              >
                {texts.recent_update}
              </Text>
              <FlatList
                data={allStatus}
                renderItem={renderUsersStatus}
                keyExtractor={item => item.id}
              />
            </View>
          </View>
        ) : (
          selectedItem === 3 && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: fontSize(16), fontWeight: 'bold' }}>
                {texts.coming_soon}
              </Text>
            </View>
          )
        )
      ) : (
        <View style={styles.initialHeader}>
          <Image source={images.first} />
          <Text style={styles.chat_text}>{texts.chat_yet}</Text>
          <TouchableOpacity style={styles.start_chatting}>
            <Text style={styles.start_btn}>{texts.start}</Text>
          </TouchableOpacity>
        </View>
      )}
      (
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
            <Text>{texts.submit}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      )
      <Modal
        isVisible={preview}
        style={{ margin: 0 }}
        statusBarTranslucent
        onBackdropPress={() => setPreview(!preview)}
      >
        <StatusBar barStyle="light-content" />

        <TouchableWithoutFeedback
          onPress={() => {
            replyStatus.current?.blur();
            Keyboard.dismiss();
            if (progressPaused) {
              resumeProgress();
            }
            if (progressPaused && reply.trim() === '') {
              resumeProgress();
            }
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.dd,
            }}
          >
            {selectedUserStatuses.length > 0 ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: selectedUserStatuses[current_index]?.url }}
                  style={styles.status_imgPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.back_status}
                  disabled={isFocused}
                  activeOpacity={1}
                  onPress={() => {
                    stopProgress();
                    progressAnim.setValue(0);
                    clearInterval(timer.current);
                    if (current_index > 0) {
                      setCurrentIndex(prev => {
                        const new_index = prev - 1;
                        statusIndex.current = new_index;
                        return new_index;
                      });
                    } else {
                      if (userIndex.current > 0) {
                        userIndex.current -= 1;
                        statusIndex.current = 0;
                        const prevUserStatuses =
                          allStatus[userIndex.current]?.statuses?.flatMap(
                            statusObj =>
                              statusObj.image_status?.flatMap(
                                imgStatus =>
                                  imgStatus.image?.map(img => img.url) || [],
                              ),
                          ) || [];

                        const img_objects = prevUserStatuses.map(url => ({
                          url,
                          user_name: allStatus[userIndex.current]?.userName,
                          profile_pic:
                            allStatus[userIndex.current]?.userProfile,
                          sender_id: allStatus[userIndex.current]?.userId,
                        }));
                        setSelectedUserStatuses(img_objects);
                        setCurrentIndex(prevUserStatuses.length - 1);
                      }
                    }
                    setProgressValue(0);
                    resumeProgress();
                  }}
                />

                <TouchableOpacity
                  style={styles.back_nextbtn}
                  disabled={isFocused}
                  activeOpacity={1}
                  onPress={() => {
                    stopProgress();
                    progressAnim.setValue(0);
                    clearInterval(timer.current);
                    if (current_index < selectedUserStatuses.length - 1) {
                      setCurrentIndex(prev => {
                        const new_index = prev + 1;
                        statusIndex.current = new_index;
                        return new_index;
                      });
                    } else {
                      if (userIndex.current < allStatus.length - 1) {
                        userIndex.current += 1;
                        statusIndex.current = 0;
                        const nextUserStatuses =
                          allStatus[userIndex.current]?.statuses?.flatMap(
                            statusObj =>
                              statusObj.image_status?.flatMap(
                                imgStatus =>
                                  imgStatus.image?.map(img => img.url) || [],
                              ),
                          ) || [];
                        const img_objects = nextUserStatuses.map(url => ({
                          url,
                          user_name: allStatus[userIndex.current]?.userName,
                          profile_pic:
                            allStatus[userIndex.current]?.userProfile,
                          sender_id: allStatus[userIndex.current]?.userId,
                        }));

                        setSelectedUserStatuses(img_objects);
                        setCurrentIndex(0);
                      } else {
                        setPreview(false);
                      }
                    }
                    setProgressValue(0);
                    resumeProgress();
                  }}
                />
              </View>
            ) : (
              <ActivityIndicator size="large" color="white" />
            )}

            <View style={styles.progress_bar}>
              {selectedUserStatuses.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progress_view,
                    { backgroundColor: colors.gray, overflow: 'hidden' },
                  ]}
                >
                  {index === current_index && (
                    <Animated.View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }}
                    />
                  )}
                  {index < current_index && (
                    <View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: '100%',
                      }}
                    />
                  )}
                </View>
              ))}
            </View>

            {selectedUserStatuses.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    replyStatus.current?.blur();
                    Keyboard.dismiss();
                    clearInterval(timer.current);
                    setReply(''), setPreview(!preview);
                  }}
                >
                  <Image source={images.back_btn} style={styles.backbtn} />
                </TouchableOpacity>

                <Image
                  source={{
                    uri: selectedUserStatuses[current_index].profile_pic,
                  }}
                  style={{
                    width: wp(36),
                    height: wp(36),
                    borderRadius: wp(18),
                  }}
                />
                <Text
                  style={{
                    color: colors.white,
                    marginLeft: wp(10),
                    fontSize: fontSize(18),
                  }}
                >
                  {selectedUserStatuses[current_index].user_name}
                </Text>
              </View>
            )}
            {selectedUserStatuses.length > 0 && (
              <View
                style={{
                  paddingHorizontal: wp(10),
                  position: 'absolute',
                  bottom: 70,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TextInput
                  ref={status_reply}
                  value={reply}
                  placeholder="Reply..."
                  placeholderTextColor={colors.white}
                  onChangeText={handleReply}
                  onFocus={() => {
                    stopProgress(), setIsFocused(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  style={{
                    flex: 1,
                    color: colors.white,
                    borderWidth: 1,
                    borderColor: colors.white,
                    borderRadius: wp(16),
                    marginRight: wp(5),
                    paddingHorizontal: wp(10),
                  }}
                />
                {reply.length && (
                  <TouchableOpacity
                    style={{
                      width: wp(36),
                      height: wp(36),
                      borderRadius: wp(18),
                      backgroundColor: colors.green,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={handleSendMessage}
                  >
                    <Image source={images.send} style={styles.send_icon} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        isVisible={user_preview}
        onBackdropPress={() => setUserPreview(false)}
        style={{ margin: 0 }}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            status_reply.current?.blur();
            Keyboard.dismiss();
            if (progressPaused) {
              resume_Progress();
            }
            if (progressPaused && statusReply.trim() === '') {
              resume_Progress();
            }
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'black',
            }}
          >
            {selectedUserStatuses.length > 0 && (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: selectedUserStatuses[current_index].url }}
                  style={styles.status_imgPreview}
                  resizeMode="cover"
                />
                {/* back button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '50%',
                  }}
                  disabled={focused}
                  activeOpacity={1}
                  onPress={handlePrev}
                />
                {/* next button */}
                <TouchableOpacity
                  style={styles.back_nextbtn}
                  disabled={focused}
                  activeOpacity={1}
                  onPress={handleNext}
                />
              </View>
            )}

            <View style={styles.progress_bar}>
              {selectedUserStatuses.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progress_view,
                    { backgroundColor: colors.gray, overflow: 'hidden' },
                  ]}
                >
                  {index === current_index && (
                    <Animated.View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }}
                    />
                  )}
                  {index < current_index && (
                    <View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: '100%',
                      }}
                    />
                  )}
                </View>
              ))}
            </View>

            {selectedUserStatuses.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    clearTimeout(timer.current),
                      setProgressValue(0),
                      setStatusReply(''),
                      setUserPreview(false);
                  }}
                >
                  <Image source={images.back_btn} style={styles.backbtn} />
                </TouchableOpacity>
                <Image
                  source={{
                    uri: selectedUserStatuses[current_index].profile_pic,
                  }}
                  style={{
                    width: wp(36),
                    height: wp(36),
                    borderRadius: wp(18),
                  }}
                />
                <Text
                  style={{
                    color: colors.white,
                    marginLeft: wp(10),
                    fontSize: fontSize(18),
                  }}
                >
                  {selectedUserStatuses[current_index].user_name}
                </Text>
              </View>
            )}
            {selectedUserStatuses.length > 0 && (
              <View
                style={{
                  paddingHorizontal: wp(10),
                  position: 'absolute',
                  bottom: 70,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TextInput
                  value={statusReply}
                  placeholder="Reply..."
                  placeholderTextColor={colors.white}
                  onChangeText={txt => setStatusReply(txt)}
                  onFocus={() => {
                    stop_Progress(), setFocused(true);
                  }}
                  onBlur={() => setFocused(false)}
                  style={{
                    flex: 1,
                    color: colors.white,
                    borderWidth: 1,
                    borderColor: colors.white,
                    borderRadius: wp(16),
                    marginRight: wp(5),
                    paddingHorizontal: wp(10),
                  }}
                />
                <TouchableOpacity
                  style={{
                    width: wp(36),
                    height: wp(36),
                    borderRadius: wp(18),
                    backgroundColor: colors.green,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    handleStatusMessage();
                  }}
                >
                  <Image source={images.send} style={styles.send_icon} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        isVisible={currentUser_preview}
        onBackdropPress={() => setCurrentUser_preview(false)}
        style={{ margin: 0 }}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            if (progressPaused) {
              resumeCurrent_progress();
            }
          }}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'black',
            }}
          >
            {selectedUserStatuses.length > 0 && (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: selectedUserStatuses[current_index].url }}
                  style={styles.status_imgPreview}
                  resizeMode="cover"
                />
                {/* back button */}
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '50%',
                  }}
                  disabled={isFocused}
                  activeOpacity={1}
                  onPress={handlePrev}
                />
                {/* next button */}
                <TouchableOpacity
                  style={styles.back_nextbtn}
                  disabled={isFocused}
                  activeOpacity={1}
                  onPress={handleNext_current}
                />
              </View>
            )}

            <View style={styles.progress_bar}>
              {selectedUserStatuses.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progress_view,
                    { backgroundColor: colors.gray, overflow: 'hidden' },
                  ]}
                >
                  {index === current_index && (
                    <Animated.View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }}
                    />
                  )}
                  {index < current_index && (
                    <View
                      style={{
                        backgroundColor: colors.white,
                        height: '100%',
                        width: '100%',
                      }}
                    />
                  )}
                </View>
              ))}
            </View>

            {selectedUserStatuses.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 5,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    clearTimeout(timer.current), setCurrentUser_preview(false);
                  }}
                >
                  <Image source={images.back_btn} style={styles.backbtn} />
                </TouchableOpacity>
                <Image
                  source={{
                    uri: selectedUserStatuses[current_index].profile_pic,
                  }}
                  style={{
                    width: wp(36),
                    height: wp(36),
                    borderRadius: wp(18),
                  }}
                />
                <Text
                  style={{
                    color: colors.white,
                    marginLeft: wp(10),
                    fontSize: fontSize(18),
                  }}
                >
                  {selectedUserStatuses[current_index].user_name}
                </Text>
              </View>
            )}

            {selectedUserStatuses.length > 0 && (
              <TouchableOpacity
                style={{
                  paddingHorizontal: wp(10),
                  position: 'absolute',
                  bottom: 70,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Image
                  source={images.eye_lash}
                  tintColor="white"
                  style={{ width: wp(30), height: hp(30) }}
                />

                {/* <Text style={{ color: colors.white, marginLeft: wp(2) }}>
                </Text> */}
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        isVisible={isVisible}
        style={{ justifyContent: 'flex-end', margin: 0 }}
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
            contentContainerStyle={styles.list_imgs}
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
              onPress={() => {
                sendPhotos(user, selectedImg);
              }}
            >
              <Text style={{ color: colors.white }}>{texts.send}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      <Modal
        isVisible={user_modal}
        style={[styles.modal_open, { margin: 0 }]}
        onBackdropPress={() => setUserModal(!user_modal)}
      >
        <View style={styles.user_modal_view}>
          <TouchableOpacity
            style={styles.add_status_btn}
            onPress={() => setVisible(!isVisible)}
          >
            <Text style={styles.addStatus_text}>{texts.add_status}</Text>
          </TouchableOpacity>
          {currentUserStatus.length > 0 && (
            <TouchableOpacity
              style={[styles.add_status_btn, { marginBottom: wp(10) }]}
              onPress={() => {
                if (currentUserStatus.length > 0) {
                  const img_objects = currentUserStatus.map(url => ({
                    url,
                    user_name: find_user.firstname,
                    profile_pic: find_user.img,
                    sender_id: find_user.id,
                  }));

                  setSelectedUserStatuses(img_objects);
                  setCurrentIndex(0);
                  setCurrentUser_preview(true);
                } else {
                  setCurrentUser_preview(false);
                  Alert.alert('No status update available');
                }
                setUserModal(false);
              }}
            >
              <Text style={styles.addStatus_text}>{texts.view_status}</Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
      <Modal
        isVisible={setting_modal}
        animationIn="slideInDown"
        animationOut="slideOutRight"
        backdropOpacity={0}
        onBackdropPress={() => setSettingModal(!setting_modal)}
        style={styles.whatsApp_header}
      >
        <View style={styles.setting_modal}>
          <TouchableOpacity style={styles.profileText_margin}>
            <Text style={styles.text_size}>{texts.profile}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingsScreen'),
                setSettingModal(!setting_modal);
            }}
          >
            <Text style={styles.text_size}>{texts.settings}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default InitialchatScreen;

const styles = StyleSheet.create({
  back_status: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  back_nextbtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  text_size: { fontSize: fontSize(16) },
  profileText_margin: { marginBottom: hp(20) },
  setting_modal: {
    backgroundColor: colors.white,
    position: 'absolute',
    top: 20,
    right: 0,
    padding: wp(20),
    alignItems: 'center',
    borderRadius: wp(16),
    borderWidth: wp(1),
  },
  addStatus_text: { fontSize: fontSize(16), textAlign: 'center' },
  add_status_btn: {
    backgroundColor: colors.white,
    borderRadius: wp(16),
    paddingHorizontal: wp(10),
    borderWidth: wp(1),
    padding: wp(10),
    marginTop: hp(10),
  },
  send_photos: {
    backgroundColor: colors.dd,
    padding: wp(10),
    marginTop: hp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUpdate_text: { fontSize: fontSize(15), marginBottom: hp(10) },
  recent_updateHeader: { marginTop: hp(10) },
  add_status_icon: { width: wp(10), height: wp(10) },
  status_rendering: { paddingHorizontal: wp(10), paddingVertical: hp(20) },
  status_view_h: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: hp(8),
  },
  backbtn: { tintColor: colors.white, width: wp(20), height: wp(20) },
  status_view: { alignItems: 'center', marginRight: wp(8) },
  userProfile_status: { width: wp(66), height: wp(66), borderRadius: wp(33) },
  add_status: {
    backgroundColor: colors.green,
    position: 'absolute',
    top: 55,
    right: 5,
    borderRadius: wp(9),
    borderColor: colors.white,
    borderWidth: wp(1),
    width: wp(18),
    height: wp(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  send_icon: {
    tintColor: 'white',
    width: wp(15),
    height: wp(15),
    resizeMode: 'contain',
  },
  status_imgPreview: { width: wp(375), height: hp(500) },
  progress_view: {
    flex: 1,
    height: hp(3),
    marginHorizontal: wp(1),
    borderRadius: wp(2),
  },
  progress_bar: {
    flexDirection: 'row',
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 0,
  },
  gallery_imgList: {
    backgroundColor: colors.white,
    borderTopLeftRadius: wp(16),
    borderTopRightRadius: wp(16),
    padding: wp(5),
    alignContent: 'center',
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
  list_imgs: { backgroundColor: colors.white },
  selecting_img: {
    marginTop: hp(10),
    width: wp(50),
    height: hp(50),
    borderRadius: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  modal_viewStyle: {
    flex: 1,
  },
  user_modal_view: {
    backgroundColor: 'white',
    paddingHorizontal: wp(20),
    borderTopRightRadius: wp(16),
    borderTopLeftRadius: wp(16),
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

  status_pic_view: {
    width: wp(66),
    height: wp(66),
    borderRadius: wp(33),
    alignItems: 'center',
  },
  status_pic: {
    width: wp(66),
    height: wp(66),
    borderRadius: wp(33),
  },

  user_pic: { width: wp(20), height: wp(20), borderRadius: wp(10) },
  user_list: {
    paddingVertical: hp(15),
    paddingHorizontal: wp(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  modal_open: { justifyContent: 'flex-end' },
  status_list: {
    flexDirection: 'row',
  },
  selected_img: {
    width: wp(150),
    height: hp(150),
    margin: wp(10),
    marginTop: hp(10),
    borderRadius: wp(16),
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
  atach_img: {
    width: wp(90),
    height: wp(90),
    marginHorizontal: wp(10),
    marginVertical: hp(5),
  },
  gallery_img: {
    width: wp(150),
    height: hp(150),
    borderRadius: wp(16),
  },
  added_images: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  header_color: { backgroundColor: colors.darkgreen },
  container: { flex: 1 },
});
