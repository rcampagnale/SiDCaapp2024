import React, { useState } from "react";
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


const departamentos = [
  { label: "Ambato", value: "Ambato" },
  { label: "Ancasti", value: "Ancasti" },
  { label: "Andalgalá", value: "Andalgalá" },
  { label: "Antofagasta de la Sierra", value: "Antofagasta de la Sierra" },
  { label: "Belén", value: "Belén" },
  { label: "Capayán", value: "Capayán" },
  { label: "Capital", value: "Capital" },
  { label: "El Alto", value: "El Alto" },
  { label: "Fray Mamerto Esquiú", value: "Fray Mamerto Esquiú" },
  { label: "La Paz", value: "La Paz" },
  { label: "Paclín", value: "Paclín" },
  { label: "Pomán", value: "Pomán" },
  { label: "Santa María", value: "Santa María" },
  { label: "Santa Rosa", value: "Santa Rosa" },
  { label: "Tinogasta", value: "Tinogasta" },
  { label: "Valle Viejo", value: "Valle Viejo" },
];


interface ModalComponentProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  category: string;
  loading: boolean;
  data: Array<{
    prioridad: number;
    titulo?: string;
    imagen?: string;
    descripcion?: string;
    link?: string;
    departamento?: string; 
  }>;
}

export default function ModalComponent({
  isModalVisible,
  toggleModal,
  category,
  loading,
  data,
}: ModalComponentProps) {
  
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  const openOtherData = (urlMedia: string) => {
    Linking.openURL(urlMedia).catch((err) =>
      console.error("Error al abrir el enlace:", err)
    );
  };

  // Ordenamos los datos por prioridad (de menor a mayor)
  const sortedData = [...data].sort((a, b) => a.prioridad - b.prioridad);

  // Aplica filtro por departamento SOLO si la categoría es convenio_comercio
  const filteredData =
    category === "convenio_comercio" && selectedDept
      ? sortedData.filter((item) => (item.departamento || "") === selectedDept)
      : sortedData;

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
              {/* --- Filtro visible SOLO para convenio_comercio --- */}
              {category === "convenio_comercio" && (
                <View
                  style={{
                    marginBottom: 10,
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: "black",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#000000ff",
                        fontSize: 16,
                        fontWeight: "700",
                      }}
                    >
                      Filtrar por Departamento
                    </Text>

                    <TouchableOpacity
                      onPress={() => setShowDeptPicker(true)}
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1.5,
                        borderColor: "#000000ff",
                      }}
                    >
                      <Text style={{ color: "#000000ff", fontWeight: "600" }}>
                        {selectedDept ? selectedDept : "Seleccionar"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: "#000000ff", marginTop: 8 }}>
                    Resultados: {filteredData.length}
                    {selectedDept ? ` · ${selectedDept}` : " · Todos"}
                  </Text>
                </View>
              )}

              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <View key={index} style={styles.modalItem}>
                    {/* Título */}
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
                      {category === "convenio_comercio" && item.departamento && (
                        <Text style={{ color: "#000000ff", marginTop: 4 }}>
                          Departamento: {item.departamento}
                        </Text>
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
                      {/* Imagen */}
                      {item.imagen && (
                        <Image
                          source={{ uri: item.imagen }}
                          style={styles.modalItemImage}
                          resizeMode="contain"
                        />
                      )}

                      {/* Descripción */}
                      {item.descripcion && (
                        <Text style={styles.textAbout}>{item.descripcion}</Text>
                      )}
                      <View style={styles.separator} />

                      {/* Enlace */}
                      {item.link && (
                        <TouchableOpacity
                          style={styles.btnCommon}
                          onPress={() => openOtherData(item.link!)}
                        >
                          <Text style={styles.commonBtnText}>
                            {category === "predio" ? "Contacto" : "Contacto"}
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
            <TouchableOpacity
              style={styles.btnCommon}
              onPress={() => {
                setSelectedDept(null); // limpia filtro al cerrar
                setShowDeptPicker(false);
                toggleModal();
              }}
            >
              <Text style={styles.commonBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Picker de Departamentos */}
      <Modal
        visible={showDeptPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeptPicker(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#1e1e1e",
              borderRadius: 12,
              borderWidth: 2,
              borderColor: "black",
              maxHeight: "70%",
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              Seleccionar Departamento
            </Text>

            <ScrollView>
              {/* Opción Todos */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedDept(null);
                  setShowDeptPicker(false);
                }}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderTopWidth: 1,
                  borderColor: "#333",
                }}
              >
                <Text style={{ color: "#fff" }}>Todos</Text>
              </TouchableOpacity>

              {departamentos.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => {
                    setSelectedDept(d.value);
                    setShowDeptPicker(false);
                  }}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderTopWidth: 1,
                    borderColor: "#333",
                  }}
                >
                  <Text style={{ color: "#fff" }}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 10 }}>
              <TouchableOpacity
                onPress={() => setShowDeptPicker(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: "#555",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}
