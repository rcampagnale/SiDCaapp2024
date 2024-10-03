import {StyleSheet} from 'react-native'

export default linkStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        backgroundColor:'#091d24'
    },
    linksBox:{
        width:'85%',
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