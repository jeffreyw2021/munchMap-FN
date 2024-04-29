import React from 'react';
import { View, Text } from 'react-native';
import Home from '../screens/Home';
import Navbar from '../components/navbar';

export default function GlobalController() {
    
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Navbar />
                <Home />
            </View>
        </View>
    );
}
