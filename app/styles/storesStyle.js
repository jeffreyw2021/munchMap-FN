import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export default StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    topContainer: {
        // backgroundColor: 'red',
        width: '100%',
        borderBottomColor: "#000",
        borderBottomWidth: 3,
        paddingHorizontal: 20,
        paddingTop: 70,
        paddingBottom: 25,
    },
    bottomPadding: {
        height: 110,
        width: '100%',
        backgroundColor: "#fff",
        borderTopColor: "#CFCFCF",
        borderTopWidth: 2,
    },
    userInfo: {
        width: '100%',
    },
    userInfoContent: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#000',
        paddingHorizontal: 15,
        paddingVertical: 10,
        rowGap: 12

    },
    userInfoShadow: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 3,
        borderRadius: 12,
        backgroundColor: '#000',
        zIndex: -1
    },
    userInfoTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        columnGap: 20
    },
    userInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        columnGap: 6
    },
    avatar: {
        width: 62.09,
        height: 55,
        marginRight: 8,
        transform: [
            { rotateY: '180deg' }
        ]
    },
    progressBar: {
        flex: 1,
        height: 5,
        borderRadius: 5,
        backgroundColor: '#F0F0F0'
    },

    listSwitch: {
        width: '100%',
        borderBottomColor: '#cfcfcf',
        borderBottomWidth: 3,
        flexDirection: 'row'
    },
    listSwitchBtn: {
        paddingVertical: 12,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listSwitchActive: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1
    },
    placeCardSlider: {
        width: '100%',
        borderBottomColor: '#E9E9E9',
        borderBottomWidth: 1,
        backgroundColor: '#DDD',
        pointerEvents: 'box-none'
    },
    placeCardHead: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '30%',
        backgroundColor: '#fff',
        zIndex: -2
    },
    placeCardTail: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#DDD',
    },
    placeCardBg: {
        position: 'absolute',
        left: 0,
        right: 0,
        width: screenWidth,
        backgroundColor: '#fff',
        zIndex: 1
    },
    placeCard: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        pointerEvents: 'box-none'
    },
    placeCardInner: {
        backgroundColor: '#fff',
        width: screenWidth,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
        columnGap: 15
    },
    placeCardEmoji: {
        width: 48,
        height: 48,
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },

    wishlistTop: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff'
    },
    addWishlistBtnContent: {
        height: 40,
        paddingHorizontal: 12,
        gap: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff'
    },
    addWishlistBtnShadow: {
        position: 'absolute',
        top: 3,
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 6,
        zIndex: -1
    },
    editWishlistBtnContent: {
        height: 30,
        paddingHorizontal: 12,
        gap: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff'
    },
    editWishlistBtnShadow: {
        position: 'absolute',
        top: 3,
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 6,
        zIndex: -1
    },
    editBtnContent: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff'
    },
    editBtnShadow: {
        position: 'absolute',
        top: 3,
        height: '100%',
        width: '100%',
        backgroundColor: '#000',
        borderRadius: 6,
        zIndex: -1
    },

    overcast: {
        position: 'absolute',
        flex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 100,
    }
});
