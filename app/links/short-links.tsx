import { View, StatusBar,ScrollView, Text, TouchableOpacity } from "react-native";
import styles from '../../styles/links/links-styles'
export default function ReferenceLinks(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{display:'flex',justifyContent:'center',alignItems:'center',paddingTop:10,rowGap:20}}>
                <View style={styles.linksBox}>
                    <Text style={{fontSize:20,fontWeight:'bold'}}>Accidente de Trabajo</Text>
                    <TouchableOpacity style={styles.btnGetLink}>
                        <Text style={{fontSize:18,color:'#ffffff'}}>Link</Text>
                    </TouchableOpacity>
                </View>
              
                
            </ScrollView>
        </View>
        </View>
    )
}