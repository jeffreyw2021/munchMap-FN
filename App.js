import React, {useState, useEffect, useRef} from 'react';
import { registerRootComponent } from 'expo';
import GlobalController from './app/config/GlobalController';

export default function App() {
    return (
        <GlobalController />
    );
}

registerRootComponent(App);
