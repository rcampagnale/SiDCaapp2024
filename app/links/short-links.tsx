import { View, StatusBar,ScrollView, Text, TouchableOpacity } from "react-native";
import styles from '../../styles/links/links-styles'
export default function ReferenceLinks(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{display:'flex',justifyContent:'center',alignItems:'center',paddingTop:10,rowGap:20}}>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.linksBox}>
                    <Text>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text>Link</Text>
                    </TouchableOpacity>
                </View>
                
            </ScrollView>
        </View>
        </View>
    )
}