import {
  View,
  Text,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import styles from "../../styles/convenio/convenio-styles";
import { useState } from "react";

export default function HandleCampusTeachers() {
  const statusBarHeight = StatusBar.currentHeight;

  // Estado para manejar la visibilidad del modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Lista de comercios adheridos (puedes cargarla desde una base de datos o archivo si es necesario)
  const businesses = [
    { id: "1", name: "Comercio 1", address: "Dirección 1" },
    { id: "2", name: "Comercio 2", address: "Dirección 2" },
    { id: "3", name: "Comercio 3", address: "Dirección 3" },
    { id: "4", name: "Comercio 4", address: "Dirección 3" },
    { id: "5", name: "Comercio 5", address: "Dirección 3" },
    { id: "6", name: "Comercio 6", address: "Dirección 3" },
    { id: "7", name: "Comercio 7", address: "Dirección 3" },
    { id: "8", name: "Comercio 1", address: "Dirección 1" },
    { id: "9", name: "Comercio 2", address: "Dirección 2" },
    { id: "10", name: "Comercio 3", address: "Dirección 3" },
    { id: "11", name: "Comercio 4", address: "Dirección 3" },
    { id: "12", name: "Comercio 5", address: "Dirección 3" },
    { id: "13", name: "Comercio 6", address: "Dirección 3" },
    { id: "14", name: "Comercio 7", address: "Dirección 3" },
    // Agrega más comercios aquí
  ];

  // Función para abrir o cerrar el modal
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={{ height: "100%", paddingTop: statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.viewTitle}>
          <Text style={{ fontSize: 24, color: "#ffffff" }}>
            Red de Convenio
          </Text>
        </View>
        <View style={styles.viewInformation}>
          <Text style={styles.text}>
            El Sindicato de Docentes de Catamarca ha firmado convenios con
            diversas empresas de la ciudad, ofreciendo a sus afiliados
            descuentos especiales y condiciones preferenciales en diferentes
            sectores comerciales. Presentando la credencial digital a través de
            la app, los afiliados podrán acceder fácilmente a estos beneficios.
            Estos convenios reflejan el compromiso del sindicato con el
            bienestar de sus miembros, brindando ventajas adicionales en
            productos y servicios de calidad. ¡No pierdas la oportunidad de
            aprovechar estos beneficios exclusivos que solo los afiliados pueden
            disfrutar!
          </Text>
        </View>
        <View style={styles.carruselContainer}>
          <ScrollView
            style={styles.carrusel}
            contentContainerStyle={{
              justifyContent: "space-between",
              alignItems: "center",
              columnGap: 15,
            }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio1.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio2.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio3.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio4.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio5.jpg")}
              resizeMode="cover"
            />
            <Image
              style={{ width: 200, height: 130 }}
              source={require("../../assets/predio/predio6.jpg")}
              resizeMode="cover"
            />
          </ScrollView>
        </View>

        {/* Botón de "Lista de Comercio Adherido" */}
        <TouchableOpacity
          style={styles.btnNews}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <Text>Lista de Comercio Adherido</Text>
        </TouchableOpacity>

        {/* Modal con la lista de comercios */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontSize: 24, fontWeight: "bold" }}>
                Comercios Adheridos
              </Text>
              <FlatList
                data={businesses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.modalItem}>
                    <Text style={styles.modalItemText}>
                      {item.name} - {item.address}
                    </Text>
                  </View>
                )}
              />
              <TouchableOpacity
                onPress={toggleModal}
                style={styles.closeModalBtn}
              >
                <Text style={{ color: "#fff" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
