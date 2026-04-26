import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 2,
  },
  chip: {
    backgroundColor: "#e8f1ff",
    borderWidth: 1,
    borderColor: "#c9dcff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1f4f99",
  },
  mainCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dfe5ee",
  },
  mainText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1f2937",
    textAlign: "justify",
  },
  sectionCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
    textAlign: "justify",
  },
  relatedItem: {
    fontSize: 14,
    lineHeight: 21,
    color: "#374151",
    marginBottom: 6,
  },
  linkButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#edf4ff",
  },
  linkButtonText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default styles;