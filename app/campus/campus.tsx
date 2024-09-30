import { View, Text, StatusBar, ScrollView, Image, TouchableOpacity } from "react-native";
import styles from '../../styles/tourist/tourist-styles'
export default function HandleCampusTeachers(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.viewTitle}>
                    <Text style={{fontSize:24,color:'#ffffff'}}>
                        Casa del Docente
                    </Text>
                </View>
                <View style={styles.viewInformation}>
                    <Text>
                     SIDCA proximamente inagurar su predio deportivo cultural y recreativo, para todos sus afiliados. Salon de usos multiples, cancha de futbol y voley.
                     Un predio para la familia docente en Banda de Varela a metros de Rios del Valle. !Sumate a nuestros Beneficios¡
                    </Text>
                </View>
                <View style={styles.carruselContainer}>
                    <ScrollView style={styles.carrusel} contentContainerStyle={{justifyContent:'space-between',alignItems:'center',columnGap:15}} horizontal={true} showsHorizontalScrollIndicator={false}>
                        <Image
                            style={{width:200,height:130}}
                            source={require('../../assets/home/casadocente.png')} 
                            resizeMode="cover"/>
                            <Image
                            style={{width:200,height:130}}
                            source={require('../../assets/home/casadocente.png')} 
                            resizeMode="cover"/>
                            <Image
                            style={{width:200,height:130}}
                            source={require('../../assets/home/casadocente.png')} 
                            resizeMode="cover"/>
                    </ScrollView>
                </View>
                <View style={styles.viewGetInformation}>
                    <Text style={{fontSize:24,fontWeight:600}}>Hace tu reserva</Text>
                    <TouchableOpacity style={styles.btnWhatsApp}>
                    <Text style={{fontSize:18}}>Contacto</Text>
                    <Image
                        style={{width:30,height:30}}
                        source={require('../../assets/logos/whatsapp.png')}/>
                </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnNews}>
                    <Text>Novedades</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}