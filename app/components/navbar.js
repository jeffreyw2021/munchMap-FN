import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../styles/navbarStyle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMap, faStore, faSliders, faDice } from '@fortawesome/free-solid-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Navbar() {

    const [isPressingHome, setIsPressingHome] = useState(false);
    const [isInHome, setIsInHome] = useState(true);
    const [isPressingStores, setIsPressingStores] = useState(false);
    const [isInStores, setIsInStores] = useState (false);
    const [isPressingFilter, setIsPressingFilter] = useState(false);
    const [isPressingRoll, setIsPressingRoll] = useState(false);

    const handleToHome = () => {
        console.log("to home");
        setIsInHome(true);
        setIsInStores(false);
    }
    const handleToStores = () => {
        console.log("to stores")
        setIsInStores(true);
        setIsInHome(false);
    }

    return (
        <View style={styles.overcast}>
            <View style={styles.navbar}>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                >
                    <View style={[styles.navbtn, styles.btnContent]}>
                        <FontAwesomeIcon icon={faSliders} size={16} />
                    </View>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navbtn, styles.rollbtn]}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingRoll(true)}
                    onPressOut={() => setIsPressingRoll(false)}
                >
                    <View style={[styles.navbtn, styles.rollbtn, styles.btnContent, isPressingRoll ? {top:3}: null]}>
                        <FontAwesomeIcon icon={faDice} size={18} />
                        <Text style={{ fontWeight: '700' }}>Roll</Text>
                    </View>
                    <View style={[styles.navbtn, styles.rollbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingHome(true)}
                    onPressOut={() => setIsPressingHome(false)}
                    onPress={handleToHome}
                >
                    <LinearGradient
                        style={[styles.navbtn, styles.btnContent, isPressingHome ? { top: 3 } : null]}
                        colors={isInHome ? ['#98FF47', '#D0FF6B'] : ['#ffffff', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <FontAwesomeIcon icon={faMap} size={16} />
                    </LinearGradient>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navbtn}
                    activeOpacity={1}
                    onPressIn={() => setIsPressingStores(true)}
                    onPressOut={() => setIsPressingStores(false)}
                    onPress={handleToStores}
                >
                    <LinearGradient
                        style={[styles.navbtn, styles.btnContent, isPressingStores ? { top: 3 } : null]}
                        colors={isInStores ? ['#98FF47', '#D0FF6B'] : ['#ffffff', '#ffffff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <FontAwesomeIcon icon={faStore} size={16} />
                    </LinearGradient>
                    <View style={[styles.navbtn, styles.btnShadow]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
