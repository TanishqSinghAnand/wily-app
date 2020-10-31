import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import db from '../config'
export default class SearchScreen extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
allTransactions: [],
        }
    }

    componentDidMount =async()=> {
const query = db.collection("transactions").get()
query.docs.map((doc)=>{
    console.log(doc)
    this.setState({
        allTransactions: [...this.state.allTransactions, doc.data()]
    })

})

    }
    render () {
        return (
            <ScrollView>
                {
                 this.state.allTransactions.map((transaction)=>{
                     return(
                         <View> 
                         <Text> 
                         {
                             transaction.transactionType
                         }
                         </Text> 
                         </View>
                     )   
                 }) 
                }  
                
                
            </ScrollView>
            
                
           
        )
    }
}

const styles = StyleSheet.create({
    searchStyle: {
        flex:1,
        alignSelf: 'center',
        justifyContent: 'center',
        fontSize: 20,
        marginTop: 200,
        marginBottom: 200,
        color: 'blue',
        
    }
})