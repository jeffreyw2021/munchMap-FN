import React, { useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/homeStyle';
import Searchbar from '../components/searchbar';
import Map from '../components/map';
import Filter from '../components/filter';

export default function Home({ route, navigation }) {

    const [props, setProps] = useState(route.params.homeProps);
    useEffect(() => {
        if (route.params.homeProps) {
            const setGlobalCurrentLocation = route.params?.homeProps?.setGlobalCurrentLocation;
            const setExitRandomChoice = route.params?.homeProps?.setExitRandomChoice;
            const setMapRenderFlag = route.params?.homeProps?.setMapRenderFlag;
            const setRandomChoice = route.params?.setRandomChoice;
        
            setProps({
                setGlobalCurrentLocation,
                exitRandomChoice: route.params.homeProps.exitRandomChoice,
                setExitRandomChoice,
                filterDistance: route.params.homeProps.filterDistance,
                filterWishlist: route.params.homeProps.filterWishlist,
                mapRenderFlag: route.params.homeProps.mapRenderFlag,
                setMapRenderFlag,
                setRandomChoice
            });
        }
    }, [route.params.homeProps]);

    // useEffect(()=>{
    //     console.log("randomChoice: ", route.params.randomChoice)
    // },[route.params.randomChoice]);

    return (
        <View style={styles.container}>
            <Searchbar />
            <Map
                props={props}
                randomChoice={route.params.randomChoice}
                location={route.params.location}
                currentScreen={route.params.currentScreen}
            />
        </View>
    );
}
