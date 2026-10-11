# Home Miterdei — version 4

Collectif Home Miterdei : projet d'achat du kit Starlink Standard à **530 $ US**.

## Fonctionnalités
- Accueil personnalisé, thème clair/sombre, glassmorphism monochrome.
- Maison Three.js manipulable : rotation à la souris et au doigt, zoom molette/pincement, boutons de vue, clavier et réinitialisation. **Il s'agit d'une simulation, pas du bâtiment réel.**
- Localisation du visiteur facultative, non enregistrée.
- Cotisation indicative : 530 / nombre de participants confirmés, arrondi au centime supérieur.
- Compteurs actualisés toutes les dix secondes, et immédiatement après confirmation de l'e-mail.
- Consentement aux conditions et vérification de l'adresse e-mail.

## Services manquants avant ouverture
Variables sur Vercel :
- `KIT_PRICE_USD=530` et `ADMIN_CONTACT_EMAIL=bagumakazamba@gmail.com` : configurées.
- `SIGNUP_SECRET` : configurée, à garder secrète.
- `BLOB_READ_WRITE_TOKEN` : **à connecter à un store Vercel Blob privé**.
- `RESEND_API_KEY` et `MAIL_FROM` : **à ajouter** avec un expéditeur vérifié dans Resend. Gmail personnel est le contact/réponse, pas une adresse expéditrice Resend vérifiée.

Aucun paiement n'a lieu sur le site. Le montant définitif doit être approuvé séparément avant collecte ; livraison, batterie, installation et forfait Internet sont exclus du prix affiché.

## Installation

```bash
npm install
npx vercel dev
```

Code statique dans `public/`, fonctions backend dans `api/`. Les noms d'accueil restent en localStorage ; seules les inscriptions e-mail confirmées sont enregistrées en stockage privé quand celui-ci est configuré. Les comptes publics affichent des agrégats, pas de noms ou e-mails individuels.

Avant l'ouverture, définir politique de conservation et suppression, calendrier, remboursement et limitation anti-abus.

Déploiement : https://home-miterdei.vercel.app
Dépôt : https://github.com/jeankazazmba/home-miterdei
