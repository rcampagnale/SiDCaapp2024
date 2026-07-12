import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#091d24",
  },

  container: {
    flex: 1,
    backgroundColor: "#091d24",
    alignItems: "center",
  },

  viewTitle: {
    width: "100%",
    minHeight: 76,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
  },

  title: {
    fontSize: 25,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },

  viewInformation: {
    width: "92%",
    backgroundColor: "#FEA200",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D88900",
    columnGap: 12,
    marginBottom: 2,
  },

  informationIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#102B34",
    justifyContent: "center",
    alignItems: "center",
  },

  informationTextBox: {
    flex: 1,
  },

  informationTitle: {
    color: "#102B34",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 3,
  },

  text: {
    fontSize: 13,
    color: "#263A41",
    lineHeight: 18,
    textAlign: "justify",
  },

  scrollArea: {
    width: "100%",
    flex: 1,
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: "center",
    rowGap: 16,
  },

  loadingBox: {
    width: "92%",
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#ffffff",
    fontSize: 15,
    textAlign: "center",
  },

  emptyBox: {
    width: "92%",
    backgroundColor: "#11303a",
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#254955",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#d7e3e7",
    textAlign: "justify",
  },

  expedienteCard: {
    width: "92%",
    backgroundColor: "#FEA200",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D88900",
    borderLeftWidth: 5,
    borderLeftColor: "#102B34",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
    elevation: 4,
  },

  cardHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 10,
  },

  cardTitleBox: {
    flex: 1,
  },

  cardEyebrow: {
    color: "#9A6500",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 2,
  },

  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#102B34",
  },

  cardMeta: {
    marginTop: 4,
    color: "#5B430F",
    fontSize: 12,
  },

  cardBody: {
    width: "100%",
    marginTop: 15,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(16,43,52,0.22)",
  },

  cardHeaderIndicators: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },

  expandIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#102B34",
    justifyContent: "center",
    alignItems: "center",
  },

  finalizadoIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    columnGap: 4,
  },

  finalizadoIndicatorText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#166534",
  },

  movimientosIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#005CFE",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    columnGap: 4,
  },

  movimientosIndicatorText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#ffffff",
  },

  badgesRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 8,
    marginBottom: 12,
  },

  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  infoBox: {
    width: "100%",
    backgroundColor: "#EDF3F5",
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D7E2E5",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f2937",
    width: 110,
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#1f2937",
  },

  observacionBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DCE4E7",
  },

  observacionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  observacionText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    textAlign: "justify",
  },

  finalizacionBox: {
    width: "100%",
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },

  finalizacionTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#166534",
    marginBottom: 4,
  },

  finalizacionText: {
    fontSize: 14,
    color: "#14532d",
    lineHeight: 21,
    textAlign: "justify",
  },

  btnHistorial: {
    width: "100%",
    minHeight: 48,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    flexDirection: "row",
    columnGap: 8,
    paddingHorizontal: 12,
    backgroundColor: "#075A83",
  },

  btnHistorialText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

  /* ----- Modal historial ----- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FEA200",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },

  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(16,43,52,0.35)",
    alignSelf: "center",
    marginBottom: 14,
  },

  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(16,43,52,0.22)",
  },

  modalHeaderTextBox: {
    flex: 1,
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#102B34",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#5B430F",
    marginTop: 2,
  },

  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEA200",
    justifyContent: "center",
    alignItems: "center",
  },

  modalScrollContent: {
    paddingBottom: 8,
  },

  modalLoadingBox: {
    paddingVertical: 30,
    alignItems: "center",
  },

  modalEmptyBox: {
    paddingVertical: 24,
    alignItems: "center",
  },

  modalEmptyText: {
    color: "#536970",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  movimientoRow: {
    width: "100%",
    flexDirection: "row",
    columnGap: 11,
    marginBottom: 14,
  },

  movimientoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },

  movimientoItem: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },

  movimientoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    columnGap: 8,
  },

  movimientoTipo: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#111827",
  },

  movimientoFecha: {
    fontSize: 11,
    color: "#6b7280",
  },

  movimientoTexto: {
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 21,
    marginBottom: 4,
    textAlign: "justify",
  },

  movimientoUsuario: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    fontStyle: "italic",
  },

  movimientoChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginBottom: 4,
  },

  movimientoChipText: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "600",
  },
});
