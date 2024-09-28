import {StyleSheet} from 'react-native'

export default coursesStyles=StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        display:'flex',
        flexDirection:'column',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor:'#091d24',
    },
    scrollContainer:{
        width:'100%',
        height:200,        
    },
    textAboutCourse:{
        width:'100%',
        height:200,
        backgroundColor:'#fea200',
        display:'flex',
        justifyContent:'center',
        alignItems:'center'
    }
})