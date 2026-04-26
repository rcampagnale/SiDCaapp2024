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
    minHeight: 90,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 8,
  },

  title: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },

  viewInformation: {
    width: "100%",
    backgroundColor: "#fea200",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 10,
  },

  text: {
    width: "97%",
    fontSize: 16,
    color: "#000000",
    textAlign: "justify",
    lineHeight: 24,
  },

  scrollArea: {
    width: "100%",
    flex: 1,
  },

  scrollContent: {
    paddingTop: 18,
    paddingBottom: 24,
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
    textAlign: "center",
  },

  formCard: {
    width: "92%",
    backgroundColor: "#fea200",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#000000",
  },

  formHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  logoBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbeafe",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },

  logoSindicato: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.08 }],
  },

  logoFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: "#dcfce7",
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    backgroundColor: "#63b746",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },

  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#000000",
    marginBottom: 10,
    textTransform: "uppercase",
    lineHeight: 25,
  },

  descriptionContainerCard: {
    width: "100%",
    marginTop: 2,
  },

  cardDescriptionText: {
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 22,
    textAlign: "justify",
    marginBottom: 10,
  },

  descriptionList: {
    width: "100%",
    marginTop: 4,
    marginBottom: 8,
  },

  descriptionListRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 9,
  },

  descriptionListMarker: {
    width: 24,
    fontSize: 14,
    color: "#000000",
    fontWeight: "bold",
    lineHeight: 22,
  },

  descriptionListText: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 22,
    textAlign: "justify",
  },

  metaBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 7,
    marginTop: 12,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.22)",
  },

  metaText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
  },

  btnNews: {
    width: "100%",
    minHeight: 44,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    flexDirection: "row",
    columnGap: 8,
    paddingHorizontal: 12,
  },

  btnEnabled: {
    backgroundColor: "#005CFE",
  },

  btnDisabled: {
    backgroundColor: "#A9A9A9",
  },

  btnIcon: {
    marginRight: 3,
  },

  btnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  webView: {
    flex: 1,
  },

  webLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    zIndex: 10,
  },

  webLoaderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#333333",
  },

  webErrorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },

  webErrorTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },

  webErrorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
    textAlign: "center",
  },

  webErrorButton: {
    width: "88%",
    height: 44,
    backgroundColor: "#005CFE",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  webErrorButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
 
  formImagesContainer: {
  width: "100%",
  alignItems: "center",
  marginTop: 12,
  marginBottom: 8,
},

formImage: {
  width: "58%",
  aspectRatio: 9 / 16,
  borderRadius: 12,
  backgroundColor: "transparent",
},
});