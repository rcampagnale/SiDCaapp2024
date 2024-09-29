import { TouchableOpacity, Text, View } from "react-native";
import styles from '../../styles/courses/courses-styles'
import AntDesign from '@expo/vector-icons/AntDesign';

interface HandleOptionsCourse{
    setActionType:(value:null | string)=>void
}
export default function CoursesTakenByMe({setActionType}:HandleOptionsCourse){

    return(
        <View  style={{height:'100%',width:'100%',backgroundColor:'#091d24'}}>    
        <View style={styles.btnBackToOptions}>
            <TouchableOpacity style={styles.btnBack}
                onPress={()=>setActionType(null)}
            >
            <AntDesign name="back" size={24} color="black" />
                <Text style={{fontSize:18,marginLeft:5}}>Volver</Text>
            </TouchableOpacity>
        </View>
        <View>
            <Text style={{color:'#ffffff'}}>
                Mis cursos actuales
            </Text>
        </View>
        </View>
    )
}