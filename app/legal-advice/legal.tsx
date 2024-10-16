import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/advices/advices-styles'
import { useState } from "react";

export default function LegalAdvices(){
    const statusBarHeight: number | undefined = StatusBar.currentHeight;
    const [advice,setAdvice]=useState<string | null>(null)
    const handleAdviceStatus=(value:string | null)=>{
        setAdvice(value)
    }
    let content;
    switch (advice) {
        case 'test':
            content='holaa'
            break;
    
        default:
            content='nada'
            break;
    }
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={{fontSize:20,color:'#ffffff'}}>
                        Asesoramiento Legal
                    </Text>
                </View>
                <Image style={{width:'100%',height:150,}} source={require('../../assets/home/juzgado.png')} resizeMode="cover"/>
                <View style={styles.viewInformation}>
                    <Text style={{width:'95%'}}>SIDCA, Sindicato de Docentes de Catamarca, te ofrece su equipo asesoramiento juridico, en defensa de derechos. Reclamos y presentaciones administrativas, orientacion y asesoramiento en normativa especializada.</Text>
                </View>
                <View style={styles.btnsContainer}>
                    <Text style={{fontSize:18}}>Normativas</Text>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Leyes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Decretos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Resoluciones</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}>
                        <Text style={{color:'#ffffff',fontSize:18}}>Otras disposiciones</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnWhatsApp}>
                    <Text style={{fontSize:18}}>Contacto</Text>
                    <Image
                        style={{width:30,height:30}}
                        source={require('../../assets/logos/whatsapp.png')}/>
                </TouchableOpacity>
            </View>
        </View>
    )
}