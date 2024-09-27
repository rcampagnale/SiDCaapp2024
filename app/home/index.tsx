import { StatusBar, Text, View, ScrollView, TouchableOpacity, ImageBackground } from "react-native";
import styles from '../../styles/home-styles/home-styles'
import { Link } from "expo-router";
export default function HomePage(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.topBar}>
                <Text>Salir</Text>
            </View>
        <ScrollView  contentContainerStyle={{justifyContent:'space-between',rowGap:20,backgroundColor:'#091d24'}}>
            <ImageBackground style={styles.viewAbout} source={require('../../assets/home/nosotros.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Nosotros</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Link href="/aboutus/about-sidca">Quienes somos</Link>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Link href="/credential">Credencial de Afiliado</Link>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Link href="/contact/contact-information">Contacto</Link>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Cuotas Adherentes</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewInformation} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Informacion</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Capacitacions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Enlaces de utilidad</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewSupport} source={require('../../assets/home/asesoramiento.jpg')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Asesoramiento</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Legal</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewBenefits} source={require('../../assets/home/casadocente.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Beneficios</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Turismo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Casa del docente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions} activeOpacity={1}>
                        <Text>Predio recreativo</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
        </View>
    )
}