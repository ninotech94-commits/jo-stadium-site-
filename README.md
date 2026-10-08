# JO STADIUM — fichiers complets client + administration + serveur

## Contenu
- `public/index.html` : site de réservation client
- `public/admin.html` : espace administrateur
- `server.js` : API commune aux téléphones
- `package.json` : dépendances et commande de démarrage
- `data/bookings.json` : fichier initial des réservations

## Important
Le site ne sera synchronisé entre plusieurs téléphones que lorsque le serveur sera déployé et que les pages client et admin seront servies par ce même serveur. Déposer uniquement `index.html` sur Netlify ne lance pas le serveur.

Ce paquet enregistre les réservations dans `data/bookings.json`. Sur un hébergeur dont le disque est éphémère, les données peuvent disparaître lors d'un redémarrage/redéploiement. Pour une mise en production fiable, configurez un disque persistant chez l'hébergeur ou remplacez le stockage par une base de données persistante avant d'accepter des réservations réelles.

## Déploiement serveur
1. Extraire le ZIP.
2. Envoyer le contenu du dossier `JO_STADIUM_backend` dans le dépôt GitHub (le dossier racine du dépôt doit contenir `server.js` et `package.json`).
3. Sur un hébergeur Node.js, définir la commande de démarrage `npm start`.
4. Définir la variable d'environnement `ADMIN_PASSWORD` avec un mot de passe fort, différent de `1234`. Ne pas publier ce mot de passe dans le dépôt.
5. Configurer un stockage persistant avant la mise en production.
6. Utiliser l'URL du serveur pour le site client et ajouter `/admin` pour l'administration.

## API
- `GET /api/availability`
- `POST /api/bookings`
- `POST /api/admin/login`
- `GET /api/admin/bookings`
- `DELETE /api/admin/bookings/:id`

## Test local
Node.js 18+ requis : `npm install`, puis `npm start`.
