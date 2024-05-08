import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/storesStyle';
import { getSavedPlacesTable } from '../api/fetchNearbyPlaces';
import Picko from '../assets/images/picko.png';
import dot from '../assets/images/dot.png';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LeftSwipeCard from '../components/leftSwipeCard';

export default function Stores({ setRandomChoice }) {

    const [savedPlaces, setSavedPlaces] = useState(null);
    const [checkSavedPlacesFlag, setCheckSavedPlacesFlag] = useState(false);
    useEffect(() => {
        getSavedPlacesTable()
            .then(places => {
                setSavedPlaces(places);
            })
            .catch(error => {
                console.error('Failed to fetch saved places: ', error);
            });
    }, [checkSavedPlacesFlag]);
    const [defaultOn, setDefaultOn] = useState(true);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

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
                            <View style={styles.userInfoTop}>
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
                            </View>
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
                                {savedPlaces && savedPlaces.map((place, index) => {
                                    const isFirstItem = index === 0;
                                    const isLastItem = index === savedPlaces.length - 1;

                                    return (
                                        <LeftSwipeCard key={index}
                                            props={{
                                                checkSavedPlacesFlag,
                                                setCheckSavedPlacesFlag,
                                                place,
                                                isFirstItem,
                                                isLastItem,
                                                setRandomChoice
                                            }}
                                        />
                                    );
                                })
                                }
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={{ flex: 1, width: '100%' }}>

                        </View>
                    )}
                </View>
            </View>
            <View style={styles.bottomPadding} />
        </View>
    );
}