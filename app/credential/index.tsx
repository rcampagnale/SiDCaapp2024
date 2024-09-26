import { StatusBar, Text, View } from "react-native";

export default function GetCredentialCard(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View>
            <Text>
                Credencial de afiliado
            </Text>
            </View>
        </View>
    )
}