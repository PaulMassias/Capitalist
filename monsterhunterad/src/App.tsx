import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import './Main.tsx';
import './styles.css';
import { gql, useQuery,ApolloClient, useApolloClient } from '@apollo/client';
import { useState, } from 'react';
import Main from './Main';
import {World} from '../world';


function App() {

  
  const client = useApolloClient();

  function onUserNameChanged(event : React.FormEvent<HTMLInputElement>){
    setUsername(event.currentTarget.value);
    localStorage.setItem("username", event.currentTarget.value);
    client.resetStore();
  }
  

    let lname = localStorage.getItem("username")
    if (!lname || lname===""){
      lname = "LeBossDu"+Math.floor(Math.random() * 10000);
      localStorage.setItem("username", lname);
    }
    const [username, setUsername] = useState(lname);

    const {loading, error, data, refetch } = useQuery(GET_WORLD, {
      context: { headers: { "x-user": username } }
     });

  
  let corps = undefined
  let main = undefined
  if (loading) corps = <div> Loading... </div>
  else if (error) corps = <div> Erreur de chargement du monde ! </div>
  else {corps = <div> { data.getWorld.name } </div>
        main = <Main loadworld={data.getWorld} username={username} />}
 


  return (
    <div className='principale'>
      <input className='id-joueur' type="text" value={username} onChange={onUserNameChanged}/> 
      <div className='NomMonde'>{ corps }</div>
      <div >{main}</div>
    </div>
      
  );



}


const GET_WORLD = gql(`
query getWorld {
  getWorld {
    name
    logo
    money
    score
    totalangels
    activeangels
    angelbonus
    lastupdate
    products {
      id
      name
      logo
      cout
      croissance
      revenu
      vitesse
      quantite
      timeleft
      managerUnlocked
      paliers {
        name
        logo
        seuil
        idcible
        ratio
        typeratio
        unlocked
      }
    }
    allunlocks {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    upgrades {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    angelupgrades {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
    managers {
      name
      logo
      seuil
      idcible
      ratio
      typeratio
      unlocked
    }
  }
}
`);




export default App;
