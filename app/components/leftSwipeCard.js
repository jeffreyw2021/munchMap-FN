import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, Animated, ScrollView } from 'react-native';
import styles from '../styles/storesStyle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import * as Haptics from 'expo-haptics';
import * as SQLite from 'expo-sqlite';
import { createWishlist, removePlaceFromWishlist } from '../config/sqlite';
import { getSavedPlacesTable, getWishlistsTable, getTable } from '../api/fetchNearbyPlaces';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const db = SQLite.openDatabase('places.db');

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const leftSwipeWidth = 70;

const LeftSwipeCard = forwardRef(({ props, getWishlists, isInWishlist = false }, ref) => {

    useEffect(() => {
        if (ref && ref.current) {
            ref.current.scrollTo({ x: 0, animated: false });
        }
    }, [props.place.id]);

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
    const tagsString = processDetail(props.place, false).slice(0, 3).join(', ');

    const removePlaceFromSavedPlaces = async (placeId) => {
        db.transaction(tx => {
            // First, delete the place from savedPlaces
            tx.executeSql(
                `DELETE FROM savedPlaces WHERE id = ?;`,
                [placeId],
                (_, result) => {
                    if (result.rowsAffected > 0) {
                        console.log(`Place with ID ${placeId} removed from savedPlaces successfully.`);
                        // Now, check and remove the place from all wishlists
                        tx.executeSql(
                            `SELECT id, wishlistPlacesId FROM Wishlists;`,
                            [],
                            (_, results) => {
                                for (let i = 0; i < results.rows.length; i++) {
                                    const wishlist = results.rows.item(i);
                                    if (wishlist.wishlistPlacesId) {
                                        const placesIds = wishlist.wishlistPlacesId.split(',').map(Number);
                                        const index = placesIds.indexOf(placeId);
                                        if (index !== -1) {
                                            placesIds.splice(index, 1); // Remove the place ID from the list
                                            tx.executeSql(
                                                `UPDATE Wishlists SET wishlistPlacesId = ? WHERE id = ?;`,
                                                [placesIds.join(','), wishlist.id],
                                                () => console.log(`Place ID ${placeId} removed from wishlist ID ${wishlist.id}`),
                                                (_, error) => console.error(`Error updating wishlist ID ${wishlist.id}:`, error)
                                            );
                                        }
                                    }
                                }
                                getWishlists();
                            },
                            (_, error) => console.error(`Error retrieving wishlists:`, error)
                        );
                    } else {
                        console.log(`No place found with ID ${placeId} in savedPlaces or failed to delete.`);
                    }
                },
                (_, error) => {
                    console.error(`Failed to delete place from savedPlaces: `, error);
                }
            );
        });
    };


    const removePlaceFromWishlistWrapper = async (listId, placeId) => {
        try {
            await removePlaceFromWishlist(listId, placeId);
            getWishlists();
        } catch (error) {
            console.error('Error removing place from wishlist:', error);
        }
    };

    const [folded, setFolded] = useState(false);
    const [noBorder, setNoBorder] = useState(false);
    const heightAnim = useRef(new Animated.Value(88)).current;

    // Animate height when folded state changes
    useEffect(() => {
        if (folded) {
            Animated.timing(heightAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start(
                () => {
                    setNoBorder(true);
                }
            );
        }
    }, [folded]);

    return (
        <Animated.View
            style={[styles.placeCardSlider, { height: heightAnim }, noBorder && { borderBottomWidth: 0 }, props.isLastItem && { borderBottomWidth: 0 }]}
        >
            <View style={styles.placeCardHead} />
            <ScrollView
                ref={ref}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.placeCard, { width: screenWidth + leftSwipeWidth }]}
                snapToInterval={screenWidth - leftSwipeWidth}
                decelerationRate="fast"
            >
                <View style={{ backgroundColor: '#fff' }}>
                    <TouchableOpacity
                        style={[
                            styles.placeCardInner,
                            props.isLastItem && { paddingBottom: 30 },
                            props.isFirstItem && { paddingTop: 30 }
                        ]}
                        activeOpacity={!folded ? 0.6 : 1}
                        onPress={() => {
                            !folded && hapticFeedback();
                            !folded && props.setRandomChoice(props.place);
                        }}
                        pointerEvents={folded ? 'none' : 'auto'}
                    >
                        <View style={styles.placeCardEmoji}>
                            <Text style={{ fontSize: 28 }}>{props.place.emoji}</Text>
                        </View>
                        <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', rowGap: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 600 }} ellipsizeMode='tail'>{props.place.name}</Text>
                            <Text style={{ fontSize: 13, color: '#8C8C8C' }}>{tagsString}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    style={[styles.placeCardTail, { width: leftSwipeWidth }]}
                    onPress={() => {
                        hapticFeedback();
                        setFolded(true);
                        isInWishlist ? removePlaceFromWishlistWrapper(props.selectedList.id, props.place.id) : removePlaceFromSavedPlaces(props.place.id);
                        props.resetScrollPositions();
                    }}
                >
                    <FontAwesomeIcon icon={faTrashCan} size={20} color={"#000"}></FontAwesomeIcon>
                </TouchableOpacity>
            </ScrollView>
        </Animated.View>
    )
});

export default LeftSwipeCard;