
import {World, Product} from '../world';
import './styles.css';
import { Orientation} from './progressBar';
import MyProgressbar from "./progressBar"
import { useEffect, useRef, useState } from 'react';
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
            		onProductionDone(product);
            		setTimeLeft(product.vitesse);
         		}else{
            		setTimeLeft(timeLeft - ecoule);
         		}
            }else{
               setTimeLeft(product.vitesse);
            }
         }else{
            if(timeLeft !=0){
               if(ecoule>=timeLeft){
            		onProductionDone(product);
            		setTimeLeft(0);
         		}else{
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
      let max = 0;
      let coutProduitPrec =product.cout;
      while(true){
         if(money<coutProduitPrec){
            break;
         }
         coutProduitPrec += product.cout*product.croissance;
         max++;
      }
      console.log(max)
      return(max-1);
   }

   function calcCout(){
      let coutpourmult = product.cout;
      let i=0;
      switch(mult){
         case "x1":
            if(product.quantite==0){
               setCoutPourMultProduit(product.cout)
            }else{setCoutPourMultProduit(product.cout*(product.croissance**product.quantite));}
            setMaxProduitAchetable(1);
            break;
         case "x10": 
            while (true) {
               if (i >= 10) {
                  break;
               }
               coutpourmult += product.cout * product.croissance;
               i++;
            }
            setCoutPourMultProduit(coutpourmult);
            setMaxProduitAchetable(10);
            break;
         case "x100": 
            while (true) {
               if (i >= 100) {
                  break;
               }
               coutpourmult += product.cout * product.croissance;
               i++;
            }
            setCoutPourMultProduit(coutpourmult);
            setMaxProduitAchetable(100);
            break;
         case "Max":
            let max = calcMaxCanBuy()
            while (true) {
               if (i >= max) {
                  break;
               }
               coutpourmult += coutpourmult * product.croissance;
               i++;
            }
            setCoutPourMultProduit(coutpourmult);
            setMaxProduitAchetable(max);
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


