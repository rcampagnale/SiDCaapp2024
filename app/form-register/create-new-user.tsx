import { Text, View, StatusBar, ScrollView, TextInput, TouchableOpacity } from "react-native";
import styles from '../../styles/new-user-styles/create-user-styles';
import React, { useState } from "react";
interface NewUserTypes{
        realName:string,
        lastName:string,
        document:string,
        email:string,
        phone:string,
        department:string,
        establishment:string
}
export default function CreateNewUser() {
    const statusBarHeight:number | undefined  = StatusBar.currentHeight;
    const [newUser,setNewUser]=useState<NewUserTypes>({
        realName:'',
        lastName:'',
        document:'',
        email:'',
        phone:'',
        department:'',
        establishment:''
    })
    const handleNewUserData=(key:string ,value:string )=>{
        setNewUser({...newUser,[key]:value})
      }
    const onSubmitForm=()=>{
        console.log(newUser)
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
                    <Text style={{color:'#ffffff',fontSize:24,fontWeight:600}}>Afiliarse Ahora</Text>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Nombre</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.realName}
                            onChangeText={(getValue)=>handleNewUserData('realName',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Apellido</Text>
                        <TextInput style={styles.inputForm}
                             value={newUser.lastName}
                             onChangeText={(getValue)=>handleNewUserData('lastName',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>DNI</Text>
                        <TextInput style={styles.inputForm} 
                            value={newUser.document}
                            onChangeText={(getValue)=>handleNewUserData('document',getValue)}
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
                             value={newUser.phone}
                             onChangeText={(getValue)=>handleNewUserData('phone',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Departamento</Text>
                        <TextInput style={styles.inputForm} 
                            value={newUser.department}
                            onChangeText={(getValue)=>handleNewUserData('department',getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{color:'#ffffff',alignSelf:'flex-start',fontSize:18}}>Establecimientos</Text>
                        <TextInput style={styles.inputForm} 
                             value={newUser.establishment}
                             onChangeText={(getValue)=>handleNewUserData('establishment',getValue)}
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
