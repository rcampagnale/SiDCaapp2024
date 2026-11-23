import {
  ActivityIndicator,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../../styles/contact/contact-styles";
import {
  Contacto,
  ContactosState,
  reintentarContactos,
  suscribirseContactos,
} from "../../services/contactosStore";

export default function ContactInformation() {
  const statusBarHeight = StatusBar.currentHeight;
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    return suscribirseContactos((nextState: ContactosState) => {
      setContactos(nextState.contactos);
      setLoading(nextState.loading);
      setError(nextState.error);
    });
  }, []);

  const openWspNumber = (numero: string) => {
    const numeroNormalizado = String(numero || "").replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${numeroNormalizado}`).catch(() => undefined);
  };

  return (
    <View style={[styles.screenRoot, { paddingTop: statusBarHeight }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          <View style={styles.titleContact}>
            <Text style={styles.textTitle}>Medios de contacto</Text>
          </View>
          <View style={styles.mediasContactContainer}>
            <Text style={{ fontSize: 22, fontWeight: 500 }}>
              Números de WhatsApp
            </Text>
            {loading ? (
              <ActivityIndicator color="#091d24" />
            ) : error ? (
              <>
                <Text style={styles.contactStatusText}>
                  No pudimos cargar los medios de contacto.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={reintentarContactos}
                  activeOpacity={0.85}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </>
            ) : contactos.length === 0 ? (
              <Text style={styles.contactStatusText}>
                No hay medios de contacto disponibles en este momento.
              </Text>
            ) : (
              contactos.map((contacto) => (
                <TouchableOpacity
                  key={contacto.id}
                  style={styles.btnWhatsApp}
                  activeOpacity={1}
                  onPress={() => openWspNumber(contacto.numero)}
                >
                  <Text style={{ fontSize: 18, marginLeft: 10 }}>
                    {contacto.referencia}
                  </Text>
                  <Image
                    style={{ width: 30, height: 30, marginRight: 10 }}
                    source={require("../../assets/logos/whatsapp.png")}
                  />
                </TouchableOpacity>
              ))
            )}
          </View>
          <View style={styles.contactSeparator} />
          <View style={styles.footerContainer}>
            <Text style={{ width: "90%" }}>
              Sede central Ayacucho 227 - 1° Piso, San Fernando del Valle de
              Catamarca, Catamarca CP 4700
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
