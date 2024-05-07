import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/storesStyle';
import { getSavedPlacesTable } from '../api/fetchNearbyPlaces';

export default function Stores() {

    const [savedPlaces, setSavedPlaces] = useState(null);
    useEffect(() => {
        getSavedPlacesTable()
            .then(places => {
                setSavedPlaces(places);
            })
            .catch(error => {
                console.error('Failed to fetch saved places: ', error);
            });
    }, [])

    return (
        <View style={styles.container}>

        </View>
    );
}