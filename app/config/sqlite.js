import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('places.db');

export const initDB = () => {
    db.transaction(tx => {
        // Check and create the Places table if it doesn't exist
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
                        attributes JSON
                    );`,
                    [],
                    () => console.log('Places table created successfully'),
                    (_, error) => console.error('Failed to create Places table', error)
                );
                return false; // Continue with the transaction
            }
        );
    });

    db.transaction(tx => {
        // Check and create the FetchedLocations table if it doesn't exist
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
};
