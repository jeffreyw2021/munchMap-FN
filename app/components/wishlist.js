import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

export default function WishlistCard({list = {"id": -1, "listName": "NULL", "wishlistPlacesId": []}, setSelectedList}) {

    const [isPressing, setIsPressing] = useState(false);

    return (
        <TouchableOpacity
            style={{ width: '100%' }}
            activeOpacity={1}
            onPressIn={()=> {setIsPressing(true);}}
            onPressOut={()=> {setIsPressing(false);}}
            onPress={()=> {setSelectedList(list);}}
        >
            <View style={[styles.wishlistCardContent, isPressing && {top: 3}]}>
                <View style={{flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', rowGap: 3}}>
                    <Text numberOfLines={1} style={{width:'100%', overflow: 'hidden', fontSize: 16, fontWeight: 600}} ellipsizeMode='tail'>{list.listName}</Text>
                    <Text style={{fontSize: 12, color: '#8C8C8C'}}>{list.wishlistPlacesId.length} Saved Spots</Text>
                </View>
                <FontAwesomeIcon icon={faAngleRight} size={20} />
            </View>
            <View style={styles.wishlistCardShadow} />
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    wishlistCardContent:{
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#000",
        paddingVertical: 15,
        paddingRight: 10,
        paddingLeft: 15,
        gap: 15,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    wishlistCardShadow:{
        top: 3,
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 6,
        zIndex: -1
    }
});