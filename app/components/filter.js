import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, TextInput } from 'react-native';
import styles from '../styles/filterStyle';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getSavedPlacesTable, getWishlistsTable, getTable } from '../api/fetchNearbyPlaces';
import emojiReference from '../json/emojiReference.json';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Fuse from 'fuse.js';

export default function Filter({ props }) {

    const [isPressingApply, setIsPressingApply] = useState(false);
    const [isPressingCancel, setIsPressingCancel] = useState(false);
    const hapticFeedback = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const [wishlists, setWishlists] = useState([]);
    const [cuisines, setCuisines] = useState([]);
    const [filterJson, setFilterJson] = useState(null);

    const fuse = useRef(new Fuse([], {
        keys: ["name"],
        includeScore: true,
        threshold: 0.3 // Adjust this value based on desired fuzziness
    }));


    useEffect(() => {
        getWishlists();
        getCuisines();
    }, []);
    const getWishlists = () => {
        getWishlistsTable()
            .then(wishlists => {
                const processedWishlists = wishlists.map(wishlist => wishlist.listName);
                setWishlists(processedWishlists);
            })
            .catch(error => {
                console.error('Failed to fetch wishlists: ', error);
            });
    }

    const getCuisines = () => {
        const output = Object.keys(emojiReference).flatMap(key =>
            Object.keys(emojiReference[key]).map(subkey => subkey.replace("_", " ").replace("&", " & "))
        );
    
        const uniqueCuisines = Array.from(new Set(output));
    
        setCuisines(uniqueCuisines);
        fuse.current.setCollection(uniqueCuisines.map(name => ({ name })));
    }
    
    useEffect(() => {
        if (wishlists.length > 0 && cuisines.length > 0) {
            setFilterJson({
                wishlists: ['None', 'All Saved', ...wishlists],
                cuisine: ['All', ...cuisines],
                distance: {
                    500: '≤500m',
                    1000: '≤1km',
                    2000: '≤2km',
                    5000: '≤5km',
                    10000: '≤10km',
                    20000: '≤20km'
                }
            });
        }
    }, [wishlists, cuisines]);

    const [typesExpand, setTypesExpand] = useState(false);
    const [pendingFilterDistance, setPendingFilterDistance] = useState(props.filterDistance);
    const [pendingFilterWishlist, setPendingFilterWishlist] = useState(props.filterWishlist);
    const [pendingFilterCuisine, setPendingFilterCuisine] = useState(props.filterCuisine);
    const position = useRef(new Animated.Value(500)).current;
    useEffect(() => {
        if (filterJson) {
            Animated.timing(position, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [filterJson]);
    const closeFilter = () => {
        Animated.timing(position, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            props.setFilterOn(false);
        });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCuisines, setFilteredCuisines] = useState([]);

    const handleSearchChange = (text) => {
        setSearchTerm(text);
        if (text) {
            const results = fuse.current.search(text);
            setFilteredCuisines(results.map(result => result.item.name));
        } else {
            setFilteredCuisines([]); // Reset when search term is cleared
        }
    };


    return (
        <View style={styles.overcast}>
            {filterJson &&
                (<Animated.View style={[styles.filterBlock, {
                    transform: [{ translateY: position }]
                }]}>
                    <View style={{ justifyContent: 'flex-end', width: '100%' }}>
                        <View style={[{ width: '100%' }]}>
                            {!typesExpand ? (
                                <ScrollView
                                    horizontal
                                    contentContainerStyle={styles.filterRow}
                                    showsHorizontalScrollIndicator={false}
                                >
                                    <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Types:</Text>
                                    {filterJson.cuisine
                                        .slice(0, filterJson.cuisine.indexOf('...') + 1)
                                        .map((item, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.filterBtn}
                                                onPress={() => {
                                                    hapticFeedback();

                                                    if (item !== '...') {
                                                        if (item === 'All') {
                                                            setPendingFilterCuisine(["All"]);
                                                        } else {
                                                            if (pendingFilterCuisine.includes(item)) {
                                                                const newFilterCuisine =
                                                                    pendingFilterCuisine.filter(val => val !== item).length > 0 ?
                                                                        pendingFilterCuisine.filter(val => val !== item) :
                                                                        ["All"];
                                                                setPendingFilterCuisine(newFilterCuisine);
                                                            } else {
                                                                const newFilterCuisine = [...pendingFilterCuisine, item].filter(val => val !== 'All');
                                                                setPendingFilterCuisine(newFilterCuisine);
                                                            }
                                                        }
                                                    } else {
                                                        setTypesExpand(true);
                                                    }

                                                    setSearchTerm('');
                                                }}
                                            >
                                                {pendingFilterCuisine && pendingFilterCuisine.includes(item) ? (
                                                    <LinearGradient
                                                        style={styles.filterBtnContent}
                                                        colors={['#98FF47', '#D0FF6B']}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 0 }}
                                                    >
                                                        <Text style={{ fontSize: 14, textTransform: "capitalize" }}>{item}</Text>
                                                    </LinearGradient>
                                                ) : (
                                                    <View style={[styles.filterBtnContent, (item === '...') && { flex: 1, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: '#f0f0f0' }]}>
                                                        {item !== '...' ? (
                                                            <Text style={{ fontSize: 14, textTransform: "capitalize" }}>{item}</Text>
                                                        ) : (
                                                            <FontAwesomeIcon icon={faEllipsis} size={14} />
                                                        )}
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            ) : (
                                <View style={{ height: 460 }}>
                                    <View style={styles.filterExpandTop}>
                                        <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Types:</Text>
                                        <TouchableOpacity
                                            style={[styles.filterBtnContent, { justifyContent: 'center', paddingHorizontal: 14, backgroundColor: '#f0f0f0' }]}
                                            onPress={() => {
                                                hapticFeedback();
                                                setTypesExpand(false);
                                                setSearchTerm('');
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faEllipsis} size={14} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.filterExpandTop}>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} size={12} style={styles.filterSearchIcon} />
                                        <TextInput
                                            style={styles.filterSearch}
                                            placeholder='Search for type...'
                                            placeholderTextColor={'#C7C7C7'}
                                            onChangeText={handleSearchChange}
                                            value={searchTerm}
                                        />
                                    </View>
                                    <ScrollView
                                        contentContainerStyle={[styles.filterExpand]}
                                        showsVerticalScrollIndicator={false}
                                    >

                                        <View style={styles.filterExpandBody}>
                                            {filterJson.cuisine &&
                                                [
                                                    ...filterJson.cuisine.slice(0, filterJson.cuisine.indexOf('...')),
                                                    ...filterJson.cuisine.slice(filterJson.cuisine.indexOf('...'), filterJson.cuisine.length).sort()
                                                ]
                                                    .filter(val => val !== '...')
                                                    .filter(item => !searchTerm || filteredCuisines.includes(item))
                                                    .map(
                                                        (item, index) => {
                                                            return (
                                                                <TouchableOpacity
                                                                    key={index}
                                                                    onPress={() => {
                                                                        hapticFeedback();
                                                                        if (item === 'All') {
                                                                            setPendingFilterCuisine(["All"]);
                                                                        } else {
                                                                            if (pendingFilterCuisine && pendingFilterCuisine.includes(item)) {
                                                                                const newFilterCuisine =
                                                                                    pendingFilterCuisine.filter(val => val !== item).length > 0 ?
                                                                                        pendingFilterCuisine.filter(val => val !== item) :
                                                                                        ["All"];
                                                                                setPendingFilterCuisine(newFilterCuisine);
                                                                            } else {
                                                                                const newFilterCuisine = [...pendingFilterCuisine, item].filter(val => val !== 'All');
                                                                                setPendingFilterCuisine(newFilterCuisine);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    {pendingFilterCuisine && pendingFilterCuisine.includes(item) ? (
                                                                        <LinearGradient
                                                                            style={[styles.filterBtnContent]}
                                                                            colors={['#98FF47', '#D0FF6B']}
                                                                            start={{ x: 0, y: 0 }}
                                                                            end={{ x: 1, y: 0 }}
                                                                        >
                                                                            <Text style={{ fontSize: 14, textTransform: "capitalize" }}>{item}</Text>
                                                                        </LinearGradient>
                                                                    ) : (
                                                                        <View style={[styles.filterBtnContent]}>
                                                                            <Text style={{ fontSize: 14, textTransform: "capitalize" }}>{item}</Text>
                                                                        </View>
                                                                    )}
                                                                </TouchableOpacity>
                                                            )
                                                        }
                                                    )}
                                        </View>
                                    </ScrollView>
                                </View>
                            )
                            }
                        </View>
                        <View style={[{ width: '100%' }, styles.filterRowBorder]}>
                            <ScrollView
                                horizontal
                                contentContainerStyle={styles.filterRow}
                                showsHorizontalScrollIndicator={false}
                            >
                                <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Wishlist:</Text>
                                {filterJson.wishlists.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.filterBtn}
                                        onPress={() => {
                                            hapticFeedback();
                                            setPendingFilterWishlist(item);
                                        }}
                                    >
                                        {(pendingFilterWishlist === item) ? (
                                            <LinearGradient
                                                style={styles.filterBtnContent}
                                                colors={['#98FF47', '#D0FF6B']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Text style={{ fontSize: 14 }}>{item}</Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.filterBtnContent}>
                                                <Text style={{ fontSize: 14 }}>{item}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <View style={[{ width: '100%' }]}>
                            <ScrollView
                                horizontal
                                contentContainerStyle={styles.filterRow}
                                showsHorizontalScrollIndicator={false}
                            >
                                <Text style={{ fontSize: 14, fontWeight: 600, width: 67 }}>Distance:</Text>
                                {Object.keys(filterJson.distance).map((key, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.filterBtn}
                                        onPress={() => {
                                            hapticFeedback();
                                            setPendingFilterDistance(key / 1000);
                                        }}
                                    >
                                        {pendingFilterDistance === key / 1000 ?
                                            (
                                                <LinearGradient
                                                    style={styles.filterBtnContent}
                                                    colors={['#98FF47', '#D0FF6B']}
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 0 }}
                                                >
                                                    <Text style={{ fontSize: 14 }}>{filterJson.distance[key]}</Text>
                                                </LinearGradient>
                                            ) : (
                                                <View style={styles.filterBtnContent}>
                                                    <Text style={{ fontSize: 14 }}>{filterJson.distance[key]}</Text>
                                                </View>
                                            )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    <View style={styles.bottomBtns}>
                        <TouchableOpacity
                            style={styles.bottomBtn}
                            onPressIn={() => setIsPressingCancel(true)}
                            onPressOut={() => setIsPressingCancel(false)}
                            onPress={() => {
                                hapticFeedback();
                                closeFilter();
                            }}
                            activeOpacity={1}
                        >
                            <View style={[styles.bottomBtnContent, isPressingCancel && { top: 3 }]}>
                                <Text style={{ fontSize: 14, fontWeight: 500 }}>Cancel</Text>
                            </View>
                            <View style={styles.bottomBtnShadow} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bottomBtn}
                            onPressIn={() => setIsPressingApply(true)}
                            onPressOut={() => setIsPressingApply(false)}
                            onPress={() => {
                                hapticFeedback();
                                props.setFilterDistance(pendingFilterDistance);
                                props.setFilterWishlist(pendingFilterWishlist);
                                props.setFilterCuisine(pendingFilterCuisine);
                                props.setMapRenderFlag(!props.mapRenderFlag);
                                closeFilter();
                            }}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                style={[styles.bottomBtnContent, isPressingApply && { top: 3 }]}
                                colors={['#98FF47', '#D0FF6B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: 500 }}>Apply</Text>
                            </LinearGradient>
                            <View style={styles.bottomBtnShadow} />
                        </TouchableOpacity>
                    </View>
                </Animated.View >
                )}
        </View >
    )
}