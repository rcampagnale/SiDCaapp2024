import {StyleSheet} from 'react-native'

export default advicerStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#091d24'
    },
    titleView:{
        width:'100%',
        height:40,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
    },
    viewInformation:{
        width:'100%',
        height:'auto',
        backgroundColor:'#fea200',
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        paddingTop:10,
        paddingBottom:10
    },
    btnsContainer:{
        width:'100%',
        height:250,
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center',
        flexDirection:'column',
        backgroundColor:'#fea200',
    },
    btnWhatsApp:{
        width:'80%',
        height:40,
        backgroundColor:'#25d366',
        borderRadius:7,
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center',
        flexDirection:'row',
        marginBottom:20
    },
    btnGetData:{
        width:'80%',
        height:40,
        borderRadius:5,
        backgroundColor:'#005CFE',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    btnBackToOptions:{
        width:'100%',
        height:40,
        backgroundColor:'#fea200',
        display:'flex',
        justifyContent:'flex-start',
        alignItems:'center',
        flexDirection:'row',
        marginBottom:15
    },
    btnBack:{
        width:'auto',
        height:'100%',
        marginLeft:15,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row'
    },
    linksBox:{
        width:'100%',
        height:150,
        backgroundColor:'#fea200',
        borderRadius:10,
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center'
    },
    btnGetLink:{
        width:'80%',
        height:40,
        borderRadius:5,
        backgroundColor:'#005CFE',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }
    
})