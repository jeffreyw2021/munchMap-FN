import React, {useState, useEffect, useRef} from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/homeStyle';
import Searchbar from '../components/searchbar';
import Navbar from '../components/navbar';

export default function Home() {
    return (
        <View style={styles.container}>
            <Searchbar />
        </View>
    );
}
