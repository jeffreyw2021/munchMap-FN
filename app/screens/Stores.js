import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, ScrollView, Alert, Touchable } from 'react-native';
import styles from '../styles/storesStyle';
import { getSavedPlacesTable, getWishlistsTable, getTable } from '../api/fetchNearbyPlaces';
import Picko from '../assets/images/picko.png';
import dot from '../assets/images/dot.png';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGear, faPlus, faPen, faCheck, faAngleLeft, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LeftSwipeCard from '../components/leftSwipeCard';
import WishlistCard from '../components/wishlist';
import { createWishlist, removePlaceFromWishlist } from '../config/sqlite';

export default function Stores({ route, navigation }) {

    const setRandomChoice = route.params?.setRandomChoice;
    const props = route.params?.storeProps;

    useEffect(()=>{
        getWishlists();
    },[props.renewWishlistFlag])

    const [savedPlaces, setSavedPlaces] = useState(null);
    const [checkSavedPlacesFlag, setCheckSavedPlacesFlag] = useState(false);
    const [wishlists, setWishlists] = useState(null);
    useEffect(() => {
        getSavedPlacesTable()
            .then(places => {
                setSavedPlaces(places);
            })
            .catch(error => {
                console.error('Failed to fetch saved places: ', error);
            });
        getWishlists();
    }, [defaultOn]);
    useEffect(()=>{
        console.log("savedPlaces: ", savedPlaces);
    },[savedPlaces])

    const [defaultOn, setDefaultOn] = useState(true);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const getWishlists = () => {
        getWishlistsTable()
            .then(wishlists => {
                const processedWishlists = wishlists.map(wishlist => ({
                    ...wishlist,
                    wishlistPlacesId: wishlist.wishlistPlacesId ? wishlist.wishlistPlacesId.split(',').map(Number) : []
                }));
                setWishlists(processedWishlists);
            })
            .catch(error => {
                console.error('Failed to fetch wishlists: ', error);
            });
    }
    useEffect(() => {
        console.log("wishlists: ", wishlists);
    }, [wishlists]);

    const cardRefs = useRef([]);
    useEffect(() => {
        if (savedPlaces && savedPlaces.length > 0) {
            cardRefs.current = savedPlaces.map((_, i) => cardRefs.current[i] || React.createRef());
        }
        props.setGlobalSavedPlaces(savedPlaces);
    }, [savedPlaces]);
    const resetScrollPositions = () => {
        cardRefs.current.forEach(ref => {
            ref.current?.scrollTo({ x: 0, animated: false });
        });
    };

    const [createNewListBtnPressing, setCreateNewListBtnPressing] = useState(false);
    const [editBtnPressing, setEditBtnPressing] = useState(false);

    const showCreateListAlert = () => {
        Alert.prompt(
            "Create New Wishlist",
            "Enter the name of your new wishlist:",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Create",
                    onPress: (wishlistName) => {
                        createWishlist(wishlistName);
                        getWishlists();
                    }
                }
            ],
            "plain-text"
        );
    };

    const [isPressingListEdit, setIsPressingListEdit] = useState(false);
    const [wishlistReRenderFlag, setWishlistReRenderFlag] = useState(false);

    useEffect(() => {
        console.log("wishlistReRenderFlag: ", wishlistReRenderFlag);
        getWishlists();
    }, [wishlistReRenderFlag]);
    
    return (
        <View style={styles.container}>
            <View style={{ flex: 1, width: '100%' }}>

                <View style={styles.topContainer}>
                    <ImageBackground
                        source={dot}
                        style={styles.background}
                        resizeMode="repeat"
                    />
                    <View style={styles.userInfo}>
                        <View style={styles.userInfoContent}>
                            
                            {/* <View style={styles.userInfoTop}>
                                <View style={styles.userInfoLeft}>
                                    <Image source={Picko} style={styles.avatar} />
                                    <View style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: 3 }}>
                                        <Text style={{ fontSize: 16, fontWeight: 600 }}>
                                            Guest
                                        </Text>
                                        <Text style={{ fontSize: 12, color: '#8C8C8C' }}>
                                            UID: null
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ height: '100%', justifyContent: 'flex-start' }}>
                                    <FontAwesomeIcon icon={faGear} size={20} color={'#222'} />
                                </View>
                            </View>
                            <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', columnGap: 10 }}>
                                <View style={styles.progressBar}>
                                    <View style={{ width: `${0}%` }} />
                                </View>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>Lv.0</Text>
                                <FontAwesomeIcon icon={faCircleQuestion} size={16} />
                            </View> */}
                        </View>
                        <View style={styles.userInfoShadow} />
                    </View>
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-start', width: '100%' }}>
                    <View style={styles.listSwitch}>
                        <TouchableOpacity
                            style={styles.listSwitchBtn}
                            onPress={() => {
                                setDefaultOn(true);
                                props.setSelectedList(null);
                                hapticFeedback();
                            }}
                        >
                            <Text style={{ fontWeight: defaultOn ? 600 : 500, fontSize: 13 }}>All Saved</Text>
                            {defaultOn && (
                                <LinearGradient
                                    style={styles.listSwitchActive}
                                    colors={['#98FF47', '#D0FF6B']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.listSwitchBtn}
                            onPress={() => {
                                setDefaultOn(false);
                                props.setSelectedList(null);
                                hapticFeedback();
                            }}
                        >
                            <Text style={{ fontWeight: !defaultOn ? 600 : 500, fontSize: 13 }}>Wishlists</Text>
                            {!defaultOn && (<LinearGradient
                                style={styles.listSwitchActive}
                                colors={['#98FF47', '#D0FF6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            />)}
                        </TouchableOpacity>
                    </View>

                    {defaultOn ? (
                        <View style={{ flex: 1, width: '100%' }}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                style={{ width: '100%' }}
                            >
                                {savedPlaces && savedPlaces.map(
                                    (place, index) => {
                                        const isFirstItem = index === 0;
                                        const isLastItem = index === savedPlaces.length - 1;

                                        return (
                                            <LeftSwipeCard
                                                key={index}
                                                ref={cardRefs.current[index]}
                                                props={{
                                                    place,
                                                    isFirstItem,
                                                    isLastItem,
                                                    setRandomChoice,
                                                    resetScrollPositions,
                                                    setSavedPlaces
                                                }}
                                                getWishlists={getWishlists}
                                            />
                                        );
                                    }
                                )}
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={{ flex: 1, width: '100%' }}>
                            {!props.selectedList ? (
                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    style={{ width: '100%' }}
                                >
                                    <View style={styles.wishlistTop}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            onPressIn={() => { setCreateNewListBtnPressing(true); }}
                                            onPressOut={() => { setCreateNewListBtnPressing(false); }}
                                            onPress={() => {
                                                showCreateListAlert();
                                            }}
                                        >
                                            <View style={[styles.addWishlistBtnContent, createNewListBtnPressing && { top: 3 }]}>
                                                <FontAwesomeIcon icon={faPlus} size={16} />
                                                <Text style={{ fontSize: 15, fontWeight: 600 }}>Create New List</Text>
                                            </View>
                                            <View style={styles.addWishlistBtnShadow} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 7, gap: 12 }}>
                                        {(wishlists && wishlists.map(
                                            (list, index) => {
                                                return (
                                                    <WishlistCard key={index} list={list} setSelectedList={props.setSelectedList} />
                                                )
                                            }
                                        )
                                        )}
                                    </View>
                                </ScrollView>
                            ) : (
                                <View style={{ flex: 1, width: '100%' }}>
                                    <View style={styles.wishlistTop}>
                                        <TouchableOpacity
                                            onPress={() => {
                                                props.setSelectedList(null);
                                                hapticFeedback();
                                            }}
                                            style={{ flexDirection: 'row', alignItems: 'center' }}
                                        >
                                            <FontAwesomeIcon icon={faAngleLeft} size={20} />
                                            <Text style={{ fontSize: 16, fontWeight: 500 }}>Back</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView
                                        showsVerticalScrollIndicator={false}
                                        style={{ width: '100%' }}
                                    >
                                        <View style={{ gap: 30, width: '100%', paddingHorizontal: 25, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e9e9e9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <Text
                                                style={{ flex: 1, overflow: 'hidden', fontWeight: 700, fontSize: 20, textTransform: 'capitalize' }}
                                                numberOfLines={1}
                                            >
                                                {props.selectedList.listName}
                                            </Text>
                                            <TouchableOpacity
                                                activeOpacity={1}
                                                onPressIn={() => setIsPressingListEdit(true)}
                                                onPressOut={() => setIsPressingListEdit(false)}
                                                onPress={() => {
                                                    hapticFeedback();
                                                    props.setEditList(true);
                                                }}
                                            >
                                                <View style={[styles.editWishlistBtnContent, isPressingListEdit && { top: 3 }]}>
                                                    <FontAwesomeIcon icon={faEllipsis} size={16} />
                                                </View>
                                                <View style={styles.editWishlistBtnShadow} />
                                            </TouchableOpacity>
                                        </View>

                                        {props && props.selectedList?.wishlistPlacesId.map(
                                            (placeId, index) => {
                                                const place = savedPlaces.find(p => p.id === placeId);
                                                const selectedList = props.selectedList;
                                                if(!place) return null;
                                                return (
                                                    <LeftSwipeCard
                                                        key={index}
                                                        ref={cardRefs.current[index]}
                                                        props={{
                                                            place,
                                                            isFirstItem: index === 0,
                                                            isLastItem: index === props.selectedList.wishlistPlacesId.length - 1,
                                                            setRandomChoice,
                                                            resetScrollPositions,
                                                            selectedList
                                                        }}
                                                        getWishlists={getWishlists}
                                                        isInWishlist={true}
                                                    />
                                                );
                                            }
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View >
            <View style={styles.bottomPadding} />
        </View >
    );
}