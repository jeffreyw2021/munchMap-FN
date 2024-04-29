import React, {useEffect, useState, useRef} from 'react';
import { View, Text } from 'react-native';
import Home from '../screens/Home';
import Stores from '../screens/Stores';
import Navbar from '../components/navbar';

export default function GlobalController() {
    
    const[currentScreen, setCurrentScreen] = useState("home");
    const updateScreen = (screen) => {
        setCurrentScreen(screen);
    }
    useEffect(() => {
        console.log("to: ", currentScreen);
    }, [currentScreen]);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Navbar updateScreen={updateScreen} />
                {currentScreen === 'home' && <Home />}
                {currentScreen === 'stores' && <Stores />}
            </View>
        </View>
    );
}
