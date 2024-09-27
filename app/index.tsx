import { Text, TouchableOpacity, View, Linking,ImageBackground, TextInput, Keyboard, Image, StatusBar } from "react-native";
import styles from '../styles/signin-styles/sign-in-styles'
import { useEffect, useState } from "react";
import { Link } from "expo-router";

export default function SignInApp(){
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const statusBarHeight = StatusBar.currentHeight;
     
    const openSocialMedia=(urlMedia:string)=>{
        Linking.openURL(urlMedia)
    }
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
          setKeyboardVisible(true);
        });
    
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
          setKeyboardVisible(false);
        });
    
        // Limpieza de los listeners cuando el componente se desmonta
        return () => {
          keyboardDidShowListener.remove();
          keyboardDidHideListener.remove();
        };
      }, []);
    return(
        <View  style={{height:'100%',paddingTop:statusBarHeight}}>
            <View style={styles.container}>
                <View style={[styles.viewGetData,{height: isKeyboardVisible ? '100%' : '60%' }]}>
                   <ImageBackground source={require('../assets/logos/logo-01.png')} resizeMode="contain" style={styles.logoSignin}>                        
                   </ImageBackground>
                   <View style={styles.formContainer}>
                        <Text style={{fontSize:20,color:'#ffffff'}}>Ingresar con tu DNI de afiliado</Text>
                        <TextInput 
                            style={styles.inputForm}
                            placeholder="  D.N.I."
                        ></TextInput>
                        <TouchableOpacity style={styles.btnGetIn} activeOpacity={1}>
                            <Link href="/home" style={{fontSize:20,fontWeight:500}}>INGRESAR</Link>
                        </TouchableOpacity>
                   </View>
                   <ImageBackground style={styles.viewAfiliate} source={require('../assets/signinFotos/afiliate.png')} resizeMode="cover">
                    <TouchableOpacity style={styles.btnAfiliate} activeOpacity={1}>
                            <Link href="/form-register/create-new-user" style={{fontSize:20,fontWeight:500}}>AFILIARSE</Link>
                        </TouchableOpacity>
                   </ImageBackground>
                </View>
                {isKeyboardVisible === false ?                  
                <ImageBackground                     
                    source={require('../assets/signinFotos/redes.png')}
                    resizeMode="cover"
                    style={styles.viewShowMedias}>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.google.com')}
                    >
                        <Image 
                            style={{width:'100%',height:'100%'}}
                            source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.facebook.com')}
                    >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.google.com')}
                        >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.google.com')}
                        >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={{uri: 'https://reactnative.dev/img/tiny_logo.png'}}/>
                    </TouchableOpacity>
                </ImageBackground>
                :null}
            </View>            
        </View>
    )
}