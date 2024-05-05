import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    overcast: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 20
    },
    filterBlock: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#fff',
        paddingBottom: 45,
        paddingTop: 12,
        borderTopColor: '#CFCFCF',
        borderTopWidth: 3,
        rowGap: 20
    },
    bottomBtns: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 30
    },
    bottomBtn: {
        flex: 1,
        overflow: 'visible'
    },
    bottomBtnContent: {
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 6,
        borderColor: '#000',
        borderWidth: 1,
    },
    bottomBtnShadow: {
        position: 'absolute',
        top: 3,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 6,
        zIndex: -1
    },

    filterRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 30,
        gap: 10,
    },
    filterRowBorder:{
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E9E9E9'
    },
    filterBtn: {
    },
    filterBtnContent: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        // backgroundColor: '#fff',
        borderRadius: 6,
        borderColor: '#000',
        borderWidth: 1,
    }
});
