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
import { getSavedPlacesTable, getWishlistsTable } from '../api/fetchNearbyPlaces';

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

    //Randomize Choice
    const [randomChoice, setRandomChoice] = useState(null);
    const [exitRandomChoice, setExitRandomChoice] = useState(false);
    useEffect(() => {
        updateScreen("home");
    }, [randomChoice])

    const [mapRenderFlag, setMapRenderFlag] = useState(false);

    //Edit List
    const [editList, setEditList] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [globalSavedPlaces, setGlobalSavedPlaces] = useState(null);
    const [renewWishlistFlag, setRenewWishlistFlag] = useState(false);
    const renewSelectedList = (id) => {
        getWishlistsTable()
            .then(wishlists => {
                const processedWishlists = wishlists.map(wishlist => ({
                    ...wishlist,
                    wishlistPlacesId: wishlist.wishlistPlacesId ? wishlist.wishlistPlacesId.split(',').map(Number) : []
                }));
                const newSelectedList = processedWishlists.find(wishlist => wishlist.id == id);
                setSelectedList(newSelectedList);
                setRenewWishlistFlag(!renewWishlistFlag);
            })
            .catch(error => {
                console.error('Failed to fetch wishlists: ', error);
            });
    }

    //loader
    const [loaderOn, setLoaderOn] = useState(false);
    useEffect(() => {
        console.log("Loader: ", loaderOn);
    }, [loaderOn]);

    //error handling
    if (error) {
        return (
            <View style={{ flex: 1 }}>
                <Initial />
            </View>
        );
    }

    else if (location) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {loaderOn && (<View style={{ height: '100%', width: '100%', top: 0, left: 0, right: 0, bottom: 0, position: 'absolute', zIndex: 999, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{justifyContent: 'center', alignContent:'center', padding: 20, backgroundColor:'rgba(0,0,0,0.2)', borderRadius: 16}}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                </View>)}
                {editList && (
                    <EditListModal
                        props={{
                            setEditList,
                            setSelectedList,
                            selectedList,
                            globalSavedPlaces,
                            renewSelectedList
                        }}
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
                            filterCuisine,
                            setGlobalSavedPlaces,
                            setLoaderOn,
                            loaderOn,
                            setLoaderOn
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
                            filterCuisine,
                            mapRenderFlag,
                            setMapRenderFlag,
                            loaderOn,
                            setLoaderOn
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
                            globalCurrentLocation,
                            setGlobalCurrentLocation,
                            exitRandomChoice,
                            setExitRandomChoice,
                            filterDistance,
                            filterWishlist,
                            filterCuisine,
                            mapRenderFlag,
                            setMapRenderFlag,
                            setFilterOn,
                            setGlobalSavedPlaces
                        }}
                        storeProps={{
                            setEditList,
                            setSelectedList,
                            selectedList,
                            setGlobalSavedPlaces,
                            renewSelectedList,
                            renewWishlistFlag
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
