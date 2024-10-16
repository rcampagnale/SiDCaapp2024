import { Image,  Linking,  Text, TouchableOpacity, View } from "react-native";
import styles from '../../styles/advices/advices-styles'
interface HandleAdviceStatus{
    setActionType:(value:null | string)=>void
}
export default function MainComponent({setActionType}:HandleAdviceStatus){
    const openWspNumber=(urlMedia:string)=>{
        Linking.openURL(urlMedia)
    }
    return(
        <>
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
                    <TouchableOpacity style={styles.btnGetData}
                        onPress={()=>setActionType('information')}
                    >
                        <Text style={{color:'#ffffff',fontSize:18}}>Info paritarias</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}
                        onPress={()=>setActionType('salary')}                    
                    >
                        <Text style={{color:'#ffffff',fontSize:18}}>Escala salarial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnGetData}
                        onPress={()=>setActionType('news')}
                    >
                        <Text style={{color:'#ffffff',fontSize:18}}>Novedades</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.btnWhatsApp}
                    activeOpacity={1}
                    onPress={()=>openWspNumber('https://wa.me/5493834051983')}
                >
                    <Text style={{fontSize:18}}>Contacto</Text>
                    <Image
                        style={{width:30,height:30}}
                        source={require('../../assets/logos/whatsapp.png')}/>
                </TouchableOpacity></>
    )
   
}