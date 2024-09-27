import { StatusBar, Text, View } from "react-native";

export default function FileForQuotaPayment(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View>
                <Text>
                    Cuotas Adherente
                </Text>
            </View>
        </View>
    )
}