import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/quota/quota-styles'
export default function FileForQuotaPayment(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.quotaBox}>
                    <Text style={{width:'90%',fontSize:20,textAlign:'center'}}>Cuota adherentes segundo cuatrimestre 2024</Text>
                    <TouchableOpacity style={styles.btnGetForm} activeOpacity={1}>
                        <Text style={{color:'#ffffff'}}>Descargar Formulario de Pago</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.quotaBox}>
                    <Text style={{width:'90%',fontSize:20,textAlign:'center'}}>Cuota adherentes segundo cuatrimestre 2024</Text>
                    <TouchableOpacity style={styles.btnGetForm} activeOpacity={1}>
                        <Text style={{color:'#ffffff'}}>Descargar Formulario de Pago</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.quotaBox}>
                    <Text style={{width:'90%',fontSize:20,textAlign:'center'}}>Cuota adherentes segundo cuatrimestre 2024</Text>
                    <TouchableOpacity style={styles.btnGetForm} activeOpacity={1}>
                        <Text style={{color:'#ffffff'}}>Descargar Formulario de Pago</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.quotaBox}>
                    <Text style={{width:'90%',fontSize:20,textAlign:'center'}}>Cuota adherentes segundo cuatrimestre 2024</Text>
                    <TouchableOpacity style={styles.btnGetForm} activeOpacity={1}>
                        <Text style={{color:'#ffffff'}}>Descargar Formulario de Pago</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    )
}