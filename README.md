<div align="center">
  <img src="https://res.cloudinary.com/dkm0afqqy/image/upload/v1695902423/firstlady/one_logo_l7ybtg.png"/>
  <p><b>PREMIERE DAME</b></p>
</div>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

Application Web (partie backend) de vente des pagne en ligne et sur place.

## Installation

```bash
$ git clone https://github.com/lexnotor/first_lady-backend.git backend
$ cd backend
$ pnpm install
```

## Technologie utiliser

Ce serveur utilise differente techno, par exemple une base de données, pour son fonctionnement. Il est imperative de les installer et completer le fichier .env à la racine avant de le lancer.

### Base de données

La base de données utilisé est [**PostgreSQL**](https://postgresql.org/). Completez le fichier _.env_ (voir _.env.example_), les information à fournir sont:

```bash
# DB_NAME  le nom de la base de données

# DB_HOST  l'adresse du serveur PostgreSQL

# DB_PORT  port sur le quel est lancé PostgreSQL

# DB_USERNAME  utilisateur de la base de données (avec les droits suffissant - SUPERUSER - )

# DB_SECRET le mot de passe de l'utilisateur
```

Il faudra ensuite fournir les mêmes informations dans le fichier .env situer à `/src/database/.env`. Ce dossier contient les configurations à faire pour executer la migration

### Image bucket

Les images uploader ne sont pas stockées sur le serveur, mais plutôt sur un cloud distant, [**Cloudinary**](https://cloudinary.com/). Il faudra donc ajouter les clés fournis par cloudinary pour que l'upload des images fonctionne.

Les informations à ajouter dans le fichier _.env_ (voir _.env.example_) sont:

```bash
# CLOUDINARY_NAME  identifiant unique fourni par cloudinary

# CLOUDINARY_KEY  la clés public fournis par cloudinary

# CLOUDINARY_SECRET  la clés secrete fournis par cloudinary
```

### Service de Payment

Pour recevoir les paiements en ligne nous utilisons [Stripe](https://stripe.com/). Il permet d'effectuer des achats à l'aide des cartes bancaires et autre moyens internationaux.

Pour le connecter au serveur, il faudra ajouter les informations suivante dans le fichier _.env_ (voir _.env.example_)

```bash
# STRIPE_SECRET la clé secret founis par Stipe

# REDIRECT_PAYMENT_SUCCESS  le lien du frontend suivi du pathname /order (ex: http://monsite.com/order)

# STRIPE_WEBHOOK_SECRET  la clé secret fournis par stripe pour authentifier les requettes WebHook
```

### Autres données à fournir

```bash
# PORT  le port sur lequel lancé le serveur (par defaut 3500)

# JWT_SECRET  le salt à utiliser pour hasher les mots de passe des utilisateur (Trés important, pour n'est pas perdre les accéss)
```

## Executer les migrations

Votre base des données est sencé être vide. Il faudra executer les migrations pour ajouter l'utilisateur admin dans la base de données.

```bash
# Crée un utilisateur sudo par défaut
# username = admin
# password = @dmin4321
$ pnpm migration:run
```

Pour changer ses identifiants par defaut, vous pouvez les completer dans /src/database/.env avant d'executer les migrations

```bash
SUDO_USERNAME
SUDO_SECRET
```

## Lancer l'application

```bash
# En développement
$ pnpm run start

# En watch mode
$ pnpm run start:dev

# En mode production
$ pnpm run start:prod
```
