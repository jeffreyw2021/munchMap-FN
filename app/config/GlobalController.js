import React, { useEffect, useState, useRef } from 'react';
import { Platform, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import Initial from '../screens/Initial';
import Home from '../screens/Home';
import Stores from '../screens/Stores';
import Navbar from '../components/navbar';
import * as Location from 'expo-location';
import { initDB } from './sqlite';
import Filter from '../components/filter';

export default function GlobalController() {

    // Initialize SQLite database
    useEffect(() => {
        initDB();
    }, []);

    // Screen state
    const [currentScreen, setCurrentScreen] = useState("home");
    const updateScreen = (screen) => {
        setCurrentScreen(screen);
    }
    useEffect(() => {
        console.log("to: ", currentScreen);
    }, [currentScreen]);

    // Location Permission
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
    const [globalCurrentLocation, setGlobalCurrentLocation] = useState(null);

    //Filter
    const [filterOn, setFilterOn] = useState(false);
    const [filterDistance, setFilterDistance] = useState(0.5);
    useEffect(() => {
        console.log("Distance: ", filterDistance);
    }, [filterDistance]);

    //Randomize Choice
    const [randomChoice, setRandomChoice] = useState(null);

    //error handling
    if (error) {
        return (
            <View style={{ flex: 1 }}>
                <Initial />
            </View>
        );
    }
    else if (location) {
        // console.log("Location: ", location);
        return (
            <View style={{ flex: 1 }}>
                {filterOn && (
                    <Filter
                        props={{
                            filterOn,
                            setFilterOn,
                            filterDistance,
                            setFilterDistance
                        }}
                    />
                )}
                <View style={{ flex: 1 }}>
                    <Navbar
                        updateScreen={updateScreen}
                        setFilterOn={setFilterOn}
                        initialLocation={location}
                        globalCurrentLocation={globalCurrentLocation}
                        filterDistance={filterDistance}
                        setRandomChoice={setRandomChoice}
                    />
                    {currentScreen === 'home' &&
                        <Home
                            location={location}
                            setGlobalCurrentLocation={setGlobalCurrentLocation}
                            randomChoice={randomChoice}
                        />
                    }
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
