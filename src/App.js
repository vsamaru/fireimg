import React, { Component } from "react";
import { FilePond, File, registerPlugin } from "react-filepond";
import FilePondImagePreview from "filepond-plugin-image-preview";
import firebase, { storage } from "firebase";
import StorageDataTable from "./StorageDataTable";

//import 'filepond'

registerPlugin(FilePondImagePreview);

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      progressValue: 0,
      message: "",
      filesMetadata: [],
      rows: [],
      fileMetadata: {}
    };

    var config = {
      apiKey: "AIzaSyBx4BOSEvPUH8Er4905Q6shu61fEPN6BQ0",
      authDomain: "mycomment-9e778.firebaseapp.com",
      databaseURL: "https://mycomment-9e778.firebaseio.com",
      projectId: "mycomment-9e778",
      storageBucket: "mycomment-9e778.appspot.com",
      messagingSenderId: "208922274925"
    };

    !firebase.apps.length ? firebase.initializeApp(config) : firebase.apps;
  }

  componentDidMount() {
    this.getMetaDataFromDatabase();

    //  console.log(this.state.filesMetadata)
  }

  addMetadataToList() {
    let i = 1;
    let rows = [];

    for (let key in this.state.filesMetadata) {
      let fileData = this.state.filesMetadata[key];

      let objRows = {
        no: i++,
        key: key, //ใช้เพื่อ Delete
        name: fileData.name,
        url: fileData.url,
        fullPath: fileData.fullPath,
        size: fileData.size,
        contentType: fileData.contentType
      };

      rows.push(objRows);
    }

    this.setState(
      {
        rows: rows
      },
      () => {
        console.log("All rows from database");
        //  console.log(this.state.rows);
      }
    );
  }

  getMetaDataFromDatabase() {
    const databaseRef = firebase.database().ref("filepond");

    databaseRef.on("value", snap => {
      this.setState(
        {
          filesMetadata: snap.val()
        },
        () => this.addMetadataToList()
      );
    });
  }

  handleInit = () => {
    console.log("initial component");
  };

  handleProcessing(fieldName, file, metadata, load, error, progress, abort) {
    const fileUpload = file;
    //console.log("create fileUpload");
    const storageRef = firebase.storage().ref(`filepond/${file.name}`);

    const task = storageRef.put(fileUpload);

    task.on(
      "state_changed",
      snap => {
        let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;

        this.setState({
          progressValue: percentage
        });
      },
      err => {
        console.log("Error");
        this.setState({
          message: `Upload error ${err.message}`
        });
      },
      () => {
        this.setState({
          message: `Uploaded was successfully`
        });
        console.log("Success");
      }
    );

    storageRef.getDownloadURL().then(url => {
      this.setState({
        fileMetadata: {
          url: url
        }
      });
    });

    const x = storageRef.getDownloadURL().then(x => x);

    //  console.log(x);

    storageRef
      .getMetadata()
      .then(metadata => {
        //  console.log(metadata)

        let { name, size, contentType, fullPath } = metadata;

        this.setState({
          fileMetadata: {
            ...this.state.fileMetadata,
            name,
            file,
            size,
            contentType,
            fullPath
          }
        });

        //   console.log(this.state.fileMetadata);

        const databaseRef = firebase.database().ref("filepond");

        databaseRef.push(this.state.fileMetadata);
      })
      .catch(err => {
        console.log(`Save Error ${err.message}`);
        this.setState({
          message: `Save metadata error ${err.message}`
        });
      });
  }

  handleDeleteItem = (e, row) => {
    console.log("Delete");
    const databaseRef = firebase.database().ref("filepond");

    databaseRef.child(row.key).remove();
  };

  render() {
    const { rows, filesMetadata } = this.state;
    return (
      <div class="App">
        <FilePond
          allowMultiple={true}
          ref={ref => (this.pond = ref)}
          onInit={() => this.handleInit}
          maxFiles={3}
          server={{ process: this.handleProcessing.bind(this) }}
        >
          {this.state.files.map(file => (
            <>
              <File key={file} source={file} />
            </>
          ))}
        </FilePond>

        <StorageDataTable
          rows={rows}
          filesMetadata={filesMetadata}
          onDeleteItem={this.handleDeleteItem}
        />
      </div>
    );
  }
}
