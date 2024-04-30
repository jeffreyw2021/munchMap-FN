export const fetchNearbyPlaces = async (lat, lon, searchRadius=0.5) => {
    // clearPlacesCache();
    console.log("Fetching nearby places...");
    const halfRadius = searchRadius / 2;
    const cacheKey = 'places';
    const cachedData = await AsyncStorage.getItem(cacheKey);
    const currentLocation = { latitude: lat, longitude: lon };

    if (cachedData !== null) {
        const { data, location } = JSON.parse(cachedData);
        const distance = haversine(location, currentLocation, { unit: 'km' });

        console.log("Distance: ", distance);
        if (distance < halfRadius) {
            console.log("Using cached data");
            setPlaces(data);
            return;
        }
    }

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
        if (cachedData !== null) {
            const { data } = JSON.parse(cachedData);
            const newPlaces = mergePlaces(data, fetchedPlaces);
            setPlaces(newPlaces);
            console.log("successfully merged places");
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: newPlaces, location: currentLocation }));
        } else {
            setPlaces(fetchedPlaces);
            console.log("successfully fetched places");
            await AsyncStorage.setItem(cacheKey, JSON.stringify({ data: fetchedPlaces, location: currentLocation }));
        }
    } catch (error) {
        console.error("Failed to fetch places: ", error);
    }
};
const mergePlaces = (oldData, newData) => {
    const combined = [...oldData, ...newData];
    const unique = Array.from(new Set(combined.map(a => a.id))).map(id => {
        return combined.find(a => a.id === id);
    });
    return unique;
};