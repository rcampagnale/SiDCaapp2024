import { StatusBar, Text, View } from "react-native";

export default function GeneralAdvice(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View>
                <Text>
                    Asesoria general
                </Text>
            </View>
        </View>
    )
}