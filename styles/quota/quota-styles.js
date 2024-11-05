import {StyleSheet} from 'react-native'

export default quotaStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-around',
        alignItems:'center',
        backgroundColor:'#091d24',
        paddingTop:10
    },
    quotaBox:{
        width: "90%",
    height: '78%',
    backgroundColor: "#fea200",
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    },
    btnGetAlias:{
        width:'80%',
        height:40,
        borderRadius:5,
        backgroundColor:'#005CFE',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    btnWhatsApp:{
        width:'80%',
        height:40,
        backgroundColor:'#25d366',
        borderRadius:7,
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'row',
    }
})