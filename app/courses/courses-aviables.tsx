import { View, Text, StatusBar } from "react-native";

export default function CourseAviablesForMe(){
    const statusBarHeight = StatusBar.currentHeight;
    return(
        <View  style={{height:'100%',width:'100%',backgroundColor:'#ffffff'}}>    

            <View>
                <Text>
                    Cursos disponibles
                </Text>
            </View>
        </View>
    )
}