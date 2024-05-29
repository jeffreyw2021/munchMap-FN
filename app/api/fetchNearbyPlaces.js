import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import emojiReference from '../json/emojiReference.json';

const overpassUrl = 'https://overpass-api.de/api/interpreter';
const db = SQLite.openDatabase('places.db');

const processPlaceData = (place) => {
    const { lat, lon, tags } = place;
    let placeName = tags && tags.name;

    if (!placeName) {
        // console.log("No name found for this place, skipping:", place);
        return null;
    }

    const attributes = { ...tags };
    delete attributes.name;
    const attributesJson = JSON.stringify(attributes);

    return {
        name: placeName,
        lat,
        lon,
        attributes: attributesJson
    };
};
const determineEmoji = (attributes) => {
    const attrs = JSON.parse(attributes);
    let emoji = "🍞"; // Default emoji (bread) if no other matches found

    const fields = ['cuisine', 'craft', 'amenity', 'shop'];
    for (const field of fields) {
        if (attrs[field]) {
            const key = attrs[field].split(';')[0].trim().toLowerCase(); // Get first key if multiple
            if (emojiReference[field] && emojiReference[field][key]) {
                emoji = emojiReference[field][key];
                break;
            }
        }
    }

    return emoji;
};
const insertPlace = async (place) => {
    const { name, lat, lon, attributes } = place;
    const emoji = determineEmoji(attributes);

    const checkQuery = `SELECT name FROM Places WHERE name = ? AND lat = ? AND lon = ?`;
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(checkQuery, [name, lat, lon], (_, { rows }) => {
                if (rows.length === 0) {
                    const insertQuery = `INSERT INTO Places (name, lat, lon, attributes, emoji) VALUES (?, ?, ?, ?, ?)`;
                    tx.executeSql(insertQuery, [name, lat, lon, attributes, emoji],
                        (_, result) => {
                            // console.log(`Place ${name} inserted successfully with emoji ${emoji}`);
                            resolve(result.insertId);
                        },
                        (_, error) => {
                            console.error(`Failed to insert place ${name}: `, error);
                            reject(error);
                        }
                    );
                } else {
                    // console.log(`Place ${name} already exists at this location.`);
                    resolve(null);
                }
            },
                (_, error) => {
                    console.error(`Failed to check for existing place ${name}: `, error);
                    reject(error);
                });
        });
    });
};

const insertFetchedLocation = (lat, lon, radius) => {
    const query = `INSERT INTO FetchedLocations (lat, lon, radius) VALUES (?, ?, ?)`;
    db.transaction(tx => {
        tx.executeSql(query, [lat, lon, radius],
            () => console.log(`Fetched location stored successfully`),
            (_, error) => console.error(`Failed to store fetched location: `, error)
        );
    });
};

export const fetchNearbyPlaces = async (lat, lon, searchRadius = 0.5) => {
    console.log("Fetching nearby places...");

    const query = `
    [out:json];
    (
        node["amenity"="restaurant"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="cafe"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="pub"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="bbq"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="fast_food"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="ice_cream"](around:${searchRadius * 1000},${lat},${lon});
        node["shop"="bakery"](around:${searchRadius * 1000},${lat},${lon});
    );
    out;`;

    try {
        const response = await axios.post(overpassUrl, query);
        const fetchedPlaces = response.data.elements;

        insertFetchedLocation(lat, lon, searchRadius);

        const validPlaces = fetchedPlaces.map(processPlaceData).filter(place => place !== null);

        if (validPlaces.length > 0) {
            validPlaces.forEach(async place => {
                const insertedId = await insertPlace(place);
                if (insertedId !== null) {
                    console.log(`Inserted place ID: ${insertedId}`);
                }
            });
        } else {
            console.log('No places found');
        }
    } catch (error) {
        console.error("Failed to fetch places: ", error);
    }
};

const clearPlacesTable = () => {
    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM Places;`,
            [],
            () => console.log('All rows from the Places table have been deleted successfully.'),
            (_, error) => console.error('Failed to delete rows from the Places table: ', error)
        );
    });
};

const isWithinRadius = (center, place, radius) => {
    const rad = (x) => x * Math.PI / 180;
    const R = 6378137; // Earth’s mean radius in meter
    const dLat = rad(place.lat - center.lat);
    const dLong = rad(place.lon - center.lon);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(center.lat)) * Math.cos(rad(place.lat)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance <= radius; // returns distance in meters
};
const getPlacesWithinRadius = async (lat, lon, radius) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM Places;`, [],
                (_, { rows }) => {
                    const validPlaces = rows._array.filter(place => isWithinRadius({ lat, lon }, place, radius * 1000));
                    resolve(validPlaces);
                },
                (_, error) => {
                    console.error('Failed to retrieve places: ', error);
                    reject(error);
                }
            );
        });
    });
};
export const getSavedPlacesWithinRadius = (places, lat, lon, radius) => {
    console.log(radius);
    const validPlaces = places.filter(place => isWithinRadius({ lat, lon }, place, radius * 1000));
    return (validPlaces);
}


export const filterByTypes = (places, filterCuisine) => {
    if (filterCuisine.includes("All")) {
        return places;
    }

    return places.filter(place => {
        const attributes = place.attributes ? JSON.parse(place.attributes) : null;
        if (attributes) {
            const hasRelevantAttribute = ['amenity', 'shop', 'cuisine', 'craft'].some(attr => {
                return attributes[attr] && filterCuisine.includes(attributes[attr]);
            });

            if (hasRelevantAttribute) {
                // console.log("places.attributes", attributes);
                return true;
            }
        }
        return false;
    });
}
export const RandomlyPickFromFetchedPlaces = async (lat, lon, searchRadius = 0.5, filterCuisine, clearTable = false) => {
    if (clearTable) {
        clearPlacesTable();
    }
    console.log("Fetching and randomly picking a nearby place based on filter:", filterCuisine);

    let query = '[out:json];(';

    if (filterCuisine.includes("All")) {
        query += `
        node["amenity"="restaurant"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="cafe"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="pub"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="bar"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="bbq"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="fast_food"](around:${searchRadius * 1000},${lat},${lon});
        node["amenity"="ice_cream"](around:${searchRadius * 1000},${lat},${lon});
        node["shop"="bakery"](around:${searchRadius * 1000},${lat},${lon});
        `;
    } else {
        const amenityTypes = ['restaurant', 'cafe', 'pub', 'bar', 'bbq', 'fast_food', 'ice_cream'];

        for (const amenity of amenityTypes) {
            if (filterCuisine.includes(amenity)) {
                query += `node["amenity"="${amenity}"](around:${searchRadius * 1000},${lat},${lon});`;
            }
        }
        if (filterCuisine.includes('bakery')) {
            query += `node["shop"="bakery"](around:${searchRadius * 1000},${lat},${lon});`;
        }
    }

    query += '); out;';

    console.log("Querying Overpass API with query:", query);

    try {
        const response = await axios.post(overpassUrl, query);
        const fetchedPlaces = response.data.elements;

        insertFetchedLocation(lat, lon, searchRadius);

        // Correctly await the place ID insertions and filter out nulls
        const placeIds = await Promise.all(fetchedPlaces.map(async place => {
            const processedPlace = processPlaceData(place);
            return processedPlace ? await insertPlace(processedPlace) : null;
        }));
        const validPlaceIds = placeIds.filter(id => id !== null);

        if (validPlaceIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * validPlaceIds.length);
            return validPlaceIds[randomIndex];
        } else {
            console.log('No matching places found, attempting to fetch from local database...');
            return fetchRandomPlaceFromLocal(lat, lon, searchRadius, filterCuisine);
        }
    } catch (error) {
        console.error("Network or processing error occurred: ", error);
        console.log('Attempting to fetch random place from local database due to network error...');
        return fetchRandomPlaceFromLocal(lat, lon, searchRadius, filterCuisine);
    }
};



const fetchRandomPlaceFromLocal = async (lat, lon, radius, filterCuisine) => {
    try {
        const localPlaces = await getPlacesWithinRadius(lat, lon, radius);
        const filteredPlaces = filterByTypes(localPlaces, filterCuisine);

        if (filteredPlaces.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredPlaces.length);
            return filteredPlaces[randomIndex].id;
        } else {
            console.log('No local matching places found within the radius.');
            return null;
        }
    } catch (error) {
        console.error('Error retrieving local places:', error);
        return null;
    }
};

export const getFetchedLocationsTable = async () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM FetchedLocations;`,
                [],
                (_, { rows }) => {
                    console.log('Fetched locations retrieved successfully');
                    resolve(rows._array);
                },
                (_, error) => {
                    console.error('Failed to retrieve fetched locations: ', error);
                    reject(error);
                }
            );
        });
    });
};
export const getPlacesTable = async () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM Places;`,
                [],
                (_, { rows }) => {
                    console.log('Places retrieved successfully');
                    resolve(rows._array);
                },
                (_, error) => {
                    console.error('Failed to retrieve places: ', error);
                    reject(error);
                }
            );
        });
    });
};
export const getSavedPlacesTable = async () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM SavedPlaces;`,
                [],
                (_, { rows }) => {
                    console.log('SavedPlaces retrieved successfully');
                    resolve(rows._array);
                },
                (_, error) => {
                    console.error('Failed to retrieve SavedPlaces: ', error);
                    reject(error);
                }
            );
        });
    });
};
export const getWishlistsTable = async () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM Wishlists;`,
                [],
                (_, { rows }) => {
                    console.log('Wishlists retrieved successfully');
                    resolve(rows._array);
                },
                (_, error) => {
                    console.error('Failed to retrieve Wishlists: ', error);
                    reject(error);
                }
            );
        });
    });
};
export const getTable = async (tableName) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM ${tableName};`,
                [],
                (_, { rows }) => {
                    console.log('Wishlists retrieved successfully');
                    resolve(rows._array);
                },
                (_, error) => {
                    console.error('Failed to retrieve Wishlists: ', error);
                    reject(error);
                }
            );
        });
    });
}