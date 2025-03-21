import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";

const RemoveFriendModal = ({ visible, onClose, onRemove }) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Remove Connection</Text>
          <Text style={styles.modalText}>
            Are you sure you want to remove this connection?
          </Text>
          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <Text style={styles.buttonText}>Remove</Text>
          </TouchableOpacity>
          <View style={styles.cancelContainer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  removeButton: {
    backgroundColor: "#09A1F6",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cancelButton: {
    color: "#007BFF",
    marginTop: 10,
  },
  cancelContainer: {
    alignItems: "center",
    marginTop: 10,
  },
};

export default RemoveFriendModal;
