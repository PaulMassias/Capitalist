import React, { useEffect, useRef } from 'react';
import logo from './logo.svg';
import './styles.css';
import { monitorEventLoopDelay } from 'perf_hooks';
import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import {Palier, World, Product} from '../world';
import { transform } from './utils';
import ProductComp from './Product';
import { Badge, Snackbar } from '@mui/material';
import { useInterval } from './myInterval';



type MainProps = {

    loadworld: World
    username: string
   }

export default function Main({ loadworld, username }: MainProps) {

    const [world, setWorld] = useState(JSON.parse(JSON.stringify(loadworld)) as World)
    const [mult, setMult] = useState("x1");
    const [showManagers,setShowManagers] = useState(false);
    const [showUnlocks, setShowUnlocks]= useState(false);
    const [showUpgrades, setShowUpgrades]= useState(false);
    const [showAngels, setShowAngels]= useState(false);
    const [showAngelUpgrades, setShowAngelsUpgrades]= useState(false);
    const [ManagerBadges, setManagerBadges]= useState(0);
    const [OpenManagers, setOpenManagers]= useState(false);
    const [OpenUnlocks, setOpenUnlocks]= useState(false);
    const [typeUnlock,setTypeUnlock] = useState("");
    const [OpenUpgrades, setOpenUpgrades]= useState(false);

    const [upgradesBadges, setUpgradesBadges]= useState(0);
    const [Argent, setArgent]= useState(world.money);

    useEffect(() => {
        setWorld(JSON.parse(JSON.stringify(loadworld)) as World)
    }, [loadworld])

    const [acheterQtProduit] = useMutation(ACHETER_QT_PRODUIT,
        { context: { headers: { "x-user": username }},
        onError: (error): void => {
           console.log("erreur");
        }})

    const [engagerManager] = useMutation(ENGAGER_MANAGER,
        { context: { headers: { "x-user": username }},
        onError: (error): void => {
            console.log("erreur");
        }})  
        
    const [acheterCashUpgrades] = useMutation(ACHETER_CASH_UPGRADES,
        { context: { headers: { "x-user": username }},
        onError: (error): void => {
            console.log("erreur");
        }})



    function onProductionDone(p: Product): void {
        let gain = p.revenu*p.quantite;
        
        world.money =world.money+ gain;
        setArgent(Argent+gain);
        world.score = world.score+gain;
        console.log("onProdDone")

        // ajout de la somme à l’argent possédé
        //addToScore(gain)
    }

    function changeValue() {
        switch (mult) {
            case "x1":
                setMult("x10");
                break;
            case "x10":
                setMult("x100");
                break;
            case "x100":
                setMult("Max");
                break;
            case "Max":
                setMult("x1");
                break;
        }
    }

    function  onProductBuy(product: Product,qt: number){
        let cout= 0;
        console.log(qt)
        if(product.quantite == 0){
            setArgent(Argent-product.cout);
            world.money=world.money-product.cout*(product.croissance**(qt-1));
            product.quantite += qt;
            acheterQtProduit({ variables: { id: product.id,quantite: qt } });
        }
        else{
        cout = product.cout*(product.croissance**(product.quantite+qt-1));
        console.log(cout);
        setArgent(Argent-cout);
        product.quantite += qt;
        world.money=world.money-cout;
        
        acheterQtProduit({ variables: { id: product.id, quantite: qt } });
        product.paliers.filter(paliers => !paliers.unlocked).map(
            paliers => {if(product.quantite>=paliers.seuil){
                            paliers.unlocked=true;
                            setTypeUnlock(paliers.typeratio);
                            handleSnackBarUnlocks()
                            if(paliers.typeratio == "vitesse"){
                                product.vitesse = product.vitesse/paliers.ratio;
                            }else{
                                product.revenu = product.revenu*paliers.ratio;
                            }

                        }
        }
        )

    }

    }

    function toggleManagers(){
        if(showManagers==true){
            setShowManagers(false);
        }
        else{setShowManagers(true)
            setShowUnlocks(false)
            setShowUpgrades(false);
            setShowAngels(false);
            setShowAngelsUpgrades(false);
        }
    }

    function toggleUnlocks(){
        if(showUnlocks==true){
            setShowUnlocks(false);
        }
        else{setShowUnlocks(true)
            setShowUpgrades(false);
            setShowAngels(false);
            setShowAngelsUpgrades(false);
            setShowManagers(false);
        }
    }

    function toggleUpgrades(){
        if(showUpgrades==true){
            setShowUpgrades(false);
        }
        else{setShowUpgrades(true)
            setShowAngels(false);
            setShowAngelsUpgrades(false);
            setShowManagers(false);
            setShowUnlocks(false);
        }
    }

    function toggleAngels(){
        if(showAngels==true){
            setShowAngels(false);
        }
        else{setShowAngels(true)
            setShowAngelsUpgrades(false);
            setShowManagers(false);
            setShowUnlocks(false);
            setShowUpgrades(false);
        }
    }

    function toggleAngelsUpgrades(){
        if(showAngelUpgrades==true){
            setShowAngelsUpgrades(false);
        }
        else{setShowAngelsUpgrades(true)
            setShowManagers(false);
            setShowUnlocks(false);
            setShowUpgrades(false);
            setShowAngels(false);

        }
    }

    function hireManager(managers: Palier): void {
        if(world.money >= managers.seuil){
            world.money = world.money-managers.seuil;
            managers.unlocked=true;
            world.products[managers.idcible-1].managerUnlocked= true;
            engagerManager({ variables: { name: managers.name } });
        }
    }

    function buyUpgrade(upgrade: Palier): void {
        if(world.money >= upgrade.seuil){
            world.money = world.money-upgrade.seuil;
            upgrade.unlocked=true;
            acheterCashUpgrades({ variables: { name : upgrade.name } });
            if(upgrade.typeratio == "vitesse"){
                world.products[upgrade.idcible].vitesse = world.products[upgrade.idcible].vitesse/upgrade.ratio;
            }else{
                world.products[upgrade.idcible].revenu = world.products[upgrade.idcible].revenu*upgrade.ratio;
            }
        }
    }

    function handleSnackBarManagers(){
        if(OpenManagers==false){
            setOpenManagers(true);
        }
        else(setOpenManagers(false));
    }
    function handleSnackBarUnlocks(){
        if(OpenUnlocks==false){
            setOpenUnlocks(true);
        }
        else(setOpenUnlocks(false));
    }
    function handleSnackBarUpgrades(){
        if(OpenUpgrades==false){
            setOpenUpgrades(true);
        }
        else(setOpenUpgrades(false));
    }

    function handleSnackBarAngelUpgrades(){

    }

    function handleManagerBadges(){
        var i = 0;
        var nbActuel = 0;
        var managersLocked = world.managers.filter(managers => !managers.unlocked && world.products[managers.idcible-1].quantite!=0);
        while(i<managersLocked.length){
            if(managersLocked[i].seuil<=world.money){
                nbActuel +=1;
            }
            i += 1;
        }
        if(nbActuel != ManagerBadges){
            setManagerBadges(nbActuel);
        }

    }

    function handleUpgradesBadges(){
        var i = 0;
        var nbActuel = 0;
        var upgradesLocked = world.upgrades.filter(upgrades => !upgrades.unlocked);
        while(i<upgradesLocked.length){
            if(upgradesLocked[i].seuil<=world.money){
                nbActuel +=1;
            }
            i += 1;
        }
        if(nbActuel != upgradesBadges){
            setUpgradesBadges(nbActuel);
        }

    }


    useInterval(() => handleManagerBadges(), 500)
    useInterval(() => handleUpgradesBadges(), 500)

    return (
        <div className='container'>
            <div className='logo-monde'><img className='round' src={"http://localhost:4000/" + world.logo} /> </div>
            <div className='argent'>
                <span dangerouslySetInnerHTML={{ __html: transform(world.money) }} /> $ 
            </div>
            <div className='multiplicateur'> Score : {world.score} </div>
            <div className='button'> <button onClick={changeValue}>{mult}</button> </div>
            <div className='produit-1'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[0]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username} />
            </div>
            <div className='produit2'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[1]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username} />
            </div>
            <div className='produit3'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[2]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username} />
            </div>
            <div className='produit4'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[3]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username} />
            </div>
            <div className='produit5'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[4]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username}/>
            </div>
            <div className='produit6'>
                <ProductComp onProductionDone={onProductionDone} product={world.products[5]} mult={mult} money={world.money}
                    onProductBuy={onProductBuy} username={username} />
            </div>
            <div className='boutonmenu1'>
                <div>
                    <Badge badgeContent={ManagerBadges} color="primary">
                        <button onClick={toggleManagers}>
                            Manager
                        </button>
                    </Badge>
                </div>
                <div>
                <br></br> {/*Code du bouton en dessous du manager, a garder ? */}
                    <button onClick={toggleUnlocks}>
                            Unlocks
                    </button>
                </div>
                <div>
                <br></br>
                <Badge badgeContent={upgradesBadges} color="primary">
                    <button onClick={toggleUpgrades}>
                        Upgrades
                    </button>
                </Badge>
                </div>
                <div>
                <br></br> 
                    <button onClick={toggleAngels}>
                            Investors
                    </button>
                </div>
                <div>
                <br></br> 
                    <button onClick={toggleAngelsUpgrades}>
                            AngelUpgd
                    </button>
                </div>
            </div>
            <Snackbar open={OpenManagers} autoHideDuration={4000} message="Manager engagé !" onClose={handleSnackBarManagers}/>
            <Snackbar open={OpenUnlocks} autoHideDuration={4000} message={"Unlock de "+typeUnlock+" débloqué !"} onClose={handleSnackBarUnlocks}/>
            <Snackbar open={OpenUpgrades} autoHideDuration={4000} message={"Upgrade débloqué !"} onClose={handleSnackBarUpgrades}/>
            <div> {/*Modal d'affichage des Managers*/}
            {showManagers== true &&
                <div className="modal">
                    <div>
                        <h1 className="title">Managers make you feel better !</h1>
                        <button className="closebutton" onClick={toggleManagers}>Close</button>
                    </div>
                    <div>
                        { world.managers.filter(managers => !managers.unlocked).map(
                            managers =>
                                <div key={managers.idcible} className="modalgrid" >
                                    <div>
                                        <div className="logo">
                                            <img alt="manager logo" className="roundModal" src={"http://localhost:4000/" + managers.logo} />
                                        </div>
                                    </div>
                                    <div className="infosmodal">
                                        <div className="modalname">{managers.name}</div>
                                        <div className="modalcible">{world.products[managers.idcible-1].name}</div>
                                        <div className="modalcost">{managers.seuil} $</div>
                                    </div>
                                    <div onClick={() => hireManager(managers)}>
                                        <button disabled={world.products[managers.idcible-1].quantite==0|| managers.seuil>world.money}
                                            onClick={handleSnackBarManagers} >Hire !
                                        </button>
                                    </div>
                                </div>
                        )
                        }
                    </div>
                </div>
            }
            {/*Modal d'affichage des Unlocks*/}
            {showUnlocks== true &&
                <div className="modal">
                    <div>
                        <h1 className="title">Unlocks For More Profits !</h1>
                        <button className="closebutton" onClick={toggleUnlocks}>Close</button>
                    </div>
                    <div>
                        { world.products.filter(products => products.quantite!=0).map(
                            products =>
                            products.paliers.filter(paliers => !paliers.unlocked).map(
                                paliers =>
                                <div key={paliers.idcible} className="modalgrid" >
                                    <div>
                                        <div className="logo">
                                            <img alt="manager logo" className="roundModal" src={"http://localhost:4000/" + paliers.logo} />
                                        </div>
                                    </div>
                                    <div className="infosmodal">
                                        <div className="modalname">{paliers.name}</div>
                                        <div className="modalcible">{world.products[paliers.idcible-1].name}</div>
                                        <div className="modalcost"> Quantite :{paliers.seuil} </div>
                                        <div className="modalcost"> Type d'amélioration :{paliers.typeratio} </div>
                                    </div>
                                </div>
                            )
                        )
                        }
                    </div>
                </div>
            }
            {/*Modal d'affichage des Upgrades*/}
            {showUpgrades== true &&
                <div className="modal">
                    <div>
                        <h1 className="title">Boost your investements !</h1>
                        <button className="closebutton" onClick={toggleUpgrades}>Close</button>
                    </div>
                    <div>
                    { world.upgrades.filter(upgrades => !upgrades.unlocked).map(
                            upgrades =>
                                <div key={upgrades.idcible} className="modalgrid" >
                                    <div>
                                        <div className="logo">
                                            <img alt="manager logo" className="roundModal" src={"http://localhost:4000/" + upgrades.logo} />
                                        </div>
                                    </div>
                                    <div className="infosmodal">
                                        <div className="modalname">{upgrades.name}</div>
                                        <div className="modalcible">{upgrades.idcible==0 && 'Tous les produits' }</div>
                                        <div className="modalcost"> {upgrades.seuil} $ </div>
                                        <div className="modalcost"> Type d'amélioration :{upgrades.typeratio} </div>
                                    </div>
                                    <div onClick={() => buyUpgrade(upgrades)}>
                                        <button disabled={upgrades.seuil>world.money}
                                            onClick={handleSnackBarUpgrades} >Hire !
                                        </button>
                                    </div>
                                </div>
                        )
                        }
                    </div>
                </div>
            }
            {showAngels== true &&
                <div className="modal">
                    <div>
                        <h1 className="title">Angel Investors !</h1>
                        <button className="closebutton" onClick={toggleAngels}>Close</button>
                    </div> 
                    <br></br>
                    <div className="modalgrid" >
                        <div className="infosmodal">
                            <div className="modalname">{world.totalangels}</div>
                            <div className="modalcible">2% Bonus Per Angels</div>
                            <div className='box'>nouveaux anges : <span dangerouslySetInnerHTML={{ __html: transform(150*Math.sqrt(world.score/10**15)-world.totalangels) }} /></div>
                        </div> 
                    </div>
                    <button>Reset</button>           
                </div>
            }
            {/*Modal d'affichage des Angels Upgrades*/}
            {showAngelUpgrades== true &&
                <div className="modal">
                    <div>
                        <h1 className="title">Sacrifice angels to boost your investements !</h1>
                        <button className="closebutton" onClick={toggleAngelsUpgrades}>Close</button>
                    </div>
                    <div>
                    { world.angelupgrades.filter(angelupgrades => !angelupgrades.unlocked).map(
                            angelupgrades =>
                                <div key={angelupgrades.idcible} className="modalgrid" >
                                    <div>
                                        <div className="logo">
                                            <img alt="manager logo" className="roundModal" src={"http://localhost:4000/" + angelupgrades.logo} />
                                        </div>
                                    </div>
                                    <div className="infosmodal">
                                        <div className="modalname">{angelupgrades.name}</div>
                                        <div className="modalcible">{angelupgrades.idcible==0 && 'Tous les produits' }</div>
                                        <div className="modalcost"> {angelupgrades.seuil} Anges </div>
                                        <div className="modalcost"> Type d'amélioration :{angelupgrades.typeratio} </div>
                                    </div>
                                    <div onClick={() => buyUpgrade(angelupgrades)}>
                                        <button disabled={world.products[angelupgrades.idcible].quantite==0|| angelupgrades.seuil>world.money}
                                            onClick={handleSnackBarAngelUpgrades} >Hire !
                                        </button>
                                    </div>
                                </div>
                        )
                        }
                    </div>
                </div>
            }
        </div>
    </div>
    );
       
}


const ACHETER_QT_PRODUIT = gql(`
   mutation acheterQtProduit($id: Int!, $quantite: Int!) {
        acheterQtProduit(id: $id, quantite: $quantite) {
            id
      }
   }`);

const ENGAGER_MANAGER = gql(`
    mutation engagerManager($name: String!) {
        engagerManager(name: $name) {
            name
      }
   }`);

   const ACHETER_CASH_UPGRADES = gql(`
   mutation acheterCashUpgrades($name: String!) {
        acheterCashUpgrades(name: $name) {
           name
     }
  }`);