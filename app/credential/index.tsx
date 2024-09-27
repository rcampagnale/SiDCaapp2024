import { ImageBackground, StatusBar, Text, View, Dimensions, Image } from "react-native";
import styles from '../../styles/cedential/credential-styles'
export default function GetCredentialCard(){
    const statusBarHeight = StatusBar.currentHeight;
    const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <ImageBackground style={styles.container} source={require('../../assets/home/card.png')} resizeMode="cover">
            <View style={styles.viewInfoContainer}>
                <View style={[{width:windowHeight - 20},styles.mainInformationContainer]}>
                    <Text style={{color:'#ffffff'}}>{windowHeight}</Text>
                    <Text style={{color:'#ffffff'}}>{windowWidth}</Text>
                    <Text>Ubicacion</Text>
                </View>            
            </View>            
            <View style={styles.cardNameContainer}>
                <Text style={{color:'#ffffff',fontSize:25,fontWeight:500,transform:'rotateZ(90deg)',width:300}}>Credencial de Afiliado</Text>
            </View>                                          
            <View style={styles.logosHeaderContainer}>
                <Image source={require('../../assets/logos/logo-01.png')} style={{width:50,height:50,transform:'rotateZ(90deg)'}}/> 
                <Image source={require('../../assets/logos/logo-01.png')} style={{width:50,height:50,transform:'rotateZ(90deg)'}}/> 
            </View>      
            </ImageBackground>
        </View>
    )
}