import { Text, View,StatusBar, TouchableOpacity } from "react-native";
import styles from '../../styles/contact/contact-styles'
export default function ContactInformation(){
    const statusBarHeight = StatusBar.currentHeight;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.titleContact}>
                    <Text style={styles.textTitle}>
                        Medios de contacto
                    </Text>
                </View>
                <View style={styles.mediasContactContainer}>
                    <Text style={{fontSize:20,fontWeight:500}}>
                       Numeros de WhatsApp
                    </Text>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>Asesoramiento General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>Departamento Juridico</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>SiDCa Gestion</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>SiDCa Turismo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>Casa del Docente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnWhatsApp} activeOpacity={1}>
                        <Text>SiDCA Radio</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.footerContainer}>
                    <Text style={{width:'90%'}}>
                        Sede central Ayacucho 2271 1° Piso, San Fernando del Valle de Catamarca, Catamarca CP 4700
                    </Text>
                </View>
            </View>
        </View>
    )
}