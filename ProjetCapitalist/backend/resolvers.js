const fs = require("fs").promises;
module.exports = {
    Query: {
        getWorld(parent, args, context, info) {
            updateScore(context);
            saveWorld(context);
            return context.world;
        }
    },
    Mutation: {
        acheterQtProduit(parent, args, context){
            updateScore(context);
            
            let world = context.world;
            let produit = world.products.find((p)=> p.id === args.id);

            if(produit == undefined){
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }
            
            let coutTTC=0;
            let lastCout=produit.cout;
            for(let i = 0;i<args.quantite;i++){
                lastCout=lastCout*produit.croissance
                coutTTC+=lastCout;
            }
            if(world.money>=coutTTC){
                produit.cout=lastCout;
                world.money-=coutTTC;
                produit.quantite+=args.quantite;
            }else{
                throw new Error(`Pas assez d'argent`);
            }
            
            //unlocks
            produit.paliers.forEach(p => {
                if((p.unlocked==false)&&(p.seuil<=produit.quantite)){
                    p.unlocked=true;
                }
                
            });
            //__________________________________________________________

            //allunlock
            world.allunlocks.forEach(au => {
                if(au.unlocked==false){
                    let seuilOK=false;
                    world.products.forEach(p => {
                        if(p.quantite>=au.seuil){
                            seuilOK=true;
                        }else{
                            seuilOK=false;
                        }
                    });
                    if(seuilOK){
                        au.unlocked=true;
                    }
                }
            });

            saveWorld(context);
            return produit;
               
        },
        lancerProductionProduit(parent, args, context){
            updateScore(context);

            let world = context.world;
            
            let produit = world.products.find((p)=> p.id === args.id);
            let bonus=getBonus(produit,world);
            if(produit === undefined){
                throw new Error(`Le produit avec l'id ${args.id} n'existe pas`);
            }else{
                produit.timeleft=Math.round(produit.vitesse/bonus[1]);
            }
            saveWorld(context);
            return produit;

        },
        engagerManager(parent, args, context){
            updateScore(context);
            let world = context.world;
            let manager = world.managers.find((m)=> m.name === args.name);
            let produit = world.products.find((p)=> p.id === manager.idcible);
            if(manager === undefined){
                throw new Error(`Le manager avec l'id ${args.name} n'existe pas`);
            }else{
                if(world.money>=manager.seuil){
                    produit.managerUnlocked=true;
                    manager.unlock=true;
                    world.money-=manager.seuil;
                }else{
                    throw new Error(`Pas assez d'argent`);
                }
            }

            saveWorld(context);
            return manager;
        },
        acheterCashUpgrade(parent, args, context){
            updateScore(context);
            let world = context.world;
            let upgrade = world.upgrades.find((u)=> u.name==args.name);

            if(upgrade === undefined){
                throw new Error(`L'upgrade avec le nom ${args.name} n'existe pas`);
            }else{
                if(world.money>=upgrade.seuil){
                    upgrade.unlock=true;
                    world.money-=upgrade.seuil;
                }else{
                    throw new Error(`Pas assez d'argent`);
                }
            }

            saveWorld(context);
            return upgrade;
        },
        acheterAngelUpgrade(parent, args, context){
            updateScore(context);
            let world = context.world;
            let angelUpgrade = world.angelupgrades.find((a)=> a.name==args.name);

            if(angelUpgrade === undefined){
                throw new Error(`L'angelUpgrade avec le nom ${args.name} n'existe pas`);
            }else{
                if(world.angelbonus>=angelUpgrade.seuil){$
                    angelUpgrade.unlock=true;
                    world.angelbonus-=angelUpgrade.seuil;
                }else{
                    throw new Error(`Pas assez d'anges!`);
                }
            }

            saveWorld(context);
            return angelUpgrade;
        },

        resetWorld(parent, args, context) {
            updateScore(context);
            let world = context.world;
            let newWorld = require("./world");
            let score = world.score;
            let totalAngels = world.totalangels;
            let activeAngels = world.activeangels;

            newWorld.activeangels = activeAngels;
            newWorld.totalangels = totalAngels;

            let anges=Math.round(150 * Math.sqrt(score / Math.pow(10, 15)) - totalAngels);
            if(anges>0){
                newWorld.activeangels += Math.round(150 * Math.sqrt(score / Math.pow(10, 15)) - totalAngels);
                newWorld.totalangels += Math.round(150 * Math.sqrt(score / Math.pow(10, 15)));
            }

            newWorld.lastupdate = Date.now().toString();
            context.world = newWorld;
            saveWorld(context);
            return newWorld;
        }
    }
};

//calcule le score gagné entre 2 interactions
function updateScore(context){
    let world = context.world;
    let produits=world.products;

    produits.forEach(p => {
        let diff= Date.now()-world.lastupdate;
        let bonus=getBonus(p,world);
        let enProd=false;
        if(p.timeleft>0){
            enProd=true;
        }
        if(p.managerUnlocked){
            world.money+=((p.revenu*bonus[0])*p.quantite)*(diff/(p.vitesse/bonus[1]));
        }else{
            if(enProd){    
                p.timeleft-=diff;
                if(p.timeleft<0){
                    world.money+=(p.revenu*bonus[0])*p.quantite;
                    p.timeleft=0;
                }
            }           
                
        }
        
    });
    world.score+=world.money;
    world.lastupdate=Date.now().toString();
    saveWorld(context);
}

//retourne un tableau contenant le bonus de gain et le bonus de vitesse
function getBonus(produit, world){
    
    let bonusVitesse = 1;
    let bonusGain = 1;
    //unlocks
    produit.paliers.forEach(p => {
        if(p.unlocked==true){
            if(p.typeratio=="vitesse"){
                bonusVitesse+=p.ratio;
            }else{
                bonusGain+=p.ratio;
            }
        }
        
    });
    //__________________________________________________________

    //allunlock
    world.allunlocks.forEach(au => {
        if(au.unlocked==true){
            if(au.typeratio=="vitesse"){
                bonusVitesse+=au.ratio;
            }else{
                bonusGain+=au.ratio;
            }
        }
    });
    //__________________________________________________________
    world.managers.forEach(m => {
        if(m.unlocked==true){
            if(m.idcible==produit.id){
                if(m.typeratio=="vitesse"){
                    bonusVitesse+=m.ratio;
                }else{
                    bonusGain+=m.ratio;
                }
            }
        }
    });
    world.angelupgrades.forEach(a => {
        if(a.unlocked==true){
            if((a.idcible=="0")||(a.idcible==produit.id)){
                if(a.typeratio=="vitesse"){
                    bonusVitesse+=a.ratio;
                }else{
                    bonusGain+=a.ratio;
                }
            }
        }
    });
    world.upgrades.forEach(u => {
        if(u.unlocked==true){
            if((u.idcible=="0")||(u.idcible==produit.id)){
                if(a.typeratio=="vitesse"){
                    bonusVitesse+=u.ratio;
                }else{
                    bonusGain+=u.ratio;
                }
            }
        }
    });
    return [bonusGain,bonusVitesse];
}

function saveWorld(context) {
    fs.writeFile("../userworlds/" + context.user + "-world.json", JSON.stringify(context.world), err => {
        if (err) {
            console.error(err);
            throw new Error(`Erreur d'écriture du monde coté serveur`);
        }
    })
}
   