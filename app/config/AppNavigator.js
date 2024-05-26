import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, CardStyleInterpolators } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import Stores from '../screens/Stores';

const Stack = createNativeStackNavigator();

export default function AppNavigator ({ currentScreen, location, randomChoice, homeProps, storeProps, setRandomChoice }) {
    const navigationRef = useRef(null);

    useEffect(() => {
        if (navigationRef.current && currentScreen !== undefined) {
            navigationRef.current.navigate(currentScreen === 'stores' ? 'Stores' : 'Home');
            navigationRef.current.setParams({ currentScreen });
        }
    }, [currentScreen]);

    useEffect(() => {
        if (navigationRef.current && homeProps !== undefined) {
            navigationRef.current.setParams({ homeProps });
        }
    }, [homeProps]);  
    useEffect(() => {
        if (navigationRef.current && storeProps !== undefined) {
            navigationRef.current.setParams({ storeProps });
        }
    }, [storeProps]);    
    useEffect(() => {
        if (navigationRef.current && randomChoice !== undefined) {
            navigationRef.current.setParams({ randomChoice });
        }
    }, [randomChoice]);    

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{
                    gestureEnabled: true,
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={Home}
                    initialParams={{
                        homeProps,
                        location,
                        randomChoice,
                        currentScreen,
                        setRandomChoice
                    }}
                />
                <Stack.Screen
                    name="Stores"
                    component={Stores}
                    initialParams={{
                        storeProps,
                        setRandomChoice
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
