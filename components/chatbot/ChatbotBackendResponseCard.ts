import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import type {
  BackendRespuestaLicencias,
  BackendArticuloLicencia,
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
  return React.createElement(
    View,
    { style: styles.chip },
    React.createElement(Text, { style: styles.chipText }, label)
  );
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
  const titulo =
    articulo.titulo_articulo || `Artículo ${articulo.articulo ?? ""}`;
  const resumen =
    articulo.resumen ||
    articulo.texto ||
    "No hay resumen disponible para este artículo.";

  return React.createElement(
    View,
    { style: styles.sectionCard },
    React.createElement(Text, { style: styles.sectionTitle }, titulo),
    React.createElement(
      Text,
      { style: styles.sectionBody },
      expanded ? articulo.texto || resumen : resumen
    ),
    articulo.texto
      ? React.createElement(
          TouchableOpacity,
          {
            activeOpacity: 0.8,
            onPress: () => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              onToggle();
            },
            style: styles.linkButton,
          },
          React.createElement(
            Text,
            { style: styles.linkButtonText },
            expanded ? "Ver menos" : "Ver artículo completo"
          )
        )
      : null
  );
}

export default function ChatbotBackendResponseCard({ data }: Props) {
  const detalle = useMemo(() => construirDetalleDesdeBackend(data), [data]);
  const [expandido, setExpandido] = useState(false);

  return React.createElement(
    View,
    { style: styles.container },

    React.createElement(
      View,
      { style: styles.headerRow },
      React.createElement(Chip, {
        label: (data.dominio || "general").toUpperCase(),
      }),
      React.createElement(Chip, {
        label: (data.origen || "backend").replace(/_/g, " "),
      })
    ),

    React.createElement(
      View,
      { style: styles.mainCard },
      React.createElement(
        Text,
        { style: styles.mainText },
        detalle.mensajePrincipal
      )
    ),

    detalle.articuloPrincipal
      ? React.createElement(ArticuloCard, {
          articulo: detalle.articuloPrincipal,
          expanded: expandido,
          onToggle: () => setExpandido((v) => !v),
        })
      : null,

    detalle.articulosSecundarios.length > 0
      ? React.createElement(
          View,
          { style: styles.sectionCard },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Artículos relacionados"
          ),
          ...detalle.articulosSecundarios.map((art, idx) =>
            React.createElement(
              Text,
              {
                key: `${art.articulo}-${idx}`,
                style: styles.relatedItem,
              },
              `• ${art.titulo_articulo || `Artículo ${art.articulo ?? ""}`}`
            )
          )
        )
      : null,

    detalle.fuentes.length > 0
      ? React.createElement(
          View,
          { style: styles.sectionCard },
          React.createElement(
            Text,
            { style: styles.sectionTitle },
            "Fuentes consultadas"
          ),
          ...detalle.fuentes.map((fuente, idx) =>
            React.createElement(
              Text,
              {
                key: `${fuente}-${idx}`,
                style: styles.relatedItem,
              },
              `• ${fuente}`
            )
          )
        )
      : null
  );
}