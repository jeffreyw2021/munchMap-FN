import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing, Alert, Dimensions } from 'react-native';
import styles from '../styles/storesStyle';
import { getSavedPlacesTable } from '../api/fetchNearbyPlaces';
import Picko from '../assets/images/picko.png';
import dot from '../assets/images/dot.png';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGear, faPlus, faPen, faCheck, faAngleLeft, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LeftSwipeCard from '../components/leftSwipeCard';
import WishlistCard from '../components/wishlist';
import { createWishlist, deleteWishlist, renameWishtlist, addPlaceToWishlist } from '../config/sqlite';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default function EditListModal({ props }) {

    const position = useRef(new Animated.Value(500)).current;
    useEffect(() => {
        if (props) {
            Animated.timing(position, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [props]);
    const cancelEdit = () => {
        Animated.timing(position, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            props.setEditList(false);
        });
    };
    const moveModalDown = () => {
        Animated.timing(position, {
            toValue: 2000,
            duration: 200,
            useNativeDriver: true
        }).start();
    }

    const showDeleteAlert = (listId) => {
        Alert.alert(
            "Delete this wishlist?",
            "Are you sure you want to delete this wishlist?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteList(listId);
                    }
                }
            ],
            { cancelable: true }
        );
    };
    const deleteList = (listId) => {
        cancelEdit();
        props.setSelectedList(null);
        deleteWishlist(listId);
    }

    const showRenameAlert = (listId) => {
        Alert.prompt(
            "Rename this wishlist",
            "Enter a new name for this wishlist",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Rename",
                    style: "destructive",
                    onPress: (newName) => {
                        renameList(listId, newName);
                    }
                }
            ],
            "plain-text"
        );
    }
    const renameList = (listId, newName) => {
        cancelEdit();
        props.setSelectedList(null);
        renameWishtlist(listId, newName);
    }

    const [addStore, setAddStore] = useState(false);
    const addStorePosition = useRef(new Animated.Value(screenWidth)).current;
    useEffect(() => {
        if (addStore) {
            Animated.timing(addStorePosition, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [addStore]);
    const closeAddStore = () => {
        Animated.timing(addStorePosition, {
            toValue: screenWidth,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            cancelEdit();
            setAddStore(false);
        });
    }

    const [savedPlaces, setSavedPlaces] = useState(props.globalSavedPlaces);
    useEffect(() => {
        if (props.globalSavedPlaces) {
            setSavedPlaces(props.globalSavedPlaces);
        }
    }, [props.globalSavedPlaces]);

    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const processDetail = (detail, processData = true) => {
        let attributesToCheck = ['amenity', 'cuisine', 'craft', 'shop'];
        let output = [];

        if (detail && detail.attributes) {
            const attributes = typeof detail.attributes === 'string' ? JSON.parse(detail.attributes) : detail.attributes;
            if (processData && attributes['cuisine'] && attributes['cuisine'] !== '') {
                attributesToCheck = ['cuisine', 'craft', 'shop'];
            }

            attributesToCheck.forEach(attr => {
                if (attributes[attr]) {
                    if (attr === 'cuisine') {
                        output.push(...attributes[attr].split(';').map(item => item.replace(/_/g, ' ')));
                    } else {
                        output.push(attributes[attr].replace(/_/g, ' '));
                    }
                }
            });
        }

        return output.slice(0, 3);
    };

    const [isAddModalCancelPressing, setAddModalCancelPressing] = useState(false);
    const [isAddModalAddPressing, setAddModalAddPressing] = useState(false);

    const [pendingWishlistPLacesId, setPendingWishlistPLacesId] = useState([]);
    useEffect(() => {
        console.log(pendingWishlistPLacesId);
    }, [pendingWishlistPLacesId]);
    const addPlaceToPendingList = (placeId) => {
        setPendingWishlistPLacesId([...pendingWishlistPLacesId, placeId]);
    }
    const removedPlaceFromPendingList = (placeId) => {
        setPendingWishlistPLacesId(pendingWishlistPLacesId.filter(id => id !== placeId));
    }
    const addPlacesToWishlist = (listId) => {
        let promises = pendingWishlistPLacesId.map(placeId => addPlaceToWishlist(listId, placeId));
    
        Promise.all(promises)
            .then(() => {
                props.renewSelectedList(listId); 
                closeAddStore();
            })
            .catch(error => {
                console.error("Error adding places to wishlist:", error);
            });
    };
    

    return (
        <View style={styles.overcast}>
            <TouchableOpacity
                style={{ flex: 1, width: '100%' }}
                onPress={() => {
                    cancelEdit();
                }}
            />

            <Animated.View style={[styles.addStoreModal, {
                transform: [{ translateX: addStorePosition }]
            }]}>
                <View style={styles.addStoreTitle}>
                    <TouchableOpacity
                        style={styles.addModalBack}
                        onPress={() => {
                            closeAddStore();
                        }}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} size={24} color={'#000'} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, flexDirection: 'row', gap: 0, alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 500, textTransform: 'capitalize', flexDirection: 'row', flexWrap: 'nowrap' }}>
                            Select For "
                        </Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: screenWidth - 240, overflow: 'hidden', fontSize: 16, fontWeight: 500, textTransform: 'capitalize', flexDirection: 'row', flexWrap: 'nowrap' }}>
                            {props.selectedList?.listName}
                        </Text>
                        <Text style={{ fontSize: 16, fontWeight: 500, textTransform: 'capitalize', flexDirection: 'row', flexWrap: 'nowrap' }}>"</Text>
                    </View>
                    <FontAwesomeIcon icon={faAngleLeft} size={24} color={'#000'} style={{ opacity: 0 }} />
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 12, paddingTop: 12 }}
                    showsVerticalScrollIndicator={false}
                >
                    {savedPlaces && savedPlaces.map((place, index) => {

                        const tagsString = processDetail(place, false).slice(0, 3).join(', ');

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    { paddingHorizontal: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                                    (index !== savedPlaces.length - 1) && { borderBottomColor: '#E9E9E9', borderBottomWidth: 1 }
                                ]}
                                onPress={() => {
                                    hapticFeedback();
                                    if (pendingWishlistPLacesId.includes(place.id)) {
                                        removedPlaceFromPendingList(place.id);
                                    } else {
                                        addPlaceToPendingList(place.id);
                                    }
                                }}
                            >
                                <View style={[styles.addModalPlaceCard]}>
                                    <View style={styles.placeCardEmoji}>
                                        <Text style={{ fontSize: 28 }}>{place.emoji}</Text>
                                    </View>
                                    <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', rowGap: 5 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 600 }} ellipsizeMode='tail'>{place.name}</Text>
                                        <Text style={{ fontSize: 13, color: '#8C8C8C' }}>{tagsString}</Text>
                                    </View>
                                </View>

                                <View style={[styles.placeCheckbox, pendingWishlistPLacesId.includes(place.id) && {borderColor: '#fff'}]}>
                                    {pendingWishlistPLacesId.includes(place.id) && (
                                        <LinearGradient
                                            style={[styles.placeCheckboxInner]}
                                            colors={['#98FF47', '#D0FF6B']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <FontAwesomeIcon icon={faCheck} size={12} color={'#000'} />
                                        </LinearGradient>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>

                <View style={styles.addModalBottom}>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPressIn={() => setAddModalCancelPressing(true)}
                        onPressOut={() => setAddModalCancelPressing(false)}
                        onPress={() => {
                            hapticFeedback();
                            closeAddStore();
                        }}
                    >
                        <View style={[styles.learnMoreBtnContent, isAddModalCancelPressing && { top: 3 }]}>
                            <Text style={{ fontWeight: '500' }}>Cancel</Text>
                        </View>
                        <View style={styles.learnMoreBtnShadow} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        pointerEvents={pendingWishlistPLacesId.length > 0 ? 'auto' : 'none'}
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPressIn={() => pendingWishlistPLacesId.length > 0 && setAddModalAddPressing(true)}
                        onPressOut={() => pendingWishlistPLacesId.length > 0 && setAddModalAddPressing(false)}
                        onPress={() => {
                            pendingWishlistPLacesId.length > 0 && hapticFeedback();
                            pendingWishlistPLacesId.length > 0 && addPlacesToWishlist(props.selectedList.id);
                        }}
                    >
                        <LinearGradient
                            style={[styles.navigateBtnContent, isAddModalAddPressing && { top: 3 }]}
                            colors={pendingWishlistPLacesId.length > 0 ?
                                ['#98FF47', '#D0FF6B'] : ['#f0f0f0', '#f0f0f0']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={{ fontWeight: '500' }}>Add to List</Text>
                        </LinearGradient>
                        <View style={styles.navigateBtnShadow} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Animated.View style={[styles.editModal, {
                transform: [{ translateY: position }]
            }]}>
                <TouchableOpacity
                    style={[styles.editModalRow, { borderBottomColor: '#E9E9E9', borderBottomWidth: 1 }]}
                    onPress={() => {
                        setAddStore(true);
                        // moveModalDown();
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 400 }}>Add Store</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.editModalRow, { borderBottomColor: '#E9E9E9', borderBottomWidth: 1 }]}
                    onPress={() => {
                        showDeleteAlert(props.selectedList.id);
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 400 }}>Delete List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.editModalRow]}
                    onPress={() => {
                        showRenameAlert(props.selectedList.id);
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 400 }}>Rename List</Text>
                </TouchableOpacity>
                <View style={{ height: 8, width: '100%', backgroundColor: '#f5f5f5' }}></View>
                <TouchableOpacity
                    style={[styles.editModalRow]}
                    onPress={() => {
                        cancelEdit();
                    }}
                >
                    <Text style={{ fontSize: 16, fontWeight: 500 }}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}