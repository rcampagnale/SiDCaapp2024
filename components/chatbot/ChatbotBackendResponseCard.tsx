import React, { useMemo, useState } from "react";
import {
  LayoutAnimation,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import type {
  BackendArticuloLicencia,
  BackendRespuestaLicencias,
} from "./chatbotApi";
import { construirDetalleDesdeBackend } from "./chatbotApi";
import styles from "../../styles/chatbot/chatbot-backend-response-card";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  data: BackendRespuestaLicencias;
};

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

function articleKey(articulo: BackendArticuloLicencia, index: number): string {
  const identity = [
    articulo.fuente,
    articulo.referencia,
    articulo.anexo,
    articulo.capitulo,
    articulo.titulo_capitulo,
    articulo.seccion,
    articulo.punto,
    articulo.articulo,
    articulo.titulo_articulo,
    articulo.texto || articulo.resumen,
  ]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .join("|");

  return identity || `articulo-${index}`;
}

function articleLabel(articulo: BackendArticuloLicencia): string {
  return articulo.articulo
    ? `Artículo ${articulo.articulo}`
    : articulo.titulo_articulo || "Artículo";
}

function ArticuloCard({
  articulo,
  expanded,
  onToggle,
}: {
  articulo: BackendArticuloLicencia;
  expanded: boolean;
  onToggle: () => void;
}) {
  const titulo = articulo.titulo_articulo || "";
  const textoOriginal = articulo.texto || articulo.resumen || "";

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.articleCard}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggle}
        style={styles.articleHeader}
      >
        <View style={styles.articleHeaderContent}>
          <Text style={styles.articleNumber}>{articleLabel(articulo)}</Text>
          {titulo && titulo !== articleLabel(articulo) ? (
            <Text style={styles.articleShortTitle}>{titulo}</Text>
          ) : null}
        </View>
        <Text style={styles.articleChevron}>{expanded ? "⌃" : "›"}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.articleExpanded}>
          <Text style={styles.articleOriginalText}>{textoOriginal}</Text>

          {articulo.otorgante ? (
            <Text style={styles.articleMetadata}>
              Otorgante: {String(articulo.otorgante)}
            </Text>
          ) : null}
          {articulo.interviniente ? (
            <Text style={styles.articleMetadata}>
              Interviniente: {String(articulo.interviniente)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function ChatbotBackendResponseCard({ data }: Props) {
  const detalle = useMemo(() => construirDetalleDesdeBackend(data), [data]);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const articulos = [
    ...(detalle.articuloPrincipal ? [detalle.articuloPrincipal] : []),
    ...detalle.articulosSecundarios,
  ];
  const asesoramiento = detalle.asesoramientoGremial;
  const sinInformacion =
    data.tipo === "sin_resultados" &&
    articulos.length === 0 &&
    Boolean(asesoramiento);

  if (sinInformacion) {
    return (
      <View style={styles.container}>
        <View style={styles.advisorCard}>
          <Text style={styles.advisorTitle}>Asesoramiento Gremial</Text>
          <Text style={styles.advisorText}>
            No encontré información suficiente en la documentación disponible
            para responder con precisión.
            {"\n\n"}
            Para recibir orientación sobre este caso, comunicate con
            Asesoramiento Gremial de SiDCa.
          </Text>
          {asesoramiento?.whatsapp ? (
            <Text style={styles.advisorContact}>
              WhatsApp: {asesoramiento.whatsapp}
            </Text>
          ) : null}
          {asesoramiento?.url ? (
            <TouchableOpacity
              style={styles.advisorButton}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(asesoramiento.url!).catch(() => {})}
            >
              <Text style={styles.advisorButtonText}>Abrir WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Chip label={(data.dominio || "general").toUpperCase()} />
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.mainText}>{detalle.mensajePrincipal}</Text>
      </View>

      {articulos.length > 0 ? (
        <View style={styles.normativeSection}>
          <Text style={styles.normativeTitle}>Normativa consultada</Text>
          {articulos.map((articulo, index) => {
            const key = articleKey(articulo, index);
            return (
              <ArticuloCard
                key={key}
                articulo={articulo}
                expanded={expandedArticle === key}
                onToggle={() =>
                  setExpandedArticle((current) =>
                    current === key ? null : key
                  )
                }
              />
            );
          })}
        </View>
      ) : null}

    </View>
  );
}
