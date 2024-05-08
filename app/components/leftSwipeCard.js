import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, TouchableOpacity, TouchableHighlight, ScrollView } from 'react-native';
import styles from '../styles/storesStyle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import * as Haptics from 'expo-haptics';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const leftSwipeWidth = 70;

export default function LeftSwipeCard({props}) {

    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const processDetail = (detail) => {
        const attributesToCheck = ['amenity', 'cuisine', 'craft', 'shop'];
        let output = [];

        if (detail && detail.attributes) {
            const attributes = typeof detail.attributes === 'string' ? JSON.parse(detail.attributes) : detail.attributes;

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

        return output;
    };
    const tagsString = processDetail(props.place).slice(0, 3).join(', ');

    const removePlaceFromSavedPlaces = async (placeId) => {
        db.transaction(tx => {
            tx.executeSql(
                `DELETE FROM savedPlaces WHERE id = ?;`,
                [placeId],
                (_, result) => {
                    if (result.rowsAffected > 0) {
                        console.log(`Place with ID ${placeId} removed from savedPlaces successfully.`);
                    } else {
                        console.log(`No place found with ID ${placeId} in savedPlaces or failed to delete.`);
                    }
                },
                (_, error) => {
                    console.error(`Failed to delete place from savedPlaces: `, error);
                }
            );
        });

        props.setCheckSavedPlacesFlag(!props.checkSavedPlacesFlag);
    };    

    return (
        <View
            style={[styles.placeCardSlider, props.isLastItem && { borderBottomWidth: 0 }]}
        >
            <View style={styles.placeCardHead} />
            <ScrollView
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
                        activeOpacity={0.6}
                        onPress={()=>{
                            hapticFeedback();
                            props.setRandomChoice(props.place);
                        }}
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
                    onPress={()=>{
                        hapticFeedback();
                        removePlaceFromSavedPlaces(props.place.id);
                    }}
                >
                    <FontAwesomeIcon icon={faTrashCan} size={20} color={"#000"}></FontAwesomeIcon>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}
