import React from 'react';
import { StyleSheet, Text, View, TextInput, Image, KeyboardAvoidingView, TouchableOpacity, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermission: null,
      scanned: false,
      scannedData: "",
      buttonState: "normal",
      scanBookId: "",
      scanStudentId: "",
      transactionMessage: "",
    };
  }
  getCameraPermission = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      hasCameraPermission: status === "granted",
      buttonState: id,
      scanned: false,
    });
  };

  handleBarCodeScanned = async ({ type, data }) => {
    console.log("handle function executed");
    if(buttonState === "bookId") {
      this.setState({
        scanBookId: data,
        buttonState: "normal",
        scanned: true,
      });
    }
    if(buttonState === "studentId") {
      this.setState({
        scanStudentId: data,
        buttonState: "normal",
        scanned: true,
      });
    }
    
  };
initiateBookIssue = async() => {
  console.log("bookIssue executed")
  //add a transaction
  db.collection("transactions").add({
    'studentId': this.state.scanStudentId, 
    'bookId': this.state.scanBookId,
    'date': firebase.firestore.TimeStamp.now().toDate(),
    'transactionType': "Issue"
  })
  //change the book status
  db.collection("books").doc(this.state.scanBookId).update({
    'bookAvailibility': false,
  })
   //change number of issued books for the student 
   db.collection("students").doc(this.state.scanStudentId).update({
     ' numberOfBooksIssued': firebase.firestore.FieldValue.increment(1)
   })
   Alert.alert("book is issued")
 this.setState({
   scanStudentId: '',
   scanBookId: '',
 })
}

initiateBookReturn = async() => {
  //add a transaction
  db.collection("transactions").add({
    'studentId': this.state.scanStudentId, 
    'bookId': this.state.scanBookId,
    'date': firebase.firestore.TimeStamp.now().toDate(),
    'transactionType': "Return"
  })
  //change the book status
  db.collection("books").doc(this.state.scanBookId).update({
    'bookAvailibility': true,
  })
   //change number of issued books for the student 
   db.collection("students").doc(this.state.scanStudentId).update({
     ' numberOfBooksIssued': firebase.firestore.FieldValue.increment(-1)
   })
   Alert.alert("book is returned")
 this.setState({
   scanStudentId: '',
   scanBookId: '',
 })
}

checkStudentEligibilityForBookIssue=async () => {
  const studentRef = await db.collection("students").where("studentId", "==", this.state.scanStudentId).get()
  var isStudentEligible = ""
  if(studentRef.docs.length === 0) {
    console.log("noStudent")
    this.setState({
      scanStudentId: '',
      scanBookId: '',
    })
    isStudentEligible = false;
    Alert.alert("this student Id does not exist in the database")
  }
  else{
    console.log("studentPresent")
studentRef.docs.map((doc)=> {
  var student = doc.data()
  if (student.numberOfBooksIssued<2) {
    isStudentEligible = true
  } else {
    isStudentEligible = false
    Alert.alert("student has already issued 2 books")
    this.setState({
      scanStudentId: '',
      scanBookId: '',
    })
  }
})
  }
  return isStudentEligible
  
}

checkStudentEligibilityForBookReturn=async ()=> {
  const transactionRef = await db.collection("transactions").where("bookId", "==", this.state.scanBookId).limit(1).get();
  var isStudentEligible = ""
  transactionRef.docs.map((doc)=>{
    var lastBookTransaction = doc.data()
    if(lastBookTransaction.studentId===this.state.scanStudentId) {
isStudentEligible = true
    }else{
isStudentEligible = false
Alert.alert("the book was not issued by the student")
this.setState({
  scanStudentId: '',
  scanBookId: '',
})
    }
  })
  return isStudentEligible;
}

checkBookEligibility= async()=>{
const bookRef = await db.collection("books").where("bookId", "==", this.state.scanBookId).get()
var transactionType = ""
if (bookRef.docs.length === 0) {
  transactionType = false
  console.log(bookRef.docs.length)
} else {
 bookRef.docs.map((doc)=>{
   var book = doc.data()
   if (book.bookAvailibility) {
     transactionType = "issue"
   } else {
     transactionType="return"
   }
 }) 
}
return transactionType
}
  handleTransaction = async() => {
  var transactionType = await this.checkBookEligibility();
  console.log("transaction type:" , transactionType );

  if(!transactionType) {
Alert.alert("the book doesn't exist in the library database");
this.setState({
  scanStudentId: '',
  scanBookId: '',
})
  } 
  else if(transactionType==="issue"){
var isStudentEligible=await this.checkStudentEligibilityForBookIssue() 
console.log(isStudentEligible)
if(isStudentEligible) {
  this.initiateBookIssue()
  
}
 }

  else {
var isStudentEligible = await this.checkStudentEligibilityForBookReturn()
if(isStudentEligible) {
  this.initiateBookReturn()
 
}

  }


  }
  render() {
    const hasCameraPermission = this.state.hasCameraPermission;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    if (buttonState !== "normal" && hasCameraPermission) {
      console.log("scan started");
      return (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    } else if (buttonState === "normal") {
      return (
        <KeyboardAvoidingView style={styles.container} >
        <View>  
          
            <Image
              style={{ width: 200, height: 200 }}
              source={require("../assets/booklogo.jpg")}
            />
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="bookId"
              onChangeText = {text=>this.setState({
                scanBookId: text
              })} 
              value={this.state.scanBookId}
              
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermission("bookId");
              }}
            >
              <Text style={styles.buttonText}> scan </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput
              style={styles.inputBox}
              placeholder="studentId"
              onChangeText = {text=>this.setState({
                scanStudentId: text
              })}
              value={this.state.scanStudentId}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => {
                this.getCameraPermission("studentId");
              }}
            >
              <Text style={styles.buttonText}> scan </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style = {styles.submitButton}
          onPress = {async()=>{this.handleTransaction()}}>
              <Text style = {styles.submitButtonText}>SUBMIT</Text>
          </TouchableOpacity>
        
        </KeyboardAvoidingView>
        
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  displayText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },

  inputBox: {
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderightWidth: 0,
    fontSize: 20,
  },

  scanButton: {
    backgroundColor: "blue",
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0,
  },
  buttonText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
  },

  inputView: {
    flexDirection: "row",
    margin: 20,
  },

  submitButton:{
    backgroundColor: '#FBC02D',
    height: 50, 
    width: 100,

  },

submitButtonText: {
  padding: 10, 
  textAlign: 'center',
  fontSize: 20, 
  fontWeight: 'bold',
  color: 'white',
}
});
