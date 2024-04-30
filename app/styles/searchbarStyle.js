import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    overcast: {
        position: 'absolute',
        top: 70,
        width: '100%',
        justifyContent: 'flex-start',
        paddingBottom: 30,
        paddingHorizontal: 30,
        zIndex: 12,
        pointerEvents: 'box-none'
    },
    //search btn
    searchbtn: {
        height: 40,
        width: 40,
        borderRadius: 6,
    },
    searchBtnContent: {
        backgroundColor: "#fff",
        position: 'absolute',
        borderColor: "#000",
        borderWidth: 1,
        zIndex: 2,
        top: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent:'flex-start',
        alignItems:'center',
        padding: 12,
        columnGap: 12
    },
    searchBtnShadow: {
        position: 'absolute',
        borderWidth: 0,
        backgroundColor: "#000",
        zIndex: 1,
        top: 3,
        width: '100%'
    }
});