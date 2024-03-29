import React,{Component} from 'react';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/navigation';
import SignIn from './components/signIn/signIn';
import Register from './components/Register/Register';
import Logo from './components/logo/logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/imageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

const particlesOptions ={
        particles: {
          number: {
            value:30,
            density: {
              enable: true,
              value_area:800
            }
          }
        }
}
const initialState={
          input:'',
          imageUrl:'',
          box:{},
          route: 'signin',
          isSignedIn:false,
          //for updating the user
          users:{
                id:'',
                name:'',
                email:'',
                entries:0,
                joined:''
            }
}
class App extends Component{
      constructor(){
        super();
        this.state=initialState;
      }
      loadUser=(data)=>{
        this.setState({user:{
                id:data.id,
                name:data.name,
                email:data.name,
                entries:data.entries,
                joined:data.join
        }})
      }
      

      calculateFaceLocation=(data)=>{
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputImage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol   : clarifaiFace.left_col* width,
          topRow    : clarifaiFace.top_row * height,
          rightCol  : width-(clarifaiFace.right_col*width),
          bottomRow : height-(clarifaiFace.bottom_row*height)
        }
      }
      displayFaceBox = (box) =>{
        this.setState({box : box});
      }
      onInputChange=(event)=>{
        this.setState({input:event.target.value});
      }
      onButtonClick=()=>{
        this.setState({imageUrl:this.state.input});
        
        fetch('http://localhost:3001/imageurl',{
              method:'post',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                input:this.state.input
            })
          })
            .then(response=>response.json())
        .then(response =>{
          if(response){
            fetch('http://localhost:3001/image',{
              method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                id:this.state.user.id
            })
          })
            .then(response=>response.json())
            .then(count=>{
              this.setState(Object.assign(this.state.user,{entries:count}))
            })
            .catch(console.log)
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })

        .catch(error=>console.log(error));

      }
      onRouteChange = (route)=>{
        if(route === 'signout'){
          this.setState(initialState)
        }else if(route === 'home'){
          this.setState({isSignedIn:true})
        }
        this.setState({route : route})
      }
  render(){
   const {isSignedIn,imageUrl,route,box}=this.state;
    return(
      <div className="App">
         <Particles className='particles' 
              params={{particlesOptions}}
          />

        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {this.state.route === 'home'
        ?<div>
            <Logo/>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonClick={this.onButtonClick}/>
            <FaceRecognition box={box} imageUrl={imageUrl}/>
          </div>
          :(
            route === 'signin'

          ?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          :<Register loadUser={this.loadUser} onRouteChange= {this.onRouteChange}/>
          
          )
        }
      </div>
    );
  }
}

export default App;
