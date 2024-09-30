import { View, Text, StatusBar, ScrollView, Image, TouchableOpacity } from "react-native";
import styles from '../../styles/tourist/tourist-styles'
export default function HandleTourist(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.viewTitle}>
                    <Text style={{fontSize:24,color:'#ffffff'}}>
                        Turismo
                    </Text>
                </View>
                <View style={styles.viewInformation}>
                    <Text>
                        SIDCA desarrolla su programa de turismo social para sus afiliados, con la firma de convenios con otras entidades gremiales
                        a nivel pais que permiten disfrutar del tiempo libre y vacacional mediante sus planes de paseo a corredores turisticos de la Argentina y
                        Catamarca, gozando de los mejores paisajes y servicios. !Sumate a los beneficios!
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