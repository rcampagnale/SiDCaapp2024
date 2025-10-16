import React, { useState } from "react";
import {
  Text,
  View,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../../styles/new-user-styles/create-user-styles";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  runTransaction,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firebaseconn } from "@/constants/FirebaseConn";
import { regexRegister } from "../../src/utils/regex";
import { router } from "expo-router";

interface NewUserTypes {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  celular: string;
  departamento: string;
  establecimientos: string;
  descuento: string;
  fecha: string;
}

const departamentos = [
  "Ambato",
  "Ancasti",
  "Andalgalá",
  "Antofagasta de la Sierra",
  "Belén",
  "Capayán",
  "Capital",
  "El Alto",
  "Fray Mamerto Esquiú",
  "La Paz",
  "Paclín",
  "Pomán",
  "Santa María",
  "Santa Rosa",
  "Tinogasta",
  "Valle Viejo",
];

const formatFecha = (d: Date) => {
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export default function CreateNewUser() {
  

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUserTypes>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    celular: "",
    departamento: "",
    establecimientos: "",
    descuento: "si",
    fecha: formatFecha(new Date()),
  });

  const db = getFirestore(firebaseconn);
  const usuariosRef = collection(db, "usuarios");
  const nuevoAfiliadoRef = collection(db, "nuevoAfiliado");

  const handleNewUserData = (key: keyof NewUserTypes, value: string) => {
    setNewUser((prev) => ({ ...prev, [key]: value }));
  };

 

  const onSubmitForm = async () => {
  if (Object.values(newUser).includes(""))
    return Alert.alert("SiDCa", "Debe completar todos los campos");

  if (
    !regexRegister.names.test(newUser.nombre) ||
    !regexRegister.names.test(newUser.apellido)
  )
    return Alert.alert("SiDCa", "Nombre o apellido no válido");

  if (!regexRegister.dni.test(newUser.dni))
    return Alert.alert("SiDCa", "DNI no válido");

  try {
    setLoading(true);

    const db = getFirestore(firebaseconn);
    const dniKey = newUser.dni.trim();

    // Payload base (guardamos string de fecha y timestamp de servidor)
    const payloadBase = {
      ...newUser,
      dni: dniKey,
      fechaServer: serverTimestamp(),
    };

    await runTransaction(db, async (tx) => {
      // 1) Chequear existencia del usuario activo por ID = DNI
      const usuarioRef = doc(db, "usuarios", dniKey);
      const usuarioSnap = await tx.get(usuarioRef);

      if (usuarioSnap.exists()) {
        // Si ya existe, NO creamos nada en ninguna colección
        throw new Error("DNI_EXISTE");
      }

      // 2) Obtener siguiente nroAfiliacion SOLO en la colección nuevoAfiliado
      //    Usamos un doc "contador" por DNI dentro de la misma colección.
      const counterRef = doc(db, "nuevoAfiliado", `${dniKey}_counter`);
      const counterSnap = await tx.get(counterRef);

      let nroAfiliacion = 1;
      if (!counterSnap.exists()) {
        // Primera afiliación para este DNI
        tx.set(counterRef, {
          last: 1,
          updatedAt: serverTimestamp(),
        });
      } else {
        const last = typeof counterSnap.data()?.last === "number"
          ? counterSnap.data()!.last
          : 0;
        nroAfiliacion = last + 1;
        tx.update(counterRef, {
          last: nroAfiliacion,
          updatedAt: serverTimestamp(),
        });
      }

      // 3) Crear usuario activo (usuarios/{dni})
      tx.set(usuarioRef, payloadBase);

      // 4) Registrar evento de afiliación (nuevoAfiliado con auto-ID)
      const eventoRef = doc(collection(db, "nuevoAfiliado"));
      tx.set(eventoRef, {
        ...payloadBase,
        nroAfiliacion,
      });
    });

    Alert.alert("SiDCa", "Afiliado exitosamente", [
      { text: "OK", onPress: () => router.navigate("/") },
    ]);

    // Limpiar formulario solo si se creó correctamente
    setNewUser({
      nombre: "",
      apellido: "",
      dni: "",
      email: "",
      celular: "",
      departamento: "",
      establecimientos: "",
      descuento: "si",
      fecha: formatFecha(new Date()),
    });
  } catch (error: any) {
    if (error?.message === "DNI_EXISTE") {
      Alert.alert(
        "SiDCa",
        "Ya existe un afiliado con este DNI. Contacta con el administrador."
      );
    } else {
      console.error("Error al afiliar usuario: ", error);
      Alert.alert(
        "SiDCa",
        "Hubo un problema al procesar tu solicitud. Intenta nuevamente."
      );
    }
  } finally {
    setLoading(false);
  }
};


  const selectDepartment = (department: string) => {
    handleNewUserData("departamento", department);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#091d24" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          justifyContent: "space-between",
          alignItems: "center",
          rowGap: 20,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.viewInformation}>
          <Text
            style={{ fontSize: 22, fontWeight: "600", alignSelf: "center" }}
          >
            Beneficios para Afiliados:
          </Text>
          <Text> ASESORAMIENTO LEGAL, PREVISIONAL Y SINDICAL</Text>
          <Text> CAJA COMPLEMENTARIA DOCENTE</Text>
          <Text> GESTIÓN DE TRÁMITES DE EXPEDIENTES</Text>
          <Text> RECLAMOS ADMINISTRATIVOS</Text>
          <Text> CAPACITACIÓN DOCENTE GRATUITA</Text>
          <Text> ALOJAMIENTO EN CASA DE DOCENTE</Text>
          <Text> CONVENIO DE ALOJAMIENTO EN OTRAS PROVINCIAS</Text>
          <Text> PLANES DE TURISMO FAMILIAR</Text>
        </View>

        <View style={styles.viewFormContainer}>
          <Text style={{ color: "#ffffff", fontWeight: "bold", width: "95%" }}>
            Al afiliarse, ACEPTA que se descontarán cuotas y servicios sociales
            de su Salario.
          </Text>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Nombre
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.nombre}
              onChangeText={(v) => handleNewUserData("nombre", v)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Apellido
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.apellido}
              onChangeText={(v) => handleNewUserData("apellido", v)}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              DNI
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.dni}
              onChangeText={(v) =>
                handleNewUserData("dni", v.replace(/\D/g, ""))
              }
              keyboardType="numeric"
              maxLength={9}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Email
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.email}
              onChangeText={(v) => handleNewUserData("email", v.trim())}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Celular
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.celular}
              onChangeText={(v) =>
                handleNewUserData("celular", v.replace(/[^\d+]/g, ""))
              }
              keyboardType="phone-pad"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Departamento
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={{ width: "100%", borderRadius: 5 }}
            >
              <TextInput
                style={{
                  width: "100%",
                  height: 40,
                  backgroundColor: "#fea200",
                  borderRadius: 5,
                  color: "#000000",
                  paddingLeft: 10,
                }}
                editable={false}
                value={newUser.departamento}
                placeholder="Seleccionar…"
                placeholderTextColor="#333"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text
              style={{
                color: "#ffffff",
                alignSelf: "flex-start",
                fontSize: 18,
              }}
            >
              Establecimientos
            </Text>
            <TextInput
              style={styles.inputForm}
              value={newUser.establecimientos}
              onChangeText={(v) => handleNewUserData("establecimientos", v)}
              autoCapitalize="sentences"
              autoCorrect
              returnKeyType="done"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onSubmitForm}
            style={styles.btnSendInfo}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#ffffff" />
            ) : (
              <Text style={{ fontSize: 20, fontWeight: "500" }}>Afiliarse</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <FlatList
                data={departamentos}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      handleNewUserData("departamento", item);
                      setModalVisible(false);
                    }}
                    style={{
                      width: "100%",
                      height: 50,
                      justifyContent: "center",
                      alignItems: "center",
                      borderBottomWidth: 1,
                      borderBottomColor: "#000000",
                    }}
                  >
                    <Text style={styles.modalItem}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: "#3B5998",
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "#ffffff", fontSize: 16 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}
