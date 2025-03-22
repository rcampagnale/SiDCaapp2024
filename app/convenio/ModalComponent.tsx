import React from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import styles from "../../styles/convenio/convenio-styles";

// Este componente se encargará de mostrar los modales para las categorías
export default function ModalComponent({
  isModalVisible,
  toggleModal,
  category,
  loading,
  data,
}) {
  // Función para abrir enlaces externos
  const openOtherData = (urlMedia) => {
    Linking.openURL(urlMedia).catch((err) =>
      console.error("Error al abrir el enlace:", err)
    );
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
            >
              {data.length > 0 ? (
                data.map((item, index) => (
                  <View key={index} style={styles.modalItem}>
                    {/* Visualiza el título del item */}
                    <View
                      style={{
                        borderColor: "black",
                        borderWidth: 2,
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      {item.titulo && (
                        <Text style={styles.modalTitle}>{item.titulo}</Text>
                      )}
                    </View>
                    <View style={styles.separator} />
                    <View
                      style={{
                        borderColor: "black",
                        borderWidth: 2,
                        borderRadius: 8,
                        padding: 10,
                      }}
                    >
                      {/* Imagen del item */}
                      {item.imagen && (
                        <Image
                          source={{ uri: item.imagen }}
                          style={styles.modalItemImage}
                          resizeMode="contain"
                        />
                      )}

                      {/* Descripción del item */}
                      {item.descripcion && (
                        <Text style={styles.textAbout}>{item.descripcion}</Text>
                      )}
                      <View style={styles.separator} />

                      {/* Enlace del item (Contacto o Reservar) */}
                      {item.link && (
                        <TouchableOpacity
                          style={styles.btnCommon}
                          onPress={() => openOtherData(item.link)}
                        >
                          <Text style={styles.commonBtnText}>
                            {category === "predio" ? "Contacto" : "Reservar"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.Textmodal}>
                  Actualmente no disponemos de convenios activos.
                </Text>
              )}
            </ScrollView>
          )}
          
          <View style={styles.btnsBox}>
          <View style={styles.separator} />
            <TouchableOpacity style={styles.btnCommon} onPress={toggleModal}>
              <Text style={styles.commonBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
