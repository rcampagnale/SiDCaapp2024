import { StatusBar, Text, View } from "react-native";

export default function CoursesTakenByMe(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',width:'100%',backgroundColor:'#ffffff'}}>    

        <View>
            <Text>
                Mis cursos actuales
            </Text>
        </View>
        </View>
    )
}