import {StyleSheet} from 'react-native'

export default signInStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        backgroundColor:'#091d24'
    },
    viewGetData:{
        width:'100%',               
        display:'flex',
        justifyContent:'space-between',
        alignItems:'center',
        flexDirection:'column'
    },
    viewShowMedias:{
        width:'100%',
        height:150,        
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-around',
        alignItems:'center'
    },
    mediasBtns:{
        width:43,
        height:43,        
        borderRadius:5,
    },    
    logoSignin:{
        width:'100%',
        height:170,        
    },
    formContainer:{
        width:'80%',
        height:'35%',      
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center'
    },
    inputForm:{
        width:'100%',
        height:45,
        backgroundColor:'#fea200',
        borderRadius:5,
        paddingLeft:10
    },
    btnGetIn:{
        width:'100%',
        height:45,
        backgroundColor:'#fea200',
        borderRadius:5,
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    btnAfiliate:{
        width:'80%',
        height:45,
        backgroundColor:'#fea200',
        borderRadius:5,
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    viewAfiliate:{
        width:'100%',
        height:100,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ffffff'
    }  
})