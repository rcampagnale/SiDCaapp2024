import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import styles from '../../styles/courses/courses-styles'
export default function GetCoursesOptions(){
    const statusBarHeight = StatusBar.currentHeight;

    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>    
            <View style={styles.container}>
                <View style={styles.scrollContainer}>
                    <ScrollView style={{width:'100%',height:'100%'}} horizontal={true} contentContainerStyle={{display:'flex',justifyContent:'space-around',alignItems:'center',columnGap:10}}>
                        <Image style={{width:150,height:80}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:150,height:80}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:150,height:80}} source={require('../../assets/home/nosotros.png')} />
                        <Image style={{width:150,height:80}} source={require('../../assets/home/nosotros.png')} />

                    </ScrollView>
                </View>
                
                <View style={styles.textAboutCourse}>
                    <Text>
                        El programacion de capacitacion de SIDCA brinda durante todo el año ofertas de capacitacion y perfecionamiento docente gratuita a sus afiliados, mediante cursos, talleres, congresos y seminarios que propician
                        el acceso a material innovador y actualizado, contribuyendo en la profesionalizacion de nuestros docentes.                        
                    </Text>                    
                </View>
                <View>
                    <Text>
                        Cards
                    </Text>
                </View>
            </View>
        </View>
    )
}