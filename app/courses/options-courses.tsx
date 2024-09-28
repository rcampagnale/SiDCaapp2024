import { ImageBackground, Text, TouchableOpacity,View } from "react-native";
import styles from '../../styles/courses/courses-styles'
interface HandleOptionsCourse{
    setActionType:(value:null | string)=>void
}
export default function HandleCourses ({setActionType}:HandleOptionsCourse){
    return(
        <>
        <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff',fontSize:20,fontWeight:600}}>
                        Mis Cursos
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo} activeOpacity={1}
                        onPress={()=>setActionType('see')}
                    >
                        <Text style={{color:'#ffffff',fontSize:20}}>Ver</Text>
                    </TouchableOpacity>
                </ImageBackground>
                <ImageBackground style={styles.cardCourses} source={require('../../assets/home/capacitaciones.png')} resizeMode="cover">
                    <Text style={{color:'#ffffff',fontSize:20,fontWeight:600}}>
                        Nuevos Cursos
                    </Text>
                    <TouchableOpacity style={styles.btnSeeInfo}
                        onPress={()=>setActionType('verify')}
                    >
                        <Text style={{color:'#ffffff',fontSize:20}}>Ver</Text>
                    </TouchableOpacity>
                </ImageBackground>
        </>
    )
}