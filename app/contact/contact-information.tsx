import { Text, View,StatusBar } from "react-native";
import styles from '../../styles/contact/contact-styles'
export default function ContactInformation(){
    const statusBarHeight = StatusBar.currentHeight;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <Text style={styles.titleContact}>
                    Medios de contacto
                </Text>
                <View>
                    <Text>
                        mesenger
                    </Text>
                </View>

            </View>
        </View>
    )
}