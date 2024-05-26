import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

const deleteAllTables = () => {
    db.transaction(tx => {

        tx.executeSql(
            `DROP TABLE IF EXISTS Places;`,
            [],
            () => console.log('Places table deleted successfully'),
            (_, error) => console.error('Failed to delete Places table', error)
        );

        tx.executeSql(
            `DROP TABLE IF EXISTS FetchedLocations;`,
            [],
            () => console.log('FetchedLocations table deleted successfully'),
            (_, error) => console.error('Failed to delete FetchedLocations table', error)
        );

        tx.executeSql(
            `DROP TABLE IF EXISTS SavedPlaces;`,
            [],
            () => console.log('SavedPlaces table deleted successfully'),
            (_, error) => console.error('Failed to delete SavedPlaces table', error)
        );

        tx.executeSql(
            `DROP TABLE IF EXISTS Wishlists;`,
            [],
            () => console.log('Wishlists table deleted successfully'),
            (_, error) => console.error('Failed to delete Wishlists table', error)
        );
    });
};
export const createWishlist = (listName) => {
    if (!listName || listName === '') {
        console.error("List name is required");
        return;
    }

    db.transaction(tx => {
        tx.executeSql(
            `INSERT INTO Wishlists (listName, wishlistPlacesId) VALUES (?, ?);`,
            [listName],
            (_, result) => {
                const insertId = result.insertId;
                if (!insertId) {
                    console.error("Failed to retrieve insert ID");
                    return; 
                }
            },
            (_, error) => {
                console.error('Failed to add wishlist to Wishlists table', error);
            }
        );
    });
};
export const deleteWishlist = (listId) => {
    if (!listId || listId === '') {
        console.error("List ID is required");
        return;
    }

    db.transaction(tx => {
        tx.executeSql(
            `DELETE FROM Wishlists WHERE id = ?;`,
            [listId],
            () => console.log('Wishlist deleted successfully'),
            (_, error) => console.error('Failed to delete wishlist from Wishlists table', error)
        );
    });
}

export const initDB = () => {
    // deleteAllTables();

    // Check and create the Places table if it doesn't exist
    db.transaction(tx => {
        tx.executeSql(
            `SELECT 1 FROM Places LIMIT 1;`,
            [],
            () => {
                console.log('Places table already exists');
            },
            () => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS Places (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        lat REAL,
                        lon REAL,
                        attributes JSON,
                        emoji TEXT
                    );`,
                    [],
                    () => console.log('Places table created successfully'),
                    (_, error) => console.error('Failed to create Places table', error)
                );
                return false; // Continue with the transaction
            }
        );
    });

    // Check and create the FetchedLocations table if it doesn't exist
    db.transaction(tx => {
        tx.executeSql(
            `SELECT 1 FROM FetchedLocations LIMIT 1;`,
            [],
            () => {
                console.log('FetchedLocations table already exists');
            },
            () => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS FetchedLocations (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        lat REAL,
                        lon REAL,
                        radius REAL
                    );`,
                    [],
                    () => console.log('FetchedLocations table created successfully'),
                    (_, error) => console.error('Failed to create FetchedLocations table', error)
                );
                return false;
            }
        );
    });

    // Check and create the SavedPlaces table if it doesn't exist
    db.transaction(tx => {
        tx.executeSql(
            `SELECT 1 FROM SavedPlaces LIMIT 1;`,
            [],
            () => {
                console.log('SavedPlaces table already exists');
            },
            () => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS SavedPlaces (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT,
                        lat REAL,
                        lon REAL,
                        attributes JSON,
                        emoji TEXT
                    );`,
                    [],
                    () => console.log('SavedPlaces table created successfully'),
                    (_, error) => console.error('Failed to create SavedPlaces table', error)
                );
                return false;
            }
        );
    });

    // Check and create the UserProfile table if it doesn't exist
    db.transaction(tx => {
        tx.executeSql(
            `SELECT 1 FROM UserProfile LIMIT 1;`,
            [],
            () => {
                console.log('UserProfile table already exists');
            },
            () => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS UserProfile (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT,
                        uid INTEGER,
                        level INTEGER,
                        email TEXT,
                        phone TEXT,
                        password TEXT
                    );`,
                    [],
                    () => console.log('UserProfile table created successfully'),
                    (_, error) => console.error('Failed to create UserProfile table', error)
                );
                return false;
            }
        );
    });

    // Check and create the Wishlists table if it doesn't exist
    db.transaction(tx => {
        tx.executeSql(
            `SELECT 1 FROM Wishlists LIMIT 1;`,
            [],
            () => {
                console.log('Wishlists table already exists');
            },
            () => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS Wishlists (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        listName TEXT,
                        wishlistPlacesId TEXT
                    );`,
                    [],
                    () => console.log('Wishlists table created successfully'),
                    (_, error) => console.error('Failed to create Wishlists table', error)
                );
                return false;
            }
        );
    });
};
