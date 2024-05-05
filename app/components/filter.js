import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import styles from '../styles/filterStyle';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function Filter({ props }) {

    const [isPressingApply, setIsPressingApply] = useState(false);
    const [isPressingCancel, setIsPressingCancel] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const [filterJson, setFilterJson] = useState({
        wishlists: ['Default'],
        cuisine: ['All'],
        distance: {
            500: '≤500m',
            1000: '≤1km',
            2000: '≤2km',
            5000: '≤5km',
            10000: '≤10km',
            20000: '≤20km'
        }
    });

    const [pendingFilterDistance, setPendingFilterDistance] = useState(props.filterDistance);

    const position = useRef(new Animated.Value(500)).current;
    useEffect(() => {
        Animated.timing(position, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start();
    }, []);
    const closeFilter = () => {
        Animated.timing(position, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            props.setFilterOn(false);
        });
    };

    return (
        <View style={styles.overcast}>
            <Animated.View style={[styles.filterBlock, {
                transform: [{ translateY: position }]
            }]}>
                <View style={{ justifyContent: 'flex-end', width: '100%' }}>
                    <View style={{ width: '100%' }}>
                        <ScrollView
                            horizontal
                            contentContainerStyle={styles.filterRow}
                            showsHorizontalScrollIndicator={false}
                        >
                            <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Wishlist:</Text>
                            {filterJson.wishlists.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.filterBtn}
                                    onPress={() => { hapticFeedback(); }}
                                >
                                    <View style={styles.filterBtnContent}>
                                        <Text style={{ fontSize: 14 }}>{item}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={[{ width: '100%' }, styles.filterRowBorder]}>
                        <ScrollView
                            horizontal
                            contentContainerStyle={styles.filterRow}
                            showsHorizontalScrollIndicator={false}
                        >
                            <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Cuisine:</Text>
                            {filterJson.cuisine.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.filterBtn}
                                    onPress={() => { hapticFeedback(); }}
                                >
                                    <View style={styles.filterBtnContent}>
                                        <Text style={{ fontSize: 14 }}>{item}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={{ width: '100%' }}>
                        <ScrollView
                            horizontal
                            contentContainerStyle={styles.filterRow}
                            showsHorizontalScrollIndicator={false}
                        >
                            <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Distance:</Text>
                            {Object.keys(filterJson.distance).map((key, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.filterBtn}
                                    onPress={() => {
                                        hapticFeedback();
                                        setPendingFilterDistance(key / 1000);
                                    }}
                                >
                                    {pendingFilterDistance === key / 1000 ?
                                        (
                                            <LinearGradient
                                                style={styles.filterBtnContent}
                                                colors={['#98FF47', '#D0FF6B']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Text style={{ fontSize: 14 }}>{filterJson.distance[key]}</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.filterBtnContent}>
                                                <Text style={{ fontSize: 14 }}>{filterJson.distance[key]}</Text>
                                            </View>
                                        )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <View style={styles.bottomBtns}>
                    <TouchableOpacity
                        style={styles.bottomBtn}
                        onPressIn={() => setIsPressingCancel(true)}
                        onPressOut={() => setIsPressingCancel(false)}
                        onPress={() => {
                            hapticFeedback();
                            closeFilter();
                        }}
                        activeOpacity={1}
                    >
                        <View style={[styles.bottomBtnContent, isPressingCancel && { top: 3 }]}>
                            <Text style={{ fontSize: 14, fontWeight: 500 }}>Cancel</Text>
                        </View>
                        <View style={styles.bottomBtnShadow} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.bottomBtn}
                        onPressIn={() => setIsPressingApply(true)}
                        onPressOut={() => setIsPressingApply(false)}
                        onPress={() => {
                            hapticFeedback();
                            props.setFilterDistance(pendingFilterDistance);
                            closeFilter();
                        }}
                        activeOpacity={1}
                    >
                        <LinearGradient
                            style={[styles.bottomBtnContent, isPressingApply && { top: 3 }]}
                            colors={['#98FF47', '#D0FF6B']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={{ fontSize: 14, fontWeight: 500 }}>Apply</Text>
                        </LinearGradient>
                        <View style={styles.bottomBtnShadow} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    )
}