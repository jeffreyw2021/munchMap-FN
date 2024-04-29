import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import styles from '../styles/searchbarStyle';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

export default function Searchbar() {

    const [isPressing, setIsPressing] = useState(false);
    const [TriggerOn, setTriggerOn] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        if (TriggerOn && inputRef.current) {
            inputRef.current.focus();
        }
        else if (!TriggerOn) {
            setSearchText("");
        }
    }, [TriggerOn]);
    const [searchText, setSearchText] = useState("");

    const handleSearch = () => {
        if (searchText.length > 0) {
            console.log("Searching for:", searchText);
        }
        setTriggerOn(false)
    };

    return (
        <View style={styles.overcast}>
            <TouchableOpacity
                style={[styles.searchbtn, TriggerOn ? { width: '100%' } : null]}
                activeOpacity={1}
                onPressIn={() => { if (!TriggerOn) { setIsPressing(true) } }}
                onPressOut={() => { if (!TriggerOn) { setIsPressing(false) } }}
                onPress={() => setTriggerOn(true)}
            >
                <View style={[styles.searchbtn, styles.searchBtnContent, isPressing ? { top: 3 } : null]}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} size={14} />
                    <TextInput
                        ref={inputRef}
                        style={[{ flex: 1, display: 'none', fontSize: 14 }, TriggerOn ? { display: 'flex' } : null]}
                        cursorColor="#C7C7C7"
                        selectionColor="#C7C7C7"
                        placeholder='search for a place'
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearch}
                        onBlur={() =>  setTriggerOn(false)}
                    />
                </View>
                <View style={[styles.searchbtn, styles.searchBtnShadow]} />
            </TouchableOpacity>
        </View>
    );
}