import { StyleSheet } from 'react-native';

export default StyleSheet.create({

    overcast: {
        position: 'absolute',
        flex: 1,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 21
    },
    detailBlock: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        paddingBottom: 45,
        paddingHorizontal: 30,
        paddingTop: 20,
        borderTopColor: '#CFCFCF',
        borderTopWidth: 3,
        rowGap: 25
    },
    bottomBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        gap: 10
    },
    cancelBtnContent: {
        height: 40,
        width: 40,
        borderRadius: 6,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    cancelBtnShadow: {
        top: 3,
        position: 'absolute',
        height: 40,
        width: 40,
        borderRadius: 6,
        backgroundColor: '#000',
        zIndex: -1,
    },
    reRollBtnContent: {
        height: 40,
        width: '100%',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        flexDirection: 'row',
        gap: 8
    },
    reRollBtnBackground:{
        position: 'absolute',
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#fff',
        zIndex: -1,
        overflow:'hidden'
    },
    reRollBtnBackgroundInner:{
        height:40
    },
    rotatedIcon: {
        transform: [
            { rotateX: '180deg' },
            { rotateY: '180deg' },
        ]
    },
    reRollShadow: {
        top: 3,
        position: 'absolute',
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#000',
        zIndex: -2,
    },

    midBtns:{
        flex:1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    learnMoreBtnContent:{
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        flexDirection: 'row',
        columnGap: 8
    },
    learnMoreBtnShadow:{
        top: 3,
        position: 'absolute',
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#000',
        zIndex: -1,
    },
    navigateBtnContent:{
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
        flexDirection: 'row',
        columnGap: 8
    },
    navigateBtnShadow:{
        top: 3,
        position: 'absolute',
        height: 40,
        width: '100%',
        borderRadius: 6,
        backgroundColor: '#000',
        zIndex: -1,
    },
    topContent:{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10
    },
    saveBtnContent:{
        height: 40,
        width: 40,
        borderRadius: 6,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    saveBtnShadow:{
        top: 3,
        position: 'absolute',
        height: 40,
        width: 40,
        borderRadius: 6,
        backgroundColor: '#000',
        zIndex: -1,
    },
    tagContainer:{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    },
    tag:{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        backgroundColor: '#F0F0F0',
    }

});