import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;

export default StyleSheet.create({
    container:{
        width: '100%', 
        flex: 1, 
        backgroundColor: "#f5f5f5"
    },
    map:{
        width: '100%',
        height: '120%',
        marginTop: '-25%'
    },
    filterIndicator:{
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection:'row',
        columnGap: 5,
        borderRadius: 6,
        borderColor: "#000",
        borderWidth: 1,
        alignItems: 'center',
        alignSelf: 'flex-start',
        position: 'absolute',
        left: 60,
        pointerEvents: 'box-none'
    },
    overcast:{
        position:'absolute', 
        right: 30, 
        bottom: 97,
        width: screenWidth,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        zIndex: 10,
        pointerEvents: 'box-none'
    },
    resetMapBtn:{
        height: 40,
        width: 40,
        overflow: 'visible',
        zIndex: 10,
    },
    resetBtnContent:{
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        zIndex: 1,
        borderColor: '#000',
        borderWidth: 1,
    },
    resetBtnShadow:{
        top: 3,
        position: 'absolute',
        backgroundColor: '#000',
        borderRadius: 20,
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    userAvatar:{
        height: 42,
        width: 47.41,
    },
    markerOvercast:{
        position:'absolute', 
        zIndex: 2, 
        height:'100%', 
        width: '100%'
    }
});