import {StyleSheet} from 'react-native'

export default quotaStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#091d24',
        paddingTop:10
    },
    quotaBox:{
        width:'85%',
        height:150,
        backgroundColor:'#fea200',
        borderRadius:10,
        display:'flex',
        justifyContent:'space-around',
        alignItems:'center'
    },
    btnGetForm:{
        width:'80%',
        height:40,
        borderRadius:5,
        backgroundColor:'#005CFE',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }
})