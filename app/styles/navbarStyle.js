import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    overcast:{
        position: 'absolute',
        bottom: 45,
        width: '100%',
        justifyContent:'flex-end',
        paddingHorizontal:20,
        rowGap: 12,
        zIndex: 10,
        pointerEvents: 'box-none'
    },

    //navbar
    navbar:{
        height: 40,
        width: '100%',
        overflow:'visible',
        flexDirection:'row',
        columnGap:5,
        alignItems:'flex-end'
    },
    navbtn:{
        height: 40,
        width: 40,
        borderRadius: 6,
    },
    rollbtn:{
        flex:1,
        backgroundColor:"transparent",
    },
    btnWhiteBackground:{
        backgroundColor: "#fff",
        position:'absolute',
        width: '100%',
        zIndex: 1,
    },
    btnGradBackground:{
        position:'absolute',
        zIndex: 2,
        borderRadius: 6,
        overflow: 'hidden',
        width: '100%'
    },
    btnGradBackgroundInner:{
        height: '100%'
    },
    btnContent:{
        backgroundColor: "#fff",
        position:'absolute',
        borderColor: "#000",
        borderWidth:1,
        zIndex:3,
        top: 0,
        width: '100%',
        justifyContent: 'center',
        alignItems:'center',
        flexDirection:'row',
        columnGap: 8
    },
    btnShadow:{
        position:'absolute',
        borderWidth:0,
        backgroundColor: "#000",
        zIndex:-1,
        top: 3,
        width: '100%'
    }
});
