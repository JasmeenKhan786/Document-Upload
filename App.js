//Installations:
// expo install expo-file-system
// expo install expo-document-picker
// expo install react-native-webview
// yarn add rn-pdf-reader-js

import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import firebase from "firebase";
import db from "./config";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import PdfReader from "rn-pdf-reader-js";
import { AntDesign } from "@expo/vector-icons";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      doc: "",
      uploading: false,
      userId: "lol1@gmail.com",
      modalvisible: false,
    };
  }
  componentDidMount() {
    this.fetchImage(this.state.userId);
  }

  selectPicture = async () => {
    this.setState({ uploading: true });
    const { size, name, type, uri } = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: false,
    });
    console.log("URI" + uri);

    if (type === "success") {
      this.uploadImage(uri, this.state.userId);
    }
  };

  uploadImage = async (uri, imageName) => {
    console.log("before fetch!");
    var response = await fetch(uri);
    var blob = await response.blob();

    var ref = firebase
      .storage()
      .ref()
      .child("documents/" + imageName);

    return ref
      .put(blob, {
        contentType: "application/pdf",
      })
      .then((response) => {
        this.fetchImage(imageName);
      })
      .catch((err) => {
        alert(err.message);
        console.log(err.message);
      });
  };

  fetchImage = (imageName) => {
    var storageRef = firebase
      .storage()
      .ref()
      .child("documents/" + imageName);

    // Get the download URL
    storageRef
      .getDownloadURL()
      .then((url) => {
        this.setState({ doc: url });
      })
      .catch((error) => {
        alert("No Files uploaded yet for this user!");
        this.setState({ doc: "#" });
      });
  };

  openDocument = (url) => {
    // let remoteUrl = "http://www.soundczech.cz/temp/lorem-ipsum.pdf";
    if (this.state.doc !== "#") {
      Linking.openURL(url);
    } else {
      alert("No document found!");
    }
  };
  render() {
    return (
      <ScrollView style={{ marginTop: 100 }}>
        <View style={styles.container}>
          {this.state.uploading === true ? (
            this.state.doc ? (
              <Feather name="check-circle" size={24} color="green" />
            ) : (
              <ActivityIndicator color="black" size="small" />
            )
          ) : (
            <AntDesign name="upload" size={24} color="black" />
          )}

          <TouchableOpacity onPress={this.selectPicture}>
            <Text>Choose Document</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              //open document using Linking
              //this.openDocument(this.state.doc);

              //or

              //open the modal
              this.setState({ modalvisible: true });
            }}
          >
            <Text>Open Document </Text>
          </TouchableOpacity>
        </View>
        <Modal visible={this.state.modalvisible}>
          <View style={{ flex: 1, marginTop: 20 }}>
            <TouchableOpacity
              style={{ margin: 10 }}
              onPress={() => {
                this.setState({ modalvisible: false });
              }}
            >
              <Text style={{ alignSelf: "center" }}>Close</Text>
            </TouchableOpacity>
            {this.state.doc ? (
              <PdfReader
                source={{
                  uri: this.state.doc,
                }}
              />
            ) : (
              <Text>Loading...</Text>
            )}
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    alignItems: "center",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
