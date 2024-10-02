import { View, Text, TouchableOpacity } from "react-native";
import styles from '../../styles/advices/advices-styles'
import AntDesign from '@expo/vector-icons/AntDesign';

interface HandleAdviceStatus{
    setActionType:(value:null | string)=>void
}
export default function InformationParts({setActionType}:HandleAdviceStatus){
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
        <Text style={{color:'#ffffff',fontSize:20}}>Proximamente!!</Text>
        </View>
    )
}