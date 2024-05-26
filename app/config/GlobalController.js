import React, { useEffect, useState, useRef } from 'react';
import { Platform, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import Initial from '../screens/Initial';
import Navbar from '../components/navbar';
import * as Location from 'expo-location';
import { initDB } from './sqlite';
import Filter from '../components/filter';
import DetailModal from '../components/detailModal';
import EditListModal from '../components/editListModal';
import AppNavigator from './AppNavigator';

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
    const [filterWishlist, setFilterWishlist] = useState('None');
    const [filterCuisine, setFilterCuisine] = useState(['All']);
    useEffect(() => {
        console.log("Distance: ", filterDistance, 'km');
    }, [filterDistance]);
    useEffect(() => {
        console.log("Wishlist: ", filterWishlist);
    }, [filterWishlist]);
    useEffect(() => {
        console.log("Cuisine: ", filterCuisine);
    }, [filterCuisine]);

    //Randomize Choice
    const [randomChoice, setRandomChoice] = useState(null);
    const [exitRandomChoice, setExitRandomChoice] = useState(false);
    useEffect(() => {
        updateScreen("home");
        // console.log("randomChoice: ", randomChoice || "no random choice")
    }, [randomChoice])

    const [mapRenderFlag, setMapRenderFlag] = useState(false);

    //Edit List
    const [editList, setEditList] = useState(false);
    const [selectedList, setSelectedList] = useState(null);

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
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {editList && (
                    <EditListModal 
                    />
                )}
                {randomChoice && (
                    <DetailModal
                        props={{
                            randomChoice,
                            setRandomChoice,
                            setExitRandomChoice,
                            globalCurrentLocation,
                            filterDistance,
                            mapRenderFlag,
                            setMapRenderFlag,
                            filterCuisine
                        }}
                    />
                )}
                {filterOn && (
                    <Filter
                        props={{
                            filterOn,
                            setFilterOn,
                            filterDistance,
                            setFilterDistance,
                            filterWishlist,
                            setFilterWishlist,
                            filterCuisine,
                            setFilterCuisine,
                            mapRenderFlag,
                            setMapRenderFlag,
                        }}
                    />
                )}
                <View style={{ flex: 1 }}>
                    <Navbar
                        // navigation={navigation}
                        props={{
                            currentScreen,
                            updateScreen,
                            setFilterOn,
                            location,
                            globalCurrentLocation,
                            filterDistance,
                            setRandomChoice,
                            filterWishlist,
                            filterCuisine
                        }}
                    />
                    {currentScreen == 'stores' && (<View style={{
                        position: 'absolute',
                        bottom: 0,
                        height: 110,
                        width: '100%',
                        backgroundColor: "#fff",
                        borderTopColor: "#CFCFCF",
                        borderTopWidth: 2,
                        zIndex: 2
                    }} />)}
                    <AppNavigator
                        location={location}
                        currentScreen={currentScreen}
                        homeProps={{
                            setGlobalCurrentLocation,
                            exitRandomChoice,
                            setExitRandomChoice,
                            filterDistance,
                            filterWishlist,
                            filterCuisine,
                            mapRenderFlag,
                            setMapRenderFlag,
                            setFilterOn
                        }}
                        storeProps={{
                            setEditList,
                            setSelectedList,
                            selectedList,
                        }}
                        randomChoice={randomChoice}
                        setRandomChoice={setRandomChoice}
                    />
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
