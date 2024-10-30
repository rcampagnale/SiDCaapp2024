import { Text, View, StatusBar, ScrollView, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import styles from '../../styles/new-user-styles/create-user-styles';
import React, { useState } from "react";
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseconn } from "@/constants/FirebaseConn";
import {regexRegister} from './regex-form'
interface NewUserTypes {
    nombre: string,
    apellido: string,
    dni: string,
    email: string,
    celular: string,
    departamento: string,
    establecimientos: string,
    descuento: string,
    fecha: string
}

const departamentos = [
    "Ambato",
    "Ancasti",
    "Belén",
    "Capayán",
    "Chacabuco",
    "El Alto",
    "Fray Mamerto Esquiú",
    "La Paz",
    "La Puerta",
    "Pomán",
    "Santa María",
    "Santa Rosa",
    "Tinogasta",
    "Valle Viejo",
    "Capital"
];

export default function CreateNewUser() {
    const statusBarHeight: number | undefined = StatusBar.currentHeight;
    const currentDay = new Date();
    const day = String(currentDay.getDate()).padStart(2, '0');
    const month = String(currentDay.getMonth() + 1).padStart(2, '0');
    const year = currentDay.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const [newUser, setNewUser] = useState<NewUserTypes>({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        celular: '',
        departamento: '',
        establecimientos: '',
        descuento: "si",
        fecha: formattedDate
    });

    const [modalVisible, setModalVisible] = useState(false);

    const analytics = getFirestore(firebaseconn);
    const dataAdd = collection(analytics, 'nuevoAfiliado');

    const handleNewUserData = (key: string, value: string) => {
        setNewUser({ ...newUser, [key]: value });
    };

    const onSubmitForm = async () => {
        if(Object.values(newUser).includes('')) return alert('Debe completar todos los campos')
        if(regexRegister.names.test(newUser.nombre) === false ||regexRegister.names.test(newUser.apellido) ===false ) return alert('nombre u apellido no valido')
        if(regexRegister.dni.test(newUser.dni)===false) return alert('DNI no valido')
        const newAfiliate = await addDoc(dataAdd, newUser);
        setNewUser({
            nombre: '',
            apellido: '',
            dni: '',
            email: '',
            celular: '',
            departamento: '',
            establecimientos: '',
            descuento: "si",
            fecha: formattedDate
        })
    };

    const selectDepartment = (department: string) => {
        handleNewUserData('departamento', department);
        setModalVisible(false); // Cierra el modal
    };

    return (
        <View style={{ flex: 1, paddingTop: statusBarHeight }}>
            <ScrollView style={{ backgroundColor: '#091d24' }} contentContainerStyle={{ justifyContent: 'space-between', alignItems: 'center', rowGap: 20 }}>
                <View style={styles.viewInformation}>
                    <Text style={{ fontSize: 22, fontWeight: '600', alignSelf: 'center' }}>Beneficios para afiliados:</Text>
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
                    <Text style={{ color: '#ffffff', fontWeight: 'bold', width: '95%' }}>Al afiliarse, acepta que se descontarán cuotas y servicios sociales de su salario.</Text>

                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>Nombre</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.nombre}
                            onChangeText={(getValue) => handleNewUserData('nombre', getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>Apellido</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.apellido}
                            onChangeText={(getValue) => handleNewUserData('apellido', getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>DNI</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.dni}
                            onChangeText={(getValue) => handleNewUserData('dni', getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>Email</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.email}
                            onChangeText={(getValue) => handleNewUserData('email', getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>Celular</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.celular}
                            onChangeText={(getValue) => handleNewUserData('celular', getValue)}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>Departamento</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} style={{ width: '100%', borderRadius: 5 }}>
                            <TextInput style={{ width: '100%', height: 40, backgroundColor: '#fea200', borderRadius: 5,color:'#000000',paddingLeft:10 }}
                                editable={false} // Deshabilita la edición directa
                                value={newUser.departamento}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={{ color: '#ffffff', alignSelf: 'flex-start', fontSize: 18 }}>establecimientoss</Text>
                        <TextInput style={styles.inputForm}
                            value={newUser.establecimientos}
                            onChangeText={(getValue) => handleNewUserData('establecimientos', getValue)}
                        />
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={onSubmitForm}
                        style={styles.btnSendInfo}>
                        <Text style={{ fontSize: 20, fontWeight: '500' }}>Afiliarse</Text>
                    </TouchableOpacity>
                </View>                
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <FlatList
                                data={departamentos}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => selectDepartment(item)}
                                            style={{width:'100%',height:50,display:'flex',justifyContent:'center',alignItems:'center',borderWidth:2,borderBottomColor:'#000000'}}
                                    >
                                        <Text style={styles.modalItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                
            </ScrollView>
        </View>
    );
}
