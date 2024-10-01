import { View, Text, TouchableOpacity } from "react-native";
interface HandleAdviceStatus{
    setActionType:(value:null | string)=>void
}
export default function InformationParts({setActionType}:HandleAdviceStatus){
    return(
        <View>
            <Text style={{color:'#ffffff'}}>
                info paritarias
            </Text>
            <TouchableOpacity 
                style={{width:100,height:40}}
                onPress={()=>setActionType(null)}
            >
            <Text style={{color:'#ffffff'}}>
                Cerrar
            </Text>
            </TouchableOpacity>
        </View>
    )
}