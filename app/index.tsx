import { Text, TouchableOpacity, View, Linking,ImageBackground, TextInput, Keyboard, Image, StatusBar, ActivityIndicator } from "react-native";
import styles from '../styles/signin-styles/sign-in-styles'
import { useEffect, useState,useContext } from "react";
import { router } from "expo-router";
import {getFirestore, collection, getDocs} from 'firebase/firestore'
import { firebaseconn } from "@/constants/FirebaseConn";
import { SidcaContext } from "./_layout";
export default function SignInApp(){    
    const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false); 
    const [dniNumber,setDniNumber]=useState<string>('')
    const statusBarHeight : number | undefined = StatusBar.currentHeight; 
    const{setUserData}=useContext(SidcaContext)
    const openSocialMedia=(urlMedia:string)=>{
        Linking.openURL(urlMedia)
    } 
    const analytics = getFirestore(firebaseconn) 
    const data=collection(analytics,'nuevoAfiliado')
    
    const findUser = async () => {
        if(dniNumber === '')return alert('Ingrese un Numero Valido!!')
        setLoading(true); 
        try {
            const response = (await getDocs(data)).docs;                    
            if( response.some(user => user.data().dni = dniNumber) === false) {
                alert('DNI no encontrado')
            }else if(response.find(item => item.data().dni === dniNumber) !== undefined){
                const resultado = response.find(item => item.data().dni === dniNumber);
                setUserData(resultado?.data())
                router.navigate('/home');
                setDniNumber('')
            }else{
                alert('DNI no registrado')
            }                
        } catch (error) {
            alert(`error: ${error}`);
        } finally {
            setLoading(false); 
        }
    };
    
    const handleDniChange = (text: string) => {
        setDniNumber(text); 
    };
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
                            placeholder="D.N.I."
                            value={dniNumber} 
                            onChangeText={handleDniChange} 
                        ></TextInput>
                        <TouchableOpacity style={styles.btnGetIn} activeOpacity={1}
                            onPress={findUser}                        
                        >                            
                            {loading === true ? <ActivityIndicator size="large" color="#ffffff" /> : <Text style={{fontSize:20,fontWeight:500}}>INGRESAR</Text>}
                        </TouchableOpacity>
                   </View>
                   <ImageBackground style={styles.viewAfiliate} source={require('../assets/signinFotos/afiliate.png')} resizeMode="cover">
                    <TouchableOpacity style={styles.btnAfiliate} activeOpacity={1}
                            onPress={()=>router.navigate("/form-register/create-new-user")}  
                            disabled={loading}                      
                    >
                            <Text style={{fontSize:20,fontWeight:500}}>AFILIARSE</Text>
                        </TouchableOpacity>
                   </ImageBackground>
                </View>
                {isKeyboardVisible === false ?                  
                <ImageBackground                     
                    source={require('../assets/signinFotos/redes.png')}
                    resizeMode="cover"
                    style={styles.viewShowMedias}>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://youtube.com/@sidcacatamarca2424?si=dQTZ6oWZQLSizYLN')}
                    >
                        <Image 
                            style={{width:'100%',height:'100%'}}
                            source={require('../assets/logos/youtube.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.facebook.com/profile.php?id=100058046356234')}
                    >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={require('../assets/logos/facebook.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.google.com')}
                        >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={require('../assets/logos/cromo.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.mediasBtns}
                        onPress={()=>openSocialMedia('https://www.instagram.com/sidcagremio?igsh=N2Q4aGkzN3lhbzRl')}
                        >
                         <Image 
                            style={{width:'100%',height:'100%'}}
                            source={require('../assets/logos/instagram.png')}/>
                    </TouchableOpacity>
                </ImageBackground>
                :null}
            </View>            
        </View>
    )
}