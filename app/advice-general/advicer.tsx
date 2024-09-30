import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/advices/advices-styles'
export default function GeneralAdvice(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={{fontSize:20,color:'#ffffff'}}>
                        Asesoria gremial
                    </Text>
                </View>
                <Image style={{width:'100%',height:150,}} source={require('../../assets/home/asesoramiento.jpg')} resizeMode="cover"/>
                <View style={styles.viewInformation}>
                    <Text style={{width:'95%'}}>SIDCA, Sindicato de Docentes de Catamarca, te ofrece su equipo asesoramiento juridico, en defensa de derechos. Reclamos y presentaciones administrativas, orientacion y asesoramiento en normativa especializada.</Text>
                </View>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Info paritarias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Escala salarial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Novedades</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnWhatsApp}>
                    <Text>Contacto</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}