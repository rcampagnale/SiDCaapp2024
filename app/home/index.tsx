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
                    <TouchableOpacity style={styles.btnActions}>
                        <Link href="/aboutus/about-sidca">Quienes somos</Link>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Link href="/credential">Credencial de Afiliado</Link>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Contacto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Cuotas Adherentes</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewInformation} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Informacion</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Capacitacions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Enlaces de utilidad</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewSupport} source={require('../../assets/home/asesoramiento.jpg')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Asesoramiento</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>General</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Legal</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
            <ImageBackground style={styles.viewBenefits} source={require('../../assets/home/casadocente.png')} resizeMode="cover">
                <Text style={{fontSize:22,fontWeight:600,color:'#ffffff'}}>Beneficios</Text>
                <View style={styles.btnsContainer}>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Turismo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Casa del docente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnActions}>
                        <Text>Predio recreativo</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </ScrollView>
        </View>
    )
}