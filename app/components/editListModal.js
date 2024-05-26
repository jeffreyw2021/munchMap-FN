import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import styles from '../styles/storesStyle';
import { getSavedPlacesTable, getWishlistsTable, getTable } from '../api/fetchNearbyPlaces';
import Picko from '../assets/images/picko.png';
import dot from '../assets/images/dot.png';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faGear, faPlus, faPen, faCheck, faAngleLeft, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import LeftSwipeCard from '../components/leftSwipeCard';
import WishlistCard from '../components/wishlist';
import { createWishlist } from '../config/sqlite';

export default function EditListModal({props}){

    return(
        <View style={styles.overcast}>

        </View>
    )
}