module.exports = {
    "name": "Loc Lac",
    "logo": "icons/logomonde.jpg",
    "money": 1000,
    "score": 0,
    "totalangels": 0,
    "activeangels": 0,
    "angelbonus": 2,
    "lastupdate": 0,
    "products": [
        {
            "id": 1,
            "name": "premier produit",
            "logo": "icons/premierproduit.jpg",
            "cout": 4,
            "croissance": 1.07,
            "revenu": 1,
            "vitesse": 500,
            "quantite": 1,
            "timeleft": 0,
            "managerUnlocked": false,
            "paliers": [
                {
                    "name": "Nom du premier palier",
                    "logo": "icons/premierpalier.jpg",
                    "seuil": 20,
                    "idcible": 1,
                    "ratio": 2,
                    "typeratio": "vitesse",
                    "unlocked": false
                },
                {
                    "name": "Nom deuxième palier",
                    "logo": "icons/deuxiemepalier.jpg",
                    "seuil": 75,
                    "idcible": 1,
                    "ratio": 2,
                    "typeratio": "gain",
                    "unlocked": false
                }
            ]
        },
        {
            "id": 2,
            "name": "Deuxième produit",
            "logo": "icons/deuxiemeproduit.jpg",
            "cout": 10,
            "croissance": 1.18,
            "revenu": 1,
            "vitesse": 500,
            "quantite": 1,
            "timeleft": 0,
            "managerUnlocked": false,
            "paliers": []
        }
    ],
    "allunlocks": [
        {
            "name": "Nom du premier unlock général",
            "logo": "icons/premierunlock.jpg",
            "seuil": 30,
            "idcible": 0,
            "ratio": 2,
            "typeratio": "gain",
            "unlocked": false
        }
    ],
    "upgrades": [
        {
            "name": "Nom du premier upgrade",
            "logo": "icons/premierupgrade.jpg",
            "seuil": 3,
            "idcible": 1,
            "ratio": 3,
            "typeratio": "gain",
            "unlocked": false
        }
    ],
    "angelupgrades": [
        {
            "name": "Angel Sacrifice",
            "logo": "icons/angel.png",
            "seuil": 10,
            "idcible": 0,
            "ratio": 3,
            "typeratio": "gain",
            "unlocked": false
        }
    ],
    "managers": [
        {
            "name": "Wangari Maathai",
            "logo": "icons/WangariMaathai.jpg",
            "seuil": 10,
            "idcible": 1,
            "ratio": 0,
            "typeratio": "gain",
            "unlocked": false
        }
    ]
};