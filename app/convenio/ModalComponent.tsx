import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Modal,
  FlatList,
  Platform,
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

type ConvenioItem = {
  id: string;
  prioridad: number;
  titulo?: string;
  imagen?: string;
  descripcion?: string;
  link?: string;
  departamento?: string;
  departamentos?: unknown;
  alcanceTodosDepartamentos?: boolean;
};

export function normalizarDepartamentos(item: ConvenioItem): string[] {
  if (Array.isArray(item.departamentos)) {
    const normalizados = item.departamentos
      .map((departamento) => String(departamento ?? "").trim())
      .filter(Boolean);
    if (normalizados.length > 0) return [...new Set(normalizados)];
  }

  const legacy = String(item.departamento ?? "").trim();
  return legacy ? [legacy] : [];
}

function AlcanceDepartamentos({ item }: { item: ConvenioItem }) {
  if (item.alcanceTodosDepartamentos === true) {
    return (
      <View style={styles.departmentScope}>
        <Text style={styles.departmentScopeLabel}>
          Disponible en todos los departamentos
        </Text>
      </View>
    );
  }

  const departamentosItem = normalizarDepartamentos(item);
  if (departamentosItem.length === 0) return null;

  return (
    <View style={styles.departmentScope}>
      <Text style={styles.departmentScopeLabel}>Disponible en:</Text>
      <View style={styles.departmentChips}>
        {departamentosItem.map((departamento) => (
          <View key={departamento} style={styles.departmentChip}>
            <Text style={styles.departmentChipText}>{departamento}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const ConvenioRemoteImage = React.memo(function ConvenioRemoteImage({
  uri,
  isPrefetched,
}: {
  uri: string;
  isPrefetched: boolean;
}) {
  const [loading, setLoading] = useState(!isPrefetched);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setLoading(!isPrefetched);
    setHasError(false);
  }, [uri, isPrefetched]);

  return (
    <View style={styles.remoteImageContainer}>
      <Image
        source={{ uri }}
        style={styles.remoteImage}
        resizeMode="contain"
        onLoadStart={() => {
          if (!isPrefetched) setLoading(true);
          setHasError(false);
        }}
        onLoad={() => setLoading(false)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setHasError(true);
        }}
      />
      {!hasError && loading && (
        <View style={styles.remoteImageLoader}>
          <ActivityIndicator size="small" color="#09232B" />
          <Text style={styles.remoteImageLoaderText}>Cargando imagen...</Text>
        </View>
      )}
      {hasError && (
        <View style={styles.remoteImageFallback}>
          <Text style={styles.remoteImageFallbackIcon}>▧</Text>
          <Text style={styles.remoteImageFallbackText}>Imagen no disponible</Text>
        </View>
      )}
    </View>
  );
});

interface ConvenioCardProps {
  item: ConvenioItem;
  category: string;
  isImagePrefetched: boolean;
  openOtherData: (urlMedia: string) => void;
}

const ConvenioCard = React.memo(function ConvenioCard({
  item,
  category,
  isImagePrefetched,
  openOtherData,
}: ConvenioCardProps) {
  const imageUri = typeof item.imagen === "string" ? item.imagen.trim() : "";

  return (
    <View style={styles.modalItem}>
      {/* Título */}
      <View
        style={{
          borderColor: "black",
          borderWidth: 2,
          borderRadius: 8,
          padding: 10,
        }}
      >
        {item.titulo && <Text style={styles.modalTitle}>{item.titulo}</Text>}
        <AlcanceDepartamentos item={item} />
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
        {imageUri ? (
          <ConvenioRemoteImage uri={imageUri} isPrefetched={isImagePrefetched} />
        ) : null}

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
  );
});


interface ModalComponentProps {
  isModalVisible: boolean;
  toggleModal: () => void;
  category: string;
  loading: boolean;
  title?: string;
  prefetchedImages: Set<string>;
  data: ConvenioItem[];
}

export default function ModalComponent({
  isModalVisible,
  toggleModal,
  category,
  loading,
  prefetchedImages,
  data,
}: ModalComponentProps) {
  
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  const openOtherData = useCallback((urlMedia: string) => {
    Linking.openURL(urlMedia).catch((err) =>
      console.error("Error al abrir el enlace:", err)
    );
  }, []);

  // Ordenamos los datos por prioridad (de menor a mayor)
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.prioridad - b.prioridad),
    [data],
  );

  // Aplica filtro por departamento SOLO si la categoría es convenio_comercio
  const filteredData = useMemo(
    () =>
      category === "convenio_comercio" && selectedDept
        ? sortedData.filter(
            (item) =>
              item.alcanceTodosDepartamentos === true ||
              normalizarDepartamentos(item).includes(selectedDept),
          )
        : sortedData,
    [category, selectedDept, sortedData],
  );

  const renderDepartmentFilter = useCallback(() => {
    if (category !== "convenio_comercio") return null;

    return (
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
    );
  }, [category, filteredData.length, selectedDept]);

  const renderConvenio = useCallback(
    ({ item }: { item: ConvenioItem }) => {
      const imageUri = typeof item.imagen === "string" ? item.imagen.trim() : "";
      return (
        <ConvenioCard
          item={item}
          category={category}
          isImagePrefetched={Boolean(imageUri && prefetchedImages.has(imageUri))}
          openOtherData={openOtherData}
        />
      );
    },
    [category, openOtherData, prefetchedImages],
  );

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#ffffff" />
          ) : (
            <FlatList
              data={filteredData}
              renderItem={renderConvenio}
              keyExtractor={(item) =>
                item.id || `${item.titulo || "convenio"}-${item.link || item.imagen || ""}`
              }
              ListHeaderComponent={renderDepartmentFilter}
              ListEmptyComponent={
                <Text style={styles.Textmodal}>
                  Actualmente no disponemos de convenios activos.
                </Text>
              }
              style={styles.modalContent}
              contentContainerStyle={{ paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              updateCellsBatchingPeriod={50}
              removeClippedSubviews={Platform.OS === "android"}
              showsVerticalScrollIndicator
            />
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
