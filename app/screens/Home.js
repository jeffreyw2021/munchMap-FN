import React, {useState, useEffect, useRef} from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/homeStyle';
import Searchbar from '../components/searchbar';
import Map from '../components/map'

export default function Home({location}) {

    return (
        <View style={styles.container}>
            <Searchbar />
            <Map location = {{location}}/>
        </View>
    );
}
