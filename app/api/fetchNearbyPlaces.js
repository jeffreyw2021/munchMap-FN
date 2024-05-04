import * as SQLite from 'expo-sqlite';
import axios from 'axios';

const overpassUrl = 'https://overpass-api.de/api/interpreter';
const db = SQLite.openDatabase('places.db');

const processPlaceData = (place) => {
    const { lat, lon, tags, name } = place;

    const placeName = name || (tags && tags.name);

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
const insertPlace = (place) => {
    const { name, lat, lon, attributes } = place;
    const query = `INSERT INTO Places (name, lat, lon, attributes) VALUES (?, ?, ?, ?)`;
    db.transaction(tx => {
        tx.executeSql(query, [name, lat, lon, attributes],
            () => console.log(`Place ${name} inserted successfully`),
            (_, error) => console.error(`Failed to insert place ${name}: `, error)
        );
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

        if (fetchedPlaces && fetchedPlaces.length > 0) {
            fetchedPlaces.forEach(place => {
                const processedPlace = processPlaceData(place);
                insertPlace(processedPlace);
            });
        } else {
            console.log('No places found');
        }
    } catch (error) {
        console.error("Failed to fetch places: ", error);
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