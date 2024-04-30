import React, { useEffect, useState, useRef } from 'react';
import { Platform, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import Initial from '../screens/Initial';
import Home from '../screens/Home';
import Stores from '../screens/Stores';
import Navbar from '../components/navbar';
import * as Location from 'expo-location';

export default function GlobalController() {

    const [currentScreen, setCurrentScreen] = useState("home");
    const updateScreen = (screen) => {
        setCurrentScreen(screen);
    }
    useEffect(() => {
        console.log("to: ", currentScreen);
    }, [currentScreen]);

    const [location, setLocation] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError(true);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    if (error) {
        return (
            <View style={{ flex: 1 }}>
                <Initial />
            </View>
        );
    }
    else if (location) {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
                    <Navbar updateScreen={updateScreen} />
                    {currentScreen === 'home' && <Home location = {location}/>}
                    {currentScreen === 'stores' && <Stores />}
                </View>
            </View>
        );
    }
    else {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#666666" />
            </View>
        );
    }
}
