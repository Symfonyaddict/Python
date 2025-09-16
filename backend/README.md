# Backend pour YouTube Video Downloader

Ce backend fournit les API nécessaires pour récupérer les informations des vidéos YouTube et les télécharger.

## Installation

```bash
cd backend
npm install
```

## Démarrage du serveur

```bash
npm start
```

Pour le développement avec redémarrage automatique :

```bash
npm run dev
```

## API Endpoints

### Récupérer les informations d'une vidéo
```
GET /api/video-info?url=YOUTUBE_URL
```

### Télécharger une vidéo
```
GET /api/download?url=YOUTUBE_URL&itag=ITAG&format=FORMAT&filename=FILENAME
```

## Dépendances principales
- express: Framework web
- ytdl-core: Bibliothèque pour télécharger les vidéos YouTube
- cors: Middleware pour gérer les requêtes cross-origin
- ffmpeg-static: Pour la conversion des formats audio/vidéo