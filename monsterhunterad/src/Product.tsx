
import {World, Product} from '../world';
import './styles.css';
import { Orientation} from './progressBar';
import MyProgressbar from "./progressBar"
import { useRef, useState } from 'react';
import { useInterval } from './myInterval';
import { transform } from './utils';
import { gql, useMutation } from '@apollo/client';




type ProductProps = {
    product: Product
    onProductionDone: (product: Product) => void
    mult : String
    money : number
    onProductBuy: (product: Product, qt:number) =>void
    username : String

   }

export default function ProductComp({product, onProductionDone, mult, money,onProductBuy, username } : ProductProps) {


   
   const [timeLeft, setTimeLeft] = useState(product.timeleft);
   const [coutPourMultProduit, setCoutPourMultProduit] = useState(product.cout);
   const [MaxProduitAchetable, setMaxProduitAchetable] = useState(1);
   const lastUpdate = useRef(Date.now());

   const [lancerProduction] = useMutation(LANCER_PRODUCTION,
      { context: { headers: { "x-user": username }},
      onError: (error): void => {
         console.log("erreur");
      }
      }
     )
     

   function calcScore(){
      let ecoule = Date.now() - lastUpdate.current;
      lastUpdate.current = Date.now();
      if(product.quantite !=0){
         if(product.managerUnlocked){
            if(timeLeft !=0){
               if(ecoule>=timeLeft){
                  console.log("production")
            		onProductionDone(product);
            		setTimeLeft(product.vitesse);
         		}else{
            		console.log(timeLeft);
            		setTimeLeft(timeLeft - ecoule);
         		}
            }else{
               setTimeLeft(product.vitesse);
            }
         }else{
            if(timeLeft !=0){
               if(ecoule>=timeLeft){
                  console.log("production")
            		onProductionDone(product);
            		setTimeLeft(0);
         		}else{
            		console.log(timeLeft);
            		setTimeLeft(timeLeft - ecoule);
         		}
            
            }
         }
      }else {setTimeLeft(0);}
   }

   function startFabrication(){
      if(timeLeft ==0){
         setTimeLeft(product.vitesse);
         lastUpdate.current=Date.now();
         if(product.quantite!=0){
            lancerProduction({ variables: { id: product.id } });
         }
      }
   }

   function calcMaxCanBuy(){
      let max = 1;
      let coutProduit =0;
      if(product.quantite!=0){
         while(true){
            if(money<coutProduit){
               break;
            }
            coutProduit = product.cout*(product.croissance**product.quantite+max);
            max++;
         }
         return(max-3);
      }else{
         while(true){
            if(money<coutProduit){
               break;
            }
            coutProduit = product.cout*(product.croissance**max);
            max++;
         }
         return(max-1);
      }
   }

   function calcCout(){
      switch(mult){
         case "x1":
            setCoutPourMultProduit(product.cout*(product.croissance**product.quantite));
            setMaxProduitAchetable(1);
            break;
         case "x10": 
            setCoutPourMultProduit(product.cout*(product.croissance**(product.quantite+10)));
            setMaxProduitAchetable(10);
            break;
         case "x100": 
            setCoutPourMultProduit(product.cout*(product.croissance**(product.quantite+100)));
            setMaxProduitAchetable(100);
            break;
         case "Max":
            let max = calcMaxCanBuy()
            setMaxProduitAchetable(max);
            setCoutPourMultProduit((product.cout*(product.croissance**product.quantite*max)));
            break;
      }
   }

   function calling(){
      console.log(product);
      console.log(MaxProduitAchetable);
      onProductBuy(product,MaxProduitAchetable)
   }
   

   useInterval(() => calcScore(), 100)
   useInterval(() => calcCout(), 200)
   return (
   <div className='box' >
      {product.name}
      <br></br>
      <img onClick={startFabrication} className='round' src={"http://localhost:4000/" + product.logo} height="60" width="60" />
      <div className='centered'>Acheter {MaxProduitAchetable}</div> <br></br>
      {money<coutPourMultProduit &&
         <div><button disabled><span dangerouslySetInnerHTML={{__html: transform(coutPourMultProduit)}}/> $</button></div>
      }
      {money>=coutPourMultProduit &&
         <div><button onClick={calling}><span dangerouslySetInnerHTML={{__html: transform(coutPourMultProduit)}} /> $</button></div>
      }
      <br></br>
      <MyProgressbar className="barstyle" vitesse={product.vitesse} initialvalue={product.vitesse - timeLeft} 
      run={timeLeft > 0} frontcolor="#FFD700" backcolor="#000000 " auto={product.managerUnlocked} orientation={Orientation.horizontal} />
      <div>Qte :{product.quantite}</div>
   </div>
   
   );

}



const LANCER_PRODUCTION = gql(`
   mutation lancerProductionProduit($id: Int!) {
      lancerProductionProduit(id: $id) {
          id
      }
   }`);


