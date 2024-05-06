import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/homeStyle';
import Searchbar from '../components/searchbar';
import Map from '../components/map';
import Filter from '../components/filter';

export default function Home({ location, setGlobalCurrentLocation, randomChoice, exitRandomChoice, setExitRandomChoice }) {

    return (
        <View style={styles.container}>
            <Searchbar />
            <Map
                location={{ location }}
                setGlobalCurrentLocation={setGlobalCurrentLocation}
                globalRandomChoice={randomChoice}
                exitRandomChoice={exitRandomChoice}
                setExitRandomChoice={setExitRandomChoice}
            />
        </View>
    );
}
