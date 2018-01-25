
//{"Entities":[]}{"KeyPhrases":[]}

import React, { Component } from 'react';
import { TouchableHighlight,Image,StyleSheet, Text, View, AppRegistry, TextInput, Button,Linking,ScrollView} from 'react-native';
import Amplify , { API } from 'aws-amplify-react-native';
import aws_exports from './client/aws-exports';
import { Constants, Audio } from 'expo';

// import Tts from 'react-native-tts';


Amplify.configure(aws_exports);

// <Text style={{color: 'black',textAlign: 'center',marginBottom : 10}} >{url.description}</Text>
class UrlsList extends Component {
  
  constructor(props) {
    super(props);
    this.state = { urlToSpeech : 'http://api.voicerss.org/?key=7bc542d9ec894c749ace0a5680a4a05f&hl=en-us&src='};
    // this.textToSpeech = this.textToSpeech.bind(this);
  }

  // async textToSpeech(description){  

  //   try {

  //     let urlSpeech = 'http://api.voicerss.org/?key=7bc542d9ec894c749ace0a5680a4a05f&hl=en-us&src=' + 'The best Solush in the world';
  //     // fetch( urlSpeech, {method: "GET"}).then((response)=>{
  //     //   console.log(response);
  //     //   response.json().then((soundresponse)=>{

  //     //     console.log(soundresponse);
  //         await Audio.setIsEnabledAsync(true);
  //         const sound = new Audio.Sound();
  //         await sound.loadAsync(urlSpeech);
  //         await sound.playAsync(); 
  //   //     });
  //   //   });
  //   } catch(error) {
  //     console.error(error);
  //   }

  //   // return await fetch(urlSpeech, {method: "GET", headers: {Accept: 'application/json','Content-Type': 'application/json'}});
  //   <Text style={styles.singleItem2} onPress={()=>this.textToSpeech(url.description)}>Play description</Text>
  // }

  render() {
    return (
      <View style={styles.containerV}>
        {this.props.urls.map((url,i) =><Text key={i} style={styles.singleItem} onPress={() => Linking.openURL(url.fileurl)}>{url.name}</Text>)}
      </View>
    );
  }
}

export default class App extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = { res : '',
                    files: []};

    this.getDataComprehend = this.getDataComprehend.bind(this);
    this.getAndParse = this.getAndParse.bind(this);
    this.getDataElastic = this.getDataElastic.bind(this);
  }

  getAndParse(){
    this.getDataComprehend().then((response)=>{
      
      if(response == undefined){
        return;
      }

      let responseParsed = JSON.parse('[' + response.replace(/\}\{/g, '},{') + ']');
      let KeyPhrases;

      for (i = 0; i < responseParsed.length; i++) {
        if(responseParsed[i]["KeyPhrases"] != undefined){
           KeyPhrases = responseParsed[i]["KeyPhrases"];
           break;
        }
      }

      var elasticRes = this.getDataElastic(KeyPhrases).then((response2)=>{
        return response2.json();
      });

      elasticRes.then((po)=>{
          
          var fileUrls2 = [];

          for( j=0 ; j< po.hits.hits.length && j < 4  ; j++){
              var currentUrl = po.hits.hits[j]['_source']['fileurl'];
              var urlParts = currentUrl.split('/');
              
              fileUrls2.push({fileurl : po.hits.hits[j]['_source']['fileurl'], description : po.hits.hits[j]['_source']['Description'], name : urlParts[urlParts.length - 1] });
          }

          this.setState({files: fileUrls2,
                          res : ''});


      });
    });
  }


  async getDataElastic(KeyPhrases) {
    
    let queryString = '';
    
    if(KeyPhrases == undefined){
      return '';
    }

    for (i = 0; i < KeyPhrases.length; i++) { 
      let textarr = KeyPhrases[i].Text.split("\\s+");

      for (j = 0; j < textarr.length; j++) {
        queryString += 'q=' + textarr[j] + '&';
      }

    }

    let queryStringNew = queryString.slice(0, -1);
    return await fetch('https://search-click-etnhdv7sxzbzmpdp4bwezoqfuu.eu-west-1.es.amazonaws.com/click/articles/_search?' + queryStringNew , {method: "GET", headers: {Accept: 'application/json','Content-Type': 'application/json'}});
  }

  async getDataComprehend() { 
    let body = { Text : this.state.res};
    let myInit = { body: body }
    return await API.post('LambdaMicroservice', '/Dan_Test', myInit);
  }

  render() {
    return (
      <View style={styles.containerV}>
       <View style={styles.containerTOP}>
          <View style={styles.containerV3}>
              <Text style={styles.welcome}>Solush</Text>
              <Text style={styles.subWelcome}>by Clicksoftware</Text>
          </View>
          <View style={styles.containerV2}>
              <TextInput style={styles.searchInput} placeholder="Need Help?"
                                    onChangeText={(text) => this.setState({ res: text})}
                                    value= {this.state.res}/>
              <Button color="#fff" style={styles.action} title="GO" onPress={this.getAndParse}/>
          </View>
        </View>
          <ScrollView style={styles.contentContainer}>
            <UrlsList urls={this.state.files}/>
          </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerTOP:{
      width:600,
      height:250,
      backgroundColor: '#0f9ad7',
  },
  button: {
    width: 50,
    height: 50,
  },
  containerV: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  containerV2: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f9ad7',
  },
  containerV3: {
    paddingTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f9ad7',
    backgroundColor: '#0f9ad7',
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 10,
    color: '#fff',
  },
  subWelcome:{
    fontSize: 10,
    marginLeft:160,
    color: '#fff',
  },
  searchInput:{
    padding: 10, 
    marginLeft: 10, 
    width: 240,
    height: 40, 
    borderColor: '#eee', 
    borderWidth: 1, 
    backgroundColor: 'white',
    borderRadius:3
  },
  action: {
    textAlign: 'center',
    color: '#fff',
    marginVertical: 5,
    fontSize: 20,
    fontWeight: 'bold',
    borderRadius:3
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  stat: {
    textAlign: 'center',
    color: '#B0171F',
    marginBottom: 1,
  },
  contentContainer: {
    paddingVertical: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    marginTop: 100,
    flex: 1,
    alignItems: 'center'
  },
  singleItem: {
    color: 'blue',
    textAlign: 'center',
    padding : 5,
    marginBottom:10,
    fontSize: 14,
  },
  singleItem2: {
    color: 'blue',
    textAlign: 'center',
    padding : 5,
    marginBottom:10,
    fontSize: 14,
  },
});
