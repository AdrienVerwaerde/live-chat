
# MonAPI - README

## 1. Cloner le dépôt GitHub et démarrer le projet

### Clonage du dépôt
Pour commencer, vous devez cloner le dépôt GitHub sur votre machine locale. Dans votre terminal, utilisez la commande suivante :

```bash
git clone https://github.com/username/nom-du-repo.git
```

Ensuite, déplacez-vous dans le répertoire du projet :

```bash
cd nom-du-repo
```

### Installation des dépendances
Assurez-vous que Node.js et npm sont installés sur votre machine. Une fois dans le dossier du projet, installez toutes les dépendances du projet avec la commande suivante :

```bash
npm install
```

### Démarrer le projet
Pour démarrer le serveur en mode développement, utilisez la commande :

```bash
npm run dev
```

Pour démarrer le projet en mode production :

```bash
npm start
```

Cela démarrera votre serveur Node.js et le connectera à la base de données MongoDB. Assurez-vous que votre fichier `.env` est correctement configuré avec les informations de connexion à MongoDB.

## 2. Explication des concepts de base et des dossiers/fichiers

### Dossiers

- **routes/** : Ce dossier contient toutes les routes de l'application. Chaque fichier de route est lié à un modèle particulier (par exemple, `users.js` pour les utilisateurs). Les routes définissent les points d'entrée pour l'API.

- **controllers/** : Les contrôleurs contiennent la logique métier pour chaque route. Par exemple, pour une route qui récupère des utilisateurs, le contrôleur va se connecter au modèle pour extraire les données de la base et les renvoyer au client.

- **models/** : Les modèles sont les schémas de données utilisés pour interagir avec MongoDB. Nous utilisons Mongoose pour définir la structure des documents dans MongoDB et pour effectuer les opérations CRUD (Create, Read, Update, Delete).

### Fichiers principaux

- **index.js** : C'est le fichier principal qui démarre l'application. Il initialise le serveur Express, configure les middlewares, connecte la base de données MongoDB, et utilise les routes.

- **routes.js** : Ce fichier centralise toutes les routes. Il importe chaque fichier de route individuel et les relie à l'application.

- **.env** : Ce fichier contient vos variables d'environnement (comme les informations de connexion à la base de données). Ne pas oublier de le créer en fonction des besoins de l'application.

## 3. Ajouter des routes, contrôleurs et modèles

### Étapes pour ajouter une nouvelle route
1. **Modèle** : Dans le dossier `models/`, créez un nouveau fichier JavaScript pour définir le modèle avec Mongoose. Par exemple, pour un modèle de "produit" :
   
   ```js
   const mongoose = require('mongoose');
   const productSchema = new mongoose.Schema({
     name: String,
     price: Number,
   });
   module.exports = mongoose.model('Product', productSchema);
   ```

2. **Contrôleur** : Créez un fichier dans `controllers/` qui contiendra les fonctions liées à ce modèle. Exemple :

   ```js
   const Product = require('../models/product');
   exports.getProducts = async (req, res) => {
     const products = await Product.find();
     res.json(products);
   };
   ```

3. **Route** : Créez un fichier dans `routes/` pour définir les routes et associez-les aux contrôleurs. Exemple pour `routes/product.js` :

   ```js
   const express = require('express');
   const router = express.Router();
   const productController = require('../controllers/productController');
   
   router.get('/products', productController.getProducts);
   
   module.exports = router;
   ```

4. **Relier la nouvelle route** : Dans `routes.js`, reliez le fichier de route que vous venez de créer :

   ```js
   const productRoutes = require('./routes/product');
   app.use('/api', productRoutes);
   ```

## 4. Tester les routes avec Postman

### Utilisation de Postman

1. **Installer Postman** : Vous pouvez télécharger Postman depuis [le site officiel](https://www.postman.com/downloads/).

2. **Envoyer des requêtes** : Dans Postman, vous pouvez tester chaque route de votre API. Par exemple, si vous avez une route `GET /api/products`, ouvrez Postman, choisissez `GET` dans le menu déroulant, et entrez l'URL `http://localhost:3000/api/products`.

3. **Ajouter un body pour les requêtes POST/PUT** : Pour les requêtes `POST` et `PUT`, vous devrez envoyer des données dans le body de la requête. Sélectionnez l'onglet "Body" dans Postman, choisissez "raw", et assurez-vous que le format est "JSON". Par exemple :

   ```json
   {
     "name": "Produit Exemple",
     "price": 19.99
   }
   ```

4. **Vérification des réponses** : Lorsque vous envoyez une requête, Postman affichera la réponse de l'API dans la section inférieure. Si tout fonctionne correctement, vous verrez les données que vous avez demandées ou un message de confirmation pour les requêtes `POST`/`PUT`.

---