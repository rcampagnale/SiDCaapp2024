import { ImageBackground, StatusBar, Text, View, Dimensions, Image } from "react-native";
import styles from '../../styles/cedential/credential-styles'
export default function GetCredentialCard(){
    const statusBarHeight:number | undefined  = StatusBar.currentHeight;
const windowHeight = Dimensions.get('window').height;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <ImageBackground style={styles.container} source={require('../../assets/home/card.png')} resizeMode="cover">
            <View style={styles.viewInfoContainer}>
                <View style={[{width:windowHeight - 20},styles.mainInformationContainer]}>
                    <Text style={{color:'#ffffff',fontSize:18}}>Nombre del afiliado</Text>
                    <Text style={{color:'#ffffff',fontSize:18}}>Numero de identificacion</Text>
                    <Text style={{color:'#ffffff',fontSize:18}}>Ubicacion</Text>
                </View>            
            </View>            
            <View style={styles.cardNameContainer}>
                <Text style={{color:'#ffffff',fontSize:25,fontWeight:500,transform:'rotateZ(90deg)',width:300}}>Credencial de Afiliado</Text>
            </View>                                          
            <View style={styles.logosHeaderContainer}>
                <Image source={require('../../assets/logos/logo-01.png')} style={{width:80,height:80,transform:'rotateZ(90deg)'}} resizeMode="contain"/> 
                <Image source={require('../../assets/logos/cea.jpg')} style={{width:80,height:80,transform:'rotateZ(90deg)'}} resizeMode="contain"/> 
            </View>      
            </ImageBackground>
        </View>
    )
}