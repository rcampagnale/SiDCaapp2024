import { Text, View, StatusBar, ScrollView, TextInput, TouchableOpacity } from "react-native";
import styles from '../../styles/new-user-styles/create-user-styles';
import React, { useState } from "react";
import {getFirestore, collection, addDoc} from 'firebase/firestore'
import { firebaseconn } from "@/constants/FirebaseConn";
interface NewUserTypes{
        nombre:string,
        apellido:string,
        documento:string,
        email:string,
        celular:string,
        departamento:string,
        establecimiento:string
}
export default function CreateNewUser() {
    const statusBarHeight:number | undefined  = StatusBar.currentHeight;
    const [newUser,setNewUser]=useState<NewUserTypes>({
        nombre:'',
        apellido:'',
        documento:'',
        email:'',
        celular:'',
        departamento:'',
        establecimiento:''
    })
    const analytics = getFirestore(firebaseconn) 
    const dataAdd=collection(analytics,'nuevoAfiliado')
    const handleNewUserData=(key:string ,value:string )=>{
        setNewUser({...newUser,[key]:value})
      }
    const onSubmitForm=async()=>{
        console.log(newUser)
        const test={
            apellido:'hola',
            celular:"123123123",
            cod:1231,
            departamento:"Valle Viejo",
            descuento:"si",
            dni:"37282591",
            email:"testest@gmail.com",
            establecimientos:"",
            fecha:"15/09/2022 21:23:01",
            nombre:"test"
        }
        const testeado= await addDoc(dataAdd,test)
         return console.log(testeado.id)
     
    }
    return (
        <View style={{ flex: 1, paddingTop: statusBarHeight }}>
            <ScrollView style={{backgroundColor:'#091d24'}} contentContainerStyle={{justifyContent:'space-between',alignItems:'center',rowGap:20}}>
                <View style={styles.viewInformation}>
                    <Text style={{fontSize:22,fontWeight:600,alignSelf:'center'}}>Beneficios para afiliados:</Text>
                    <Text>ASESORAMIENTO LEGAL, PREVISIONAL Y SINDICAL</Text>
                    <Text>CAJA COMPLEMENTARIA DOCENTE</Text>
                    <Text>GESTION DE TRAMITES DE EXPEDIENTES</Text>
                    <Text>RECLAMOS ADMINISTRATIVOS</Text>
                    <Text>CAPACITACION DOCENTE GRATUITA</Text>
                    <Text>ALOJAMIENTO EN CASA DE DOCENTE</Text>
                    <Text>CONVENIO DE ALOJAMIENTO EN OTRAS PROVINCIAS</Text>
                    <Text>PLANES DE TURISMO FAMILIAR</Text>
                </View>
                <View style={styles.viewFormContainer}>
                    <Text style={{color:'#ffffff',fontWeight:'bold',width:'90%'}}>Al afiliarse, acepta que se descontarán cuotas y servicios sociales de su salario.</Text>

                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Nombre</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.nombre}
                            onChangeText={(getValue)=>handleNewUserData('nombre',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Apellido</Text>
                        <TextInput style={styles.inputForm}
                             value={newUser.apellido}
                             onChangeText={(getValue)=>handleNewUserData('apellido',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>DNI</Text>
                        <TextInput style={styles.inputForm} 
                            value={newUser.documento}
                            onChangeText={(getValue)=>handleNewUserData('documento',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Email</Text>
                        <TextInput style={styles.inputForm} 
                            value={newUser.email}
                            onChangeText={(getValue)=>handleNewUserData('email',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Celular</Text>
                        <TextInput style={styles.inputForm} 
                             value={newUser.celular}
                             onChangeText={(getValue)=>handleNewUserData('celular',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Departamento</Text>
                        <TextInput style={styles.inputForm} 
                            value={newUser.departamento}
                            onChangeText={(getValue)=>handleNewUserData('departamento',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Establecimientos</Text>
                        <TextInput style={styles.inputForm} 
                             value={newUser.establecimiento}
                             onChangeText={(getValue)=>handleNewUserData('establecimiento',getValue)}
                        />
                    </View>
                    <TouchableOpacity 
                        activeOpacity={0.9}
                        onPress={onSubmitForm}
                    style={styles.btnSendInfo}>
                        <Text style={{fontSize:20,fontWeight:500}}>Afiliarse</Text>
                    </TouchableOpacity>
                </View>
                
            </ScrollView>
        </View>
    );
}
