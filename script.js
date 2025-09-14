// Éléments du DOM
const videoUrlInput = document.getElementById('video-url');
const fetchBtn = document.getElementById('fetch-btn');
const downloadBtn = document.getElementById('download-btn');
const previewSection = document.getElementById('preview-section');
const optionsSection = document.getElementById('options-section');
const progressSection = document.getElementById('progress-section');
const downloadProgress = document.getElementById('download-progress');
const progressPercentage = document.getElementById('progress-percentage');
const timeRemaining = document.getElementById('time-remaining');
const statusMessage = document.getElementById('status-message');
const urlError = document.getElementById('url-error');
const downloadHistory = document.getElementById('download-history');
const formatSelect = document.getElementById('format-select');
const qualitySelect = document.getElementById('quality-select');
const filenameInput = document.getElementById('filename');
const destinationFolderInput = document.getElementById('destination-folder');
const browseFolderBtn = document.getElementById('browse-btn');
const currentYear = document.getElementById('current-year');

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Définir l'année courante dans le footer
    currentYear.textContent = new Date().getFullYear();
    
    // Définir un dossier de destination par défaut
    destinationFolderInput.value = 'C:\\Téléchargements';
    
    // Charger l'historique des téléchargements depuis le stockage local
    loadDownloadHistory();
    
    // Ajouter les écouteurs d'événements
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Validation de l'URL lors de la saisie
    videoUrlInput.addEventListener('input', validateYouTubeUrl);
    
    // Récupération des informations de la vidéo
    fetchBtn.addEventListener('click', fetchVideoInfo);
    
    // Lancement du téléchargement
    downloadBtn.addEventListener('click', startDownload);
    
    // Mise à jour des options en fonction du format sélectionné
    formatSelect.addEventListener('change', updateQualityOptions);
    
    // Sélection du dossier de destination
    browseFolderBtn.addEventListener('click', selectDestinationFolder);
}

// Sélection du dossier de destination
function selectDestinationFolder() {
    // Dans un environnement web réel, nous ne pouvons pas accéder directement au système de fichiers
    // pour des raisons de sécurité. Nous allons donc simuler cette fonctionnalité.
    
    // Simuler une boîte de dialogue de sélection de dossier
    showStatus('Sélection du dossier...', 'warning');
    
    // Simuler un délai pour l'ouverture de la boîte de dialogue
    setTimeout(() => {
        // Proposer quelques dossiers prédéfinis dans une boîte de dialogue simulée
        const folders = [
            'C:\\Users\\forma\\Downloads',
            'C:\\Utilisateurs\\Documents\\Vidéos',
            'D:\\Médias\\YouTube',
            'Dossier personnalisé...'
        ];
        
        // Créer une boîte de dialogue personnalisée
        createFolderSelectionDialog(folders);
    }, 500);
}

// Créer une boîte de dialogue de sélection de dossier
function createFolderSelectionDialog(folders) {
    // Supprimer toute boîte de dialogue existante
    const existingDialog = document.querySelector('.folder-dialog-overlay');
    if (existingDialog) {
        document.body.removeChild(existingDialog);
    }
    
    // Créer l'overlay et la boîte de dialogue
    const overlay = document.createElement('div');
    overlay.className = 'folder-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'folder-dialog';
    
    // Ajouter le titre
    const title = document.createElement('h3');
    title.textContent = 'Sélectionner un dossier de destination';
    dialog.appendChild(title);
    
    // Ajouter la liste des dossiers
    const folderList = document.createElement('div');
    folderList.className = 'folder-list';
    
    folders.forEach(folder => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-folder';
        folderItem.appendChild(icon);
        
        const folderName = document.createElement('span');
        folderName.textContent = folder;
        folderItem.appendChild(folderName);
        
        // Ajouter l'événement de clic
        folderItem.addEventListener('click', () => {
            if (folder === 'Dossier personnalisé...') {
                // Simuler l'entrée d'un chemin personnalisé
                const customPath = prompt('Entrez le chemin du dossier:', 'C:\\Utilisateurs\\Vidéos\\YouTube');
                if (customPath) {
                    destinationFolderInput.value = customPath;
                    showStatus('Dossier sélectionné: ' + customPath, 'success');
                }
            } else {
                destinationFolderInput.value = folder;
                showStatus('Dossier sélectionné: ' + folder, 'success');
            }
            
            // Fermer la boîte de dialogue
            document.body.removeChild(overlay);
        });
        
        folderList.appendChild(folderItem);
    });
    
    dialog.appendChild(folderList);
    
    // Ajouter le bouton d'annulation
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'dialog-cancel-btn';
    cancelBtn.textContent = 'Annuler';
    cancelBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    dialog.appendChild(cancelBtn);
    
    // Ajouter la boîte de dialogue à l'overlay et l'overlay au body
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Ajouter un gestionnaire d'événements pour fermer la boîte de dialogue en cliquant sur l'overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

// Validation de l'URL YouTube
function validateYouTubeUrl() {
    const url = videoUrlInput.value.trim();
    
    if (url === '') {
        urlError.textContent = 'Veuillez entrer une URL YouTube';
        return false;
    }
    
    // Vérification des URLs YouTube standard (youtu.be et youtube.com/watch)
    const shortUrlRegex = /^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(&.*)?$/;
    const watchUrlRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch.*[?&]v=([a-zA-Z0-9_-]{11})(&.*)?$/;
    const playlistRegex = /^(https?:\/\/)?(www\.)?youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)(&.*)?$/;
    
    if (playlistRegex.test(url)) {
        urlError.textContent = 'Les playlists ne sont pas supportées. Veuillez entrer une URL de vidéo unique.';
        return false;
    }
    
    if (!shortUrlRegex.test(url) && !watchUrlRegex.test(url)) {
        urlError.textContent = 'Format d\'URL YouTube non reconnu. Utilisez youtu.be/ID ou youtube.com/watch?v=ID';
        return false;
    }
    
    // Vérifier que l'ID de la vidéo a la bonne longueur (11 caractères)
    const videoId = extractVideoId(url);
    if (!videoId || videoId.length !== 11) {
        urlError.textContent = 'ID de vidéo YouTube invalide. Vérifiez l\'URL.';
        return false;
    }
    
    urlError.textContent = '';
    return true;
}

// Extraction de l'ID de la vidéo à partir de l'URL
function extractVideoId(url) {
    // Vérifier d'abord le format court (youtu.be)
    let shortUrlRegex = /^(https?:\/\/)?(www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(&.*)?$/;
    let match = url.match(shortUrlRegex);
    if (match) {
        return match[3]; // L'ID est dans le groupe 3 pour ce format
    }
    
    // Ensuite vérifier le format youtube.com/watch?v=
    let watchUrlRegex = /[?&]v=([a-zA-Z0-9_-]{11})(&.*)?$/;
    match = url.match(watchUrlRegex);
    if (match) {
        return match[1]; // L'ID est dans le groupe 1 pour ce format
    }
    
    return null; // Aucun ID trouvé
}

// Récupération des informations de la vidéo
async function fetchVideoInfo() {
    if (!validateYouTubeUrl()) {
        showError('Veuillez entrer une URL YouTube valide');
        return;
    }
    
    const url = videoUrlInput.value.trim();
    const videoId = extractVideoId(url);
    
    if (!videoId) {
        showError('Impossible d\'extraire l\'ID de la vidéo. Vérifiez que l\'URL est correcte.');
        return;
    }
    
    // Simuler la récupération des informations de la vidéo
    // Dans une application réelle, cela serait fait via une API
    try {
        showStatus('Récupération des informations de la vidéo...', 'warning');
        
        // Vérifier la connexion internet
        if (!navigator.onLine) {
            throw new Error('Pas de connexion Internet. Veuillez vérifier votre connexion et réessayer.');
        }
        
        // Simulation d'un appel API
        await simulateApiCall();
        
        // Récupérer les informations de la vidéo via l'API YouTube
        const videoInfo = await fetchYouTubeVideoInfo(videoId);
        
        if (!videoInfo) {
            throw new Error('Impossible de récupérer les informations de la vidéo. Veuillez réessayer.');
        }
        
        // Afficher la prévisualisation
        displayVideoPreview(videoInfo);
        
        // Afficher les options de téléchargement
        optionsSection.style.display = 'block';
        downloadBtn.disabled = false;
        
        showStatus('Informations récupérées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors de la récupération:', error);
        showError(`Erreur lors de la récupération des informations: ${error.message}`);
        // Réinitialiser l'interface
        previewSection.style.display = 'none';
        optionsSection.style.display = 'none';
        downloadBtn.disabled = true;
    }
}

// Simulation d'un appel API (pour démonstration)
function simulateApiCall() {
    return new Promise(resolve => {
        setTimeout(resolve, 1500);
    });
}

// Récupération des informations de la vidéo via l'API YouTube
async function fetchYouTubeVideoInfo(videoId) {
    // Dans une application réelle, cela serait fait via une API YouTube
    // Pour cette démo, nous simulons les données
    
    try {
        // Simuler une requête à l'API YouTube
        // Normalement, vous utiliseriez quelque chose comme:
        // const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=YOUR_API_KEY`);
        // const data = await response.json();
        
        // Vérifier si la miniature existe
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        const thumbnailExists = await checkImageExists(thumbnailUrl);
        
        // Si la miniature n'existe pas, c'est probablement que la vidéo n'existe pas
        if (!thumbnailExists) {
            // Essayer avec une miniature de qualité inférieure
            const fallbackThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            const fallbackExists = await checkImageExists(fallbackThumbnail);
            
            if (!fallbackExists) {
                throw new Error('Vidéo introuvable ou inaccessible. Vérifiez l\'ID de la vidéo.');
            }
            
            // Utiliser la miniature de secours
            return generateVideoInfo(videoId, fallbackThumbnail);
        }
        
        // Générer des informations simulées avec la miniature de haute qualité
        return generateVideoInfo(videoId, thumbnailUrl);
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de la vidéo:', error);
        throw new Error('Impossible de récupérer les informations de la vidéo: ' + error.message);
    }
}

// Vérifier si une image existe
async function checkImageExists(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Générer des informations simulées pour une vidéo
function generateVideoInfo(videoId, thumbnailUrl) {
    // Générer un titre aléatoire basé sur l'ID de la vidéo
    const titlePrefixes = ['Comment faire', 'Tutoriel', 'Guide complet', 'Découverte', 'Analyse de', 'Revue de'];
    const titleSubjects = ['Python', 'JavaScript', 'développement web', 'programmation', 'intelligence artificielle', 'machine learning'];
    const titleSuffixes = ['pour débutants', 'avancé', '2023', 'expliqué simplement', 'en 10 minutes', 'étape par étape'];
    
    const randomTitle = `${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)]} ${titleSubjects[Math.floor(Math.random() * titleSubjects.length)]} ${titleSuffixes[Math.floor(Math.random() * titleSuffixes.length)]}`;
    
    // Générer une durée aléatoire
    const minutes = Math.floor(Math.random() * 20) + 1;
    const seconds = Math.floor(Math.random() * 60);
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Générer un nombre de vues aléatoire
    const views = Math.floor(Math.random() * 1000000) + 1000;
    const formattedViews = views.toLocaleString();
    
    // Générer une date de publication aléatoire
    const currentDate = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 365) + 1;
    const publishDate = new Date(currentDate.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);
    const formattedDate = publishDate.toLocaleDateString();
    
    return {
        id: videoId,
        title: randomTitle,
        description: `Cette vidéo explique en détail comment maîtriser ${titleSubjects[Math.floor(Math.random() * titleSubjects.length)]}. Vous apprendrez les concepts fondamentaux et les techniques avancées pour devenir un expert.`,
        thumbnail: thumbnailUrl,
        duration: duration,
        views: formattedViews,
        author: 'Tech Academy',
        publishedAt: formattedDate,
        formats: [
            { format: 'mp4', quality: 'highest', label: '1080p' },
            { format: 'mp4', quality: 'high', label: '720p' },
            { format: 'mp4', quality: 'medium', label: '480p' },
            { format: 'mp4', quality: 'low', label: '360p' },
            { format: 'mp3', quality: 'highest', label: '320kbps' },
            { format: 'mp3', quality: 'high', label: '256kbps' },
            { format: 'mp3', quality: 'medium', label: '192kbps' },
            { format: 'mp3', quality: 'low', label: '128kbps' },
            { format: 'webm', quality: 'highest', label: '1080p' },
            { format: 'webm', quality: 'high', label: '720p' },
            { format: 'webm', quality: 'medium', label: '480p' },
            { format: 'webm', quality: 'low', label: '360p' }
        ]
    };
}

// Affichage de la prévisualisation de la vidéo
function displayVideoPreview(videoInfo) {
    // Créer le contenu HTML pour la prévisualisation
    const previewHTML = `
        <div class="preview-container fade-in">
            <div class="thumbnail-container">
                <img src="${videoInfo.thumbnail}" alt="Miniature de la vidéo">
            </div>
            <div class="video-info">
                <h3>${videoInfo.title}</h3>
                <div class="video-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i> ${videoInfo.author}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i> ${videoInfo.duration}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-eye"></i> ${videoInfo.views} vues
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar-alt"></i> ${videoInfo.publishedAt}
                    </div>
                </div>
                <div class="video-description">
                    ${videoInfo.description}
                </div>
            </div>
        </div>
    `;
    
    // Afficher la prévisualisation
    previewSection.innerHTML = previewHTML;
    previewSection.style.display = 'block';
    
    // Mettre à jour les options de qualité en fonction du format
    updateQualityOptions();
    
    // Définir le nom de fichier par défaut
    filenameInput.value = videoInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Mise à jour des options de qualité en fonction du format sélectionné
function updateQualityOptions() {
    const selectedFormat = formatSelect.value;
    const qualityOptions = {
        mp4: [
            { value: 'highest', label: '1080p (Haute définition)' },
            { value: 'high', label: '720p (HD)' },
            { value: 'medium', label: '480p (Qualité standard)' },
            { value: 'low', label: '360p (Basse qualité)' }
        ],
        mp3: [
            { value: 'highest', label: '320kbps (Haute qualité)' },
            { value: 'high', label: '256kbps (Bonne qualité)' },
            { value: 'medium', label: '192kbps (Qualité standard)' },
            { value: 'low', label: '128kbps (Basse qualité)' }
        ],
        webm: [
            { value: 'highest', label: '1080p (Haute définition)' },
            { value: 'high', label: '720p (HD)' },
            { value: 'medium', label: '480p (Qualité standard)' },
            { value: 'low', label: '360p (Basse qualité)' }
        ]
    };
    
    // Vider les options actuelles
    qualitySelect.innerHTML = '';
    
    // Ajouter les nouvelles options
    qualityOptions[selectedFormat].forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        qualitySelect.appendChild(optionElement);
    });
}

// Démarrage du téléchargement
async function startDownload() {
    try {
        const url = videoUrlInput.value.trim();
        const videoId = extractVideoId(url);
        const format = formatSelect.value;
        const quality = qualitySelect.value;
        const filename = filenameInput.value || `youtube_${videoId}`;
        const destinationFolder = destinationFolderInput.value || 'C:\\Téléchargements';
        
        if (!videoId) {
            showError('URL de vidéo invalide. Veuillez entrer une URL YouTube valide.');
            return;
        }
        
        // Vérifier que le nom de fichier est valide
        if (filename.trim() === '') {
            showError('Veuillez entrer un nom de fichier valide.');
            return;
        }
        
        // Vérifier que le dossier de destination est spécifié
        if (destinationFolder.trim() === '') {
            showError('Veuillez spécifier un dossier de destination.');
            return;
        }
        
        // Afficher la section de progression
        progressSection.style.display = 'block';
        downloadBtn.disabled = true;
        
        // Afficher le message de démarrage avec le dossier de destination
        showStatus(`Préparation du téléchargement vers ${destinationFolder}...`, 'warning');
        
        // Simuler le téléchargement
        await simulateDownload(videoId, format, quality, filename, destinationFolder);
    } catch (error) {
        console.error('Erreur lors du démarrage du téléchargement:', error);
        showError(`Erreur lors du démarrage du téléchargement: ${error.message}`);
        downloadBtn.disabled = false;
    }
}

// Vérifier et créer le dossier de destination s'il n'existe pas
function ensureDestinationFolderExists(destinationFolder) {
    showStatus(`Vérification du dossier de destination: ${destinationFolder}...`, 'info');
    
    // Dans un environnement web réel, nous ne pouvons pas accéder directement au système de fichiers
    // pour des raisons de sécurité. Nous allons donc simuler cette fonctionnalité.
    
    // Simuler une vérification du dossier
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simuler une probabilité aléatoire que le dossier existe déjà ou non
            const folderExists = Math.random() > 0.3; // 70% de chance que le dossier existe déjà
            
            if (folderExists) {
                showStatus(`Le dossier ${destinationFolder} existe déjà.`, 'success');
                resolve(true);
            } else {
                showStatus(`Création du dossier ${destinationFolder}...`, 'warning');
                
                // Simuler la création du dossier
                setTimeout(() => {
                    showStatus(`Dossier ${destinationFolder} créé avec succès.`, 'success');
                    resolve(true);
                }, 1000);
            }
        }, 500);
    });
}

// Simulation du téléchargement
async function simulateDownload(videoId, format, quality, filename, destinationFolder) {
    try {
        showStatus(`Préparation du téléchargement vers ${destinationFolder}...`, 'warning');
        
        // Vérifier la connexion internet
        if (!navigator.onLine) {
            throw new Error('Pas de connexion Internet. Veuillez vérifier votre connexion et réessayer.');
        }
        
        // S'assurer que le dossier de destination existe
        await ensureDestinationFolderExists(destinationFolder);
        
        // Vérifier si le fichier existe déjà (simulation)
        const fileExists = Math.random() > 0.9; // 10% de chance que le fichier existe déjà
        if (fileExists) {
            const overwrite = confirm(`Le fichier ${filename}.${format} existe déjà dans ${destinationFolder}. Voulez-vous le remplacer?`);
            if (!overwrite) {
                showStatus('Téléchargement annulé par l\'utilisateur', 'warning');
                downloadBtn.disabled = false;
                return;
            }
            showStatus('Le fichier existant sera remplacé', 'warning');
        }
        
        // Variables pour la simulation
        let progress = 0;
        const totalSize = Math.random() * 100 + 50; // Taille simulée en MB
        const downloadSpeed = Math.random() * 2 + 1; // Vitesse simulée en MB/s
        const updateInterval = 200; // Intervalle de mise à jour en ms
        const incrementPerUpdate = (downloadSpeed / totalSize) * 100 * (updateInterval / 1000);
        
        // Temps de démarrage
        const startTime = Date.now();
        
        // Simuler une erreur aléatoire pendant le téléchargement (5% de chance)
        const willFail = Math.random() > 0.95;
        let failAt = willFail ? Math.random() * 80 + 10 : 101; // Échouer entre 10% et 90% si willFail est vrai
        
        // Fonction de mise à jour de la progression
        const updateProgress = () => {
            progress += incrementPerUpdate;
            
            // Simuler une erreur aléatoire
            if (progress >= failAt && willFail) {
                clearInterval(progressInterval);
                throw new Error('Erreur réseau pendant le téléchargement. Veuillez réessayer.');
            }
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(progressInterval);
                downloadComplete(videoId, format, filename, destinationFolder);
            }
            
            // Mettre à jour l'interface
            downloadProgress.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
            
            // Calculer le temps restant
            const elapsedTime = (Date.now() - startTime) / 1000; // en secondes
            const estimatedTotalTime = elapsedTime / (progress / 100);
            const remainingTime = estimatedTotalTime - elapsedTime;
            
            // Formater le temps restant
            timeRemaining.textContent = `Estimation: ${formatTime(remainingTime)}`;
            
            // Mettre à jour le message de statut
            showStatus(`Téléchargement en cours: ${Math.round(progress)}%`, 'warning');
        };
        
        // Démarrer la mise à jour de la progression
        const progressInterval = setInterval(updateProgress, updateInterval);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        showError(`Erreur lors du téléchargement: ${error.message}`);
        downloadBtn.disabled = false;
        
        // Réinitialiser la barre de progression
        downloadProgress.style.width = '0%';
        progressPercentage.textContent = '0%';
        timeRemaining.textContent = 'Estimation: --:--';
    }
}

// Formatage du temps
function formatTime(seconds) {
    if (seconds < 0 || !isFinite(seconds)) {
        return '--:--';
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Téléchargement terminé
function downloadComplete(videoId, format, filename, destinationFolder) {
    showStatus(`Téléchargement terminé avec succès dans ${destinationFolder}!`, 'success');
    downloadBtn.disabled = false;
    
    // Dans une application réelle, ici vous proposeriez le fichier au téléchargement
    // Pour cette démo, nous simulons simplement la fin du téléchargement
    
    // Ajouter à l'historique des téléchargements
    addToDownloadHistory({
        id: videoId,
        title: document.querySelector('.video-info h3').textContent,
        format: format,
        filename: filename,
        path: `${destinationFolder}\\${filename}.${format}`,
        date: new Date().toLocaleString(),
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    });
    
    // Afficher une notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Téléchargement terminé', {
            body: `${filename}.${format} a été téléchargé avec succès dans ${destinationFolder}.`,
            icon: `https://img.youtube.com/vi/${videoId}/default.jpg`
        });
    }
}

// Affichage des messages de statut
function showStatus(message, type = '') {
    statusMessage.textContent = message;
    
    // Réinitialiser les classes
    statusMessage.className = 'status-message';
    
    // Ajouter la classe appropriée
    if (type) {
        statusMessage.classList.add(`status-${type}`);
    }
}

// Affichage des erreurs
function showError(message) {
    showStatus(message, 'error');
    console.error(message);
}

// Gestion de l'historique des téléchargements
function addToDownloadHistory(download) {
    // Récupérer l'historique existant
    let history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    
    // Ajouter le nouveau téléchargement au début
    history.unshift(download);
    
    // Limiter à 10 entrées
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    // Sauvegarder dans le stockage local
    localStorage.setItem('downloadHistory', JSON.stringify(history));
    
    // Mettre à jour l'affichage
    displayDownloadHistory(history);
}

// Chargement de l'historique des téléchargements
function loadDownloadHistory() {
    const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    displayDownloadHistory(history);
}

// Affichage de l'historique des téléchargements
function displayDownloadHistory(history) {
    if (history.length === 0) {
        downloadHistory.innerHTML = '<p class="empty-history">Aucun téléchargement récent</p>';
        return;
    }
    
    // Créer les éléments HTML pour chaque téléchargement
    const historyHTML = history.map(item => `
        <div class="history-item fade-in">
            <div class="history-thumbnail">
                <img src="${item.thumbnail}" alt="Miniature">
            </div>
            <div class="history-info">
                <div class="history-title">${item.title}</div>
                <div class="history-meta">
                    <span><i class="fas fa-file"></i> ${item.filename}.${item.format}</span>
                    <span><i class="fas fa-folder"></i> ${item.path}</span>
                    <span><i class="fas fa-calendar"></i> ${item.date}</span>
                </div>
                <div class="history-actions">
                    <button class="delete-btn" onclick="deleteDownload(this)" title="Supprimer de l'historique">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Ajouter un bouton pour effacer tout l'historique
    const clearButtonHTML = `
        <div class="clear-history-container">
            <button id="clear-history-btn" onclick="clearDownloadHistory()">
                <i class="fas fa-trash-alt"></i> Effacer tout l'historique
            </button>
        </div>
    `;
    
    downloadHistory.innerHTML = historyHTML + clearButtonHTML;
}

// Demander la permission pour les notifications
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission();
    }
}

// Demander la permission pour les notifications au chargement
requestNotificationPermission();

// Sauvegarder l'historique des téléchargements dans le stockage local
function saveDownloadHistory() {
    // Récupérer tous les éléments de l'historique
    const historyItems = downloadHistory.querySelectorAll('.history-item');
    const historyData = [];
    
    // Convertir les éléments en objets
    historyItems.forEach(item => {
        const thumbnail = item.querySelector('.history-thumbnail img').src;
        const title = item.querySelector('.history-title').textContent;
        const meta = item.querySelectorAll('.history-meta span');
        
        // Extraire les informations
        const filenameFormat = meta[0].textContent.replace(/[^a-zA-Z0-9_.]/g, '').split('.');
        const filename = filenameFormat[0];
        const format = filenameFormat[1];
        const path = meta[1].textContent.replace(/[^a-zA-Z0-9_.:]/g, '');
        const date = meta[2].textContent.replace(/[^a-zA-Z0-9_.:]/g, '');
        
        // Ajouter à l'historique
        historyData.push({
            title: title,
            filename: filename,
            format: format,
            path: path,
            date: date,
            thumbnail: thumbnail
        });
    });
    
    // Sauvegarder dans le stockage local
    localStorage.setItem('downloadHistory', JSON.stringify(historyData));
}

// Supprimer un téléchargement de l'historique
function deleteDownload(element) {
    // Récupérer l'élément parent (history-item)
    const historyItem = element.closest('.history-item');
    
    if (historyItem) {
        // Récupérer les informations du téléchargement pour le message
        const filename = historyItem.querySelector('.history-meta span:first-child').textContent;
        
        // Animer la suppression
        historyItem.style.transition = 'opacity 0.3s, transform 0.3s';
        historyItem.style.opacity = '0';
        historyItem.style.transform = 'translateX(30px)';
        
        // Supprimer l'élément après l'animation
        setTimeout(() => {
            historyItem.remove();
            
            // Mettre à jour le stockage local
            saveDownloadHistory();
            
            // Afficher un message de confirmation
            showStatus(`Téléchargement ${filename} supprimé de l'historique`, 'success');
        }, 300);
    }
}

// Supprimer tous les téléchargements de l'historique
function clearDownloadHistory() {
    // Vérifier s'il y a des téléchargements à supprimer
    const historyItems = downloadHistory.querySelectorAll('.history-item');
    if (historyItems.length === 0) {
        showStatus('L\'historique est déjà vide', 'info');
        return;
    }
    
    // Demander confirmation à l'utilisateur
    if (confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique des téléchargements ?')) {
        // Animer la suppression de tous les éléments
        historyItems.forEach((item, index) => {
            // Animer avec un délai progressif pour un effet cascade
            setTimeout(() => {
                item.style.transition = 'opacity 0.3s, transform 0.3s';
                item.style.opacity = '0';
                item.style.transform = 'translateX(30px)';
            }, index * 50);
        });
        
        // Supprimer tous les éléments après l'animation
        setTimeout(() => {
            // Vider l'historique
            downloadHistory.innerHTML = '<p class="empty-history">Aucun téléchargement récent</p>';
            
            // Mettre à jour le stockage local
            localStorage.removeItem('downloadHistory');
            
            // Afficher un message de confirmation
            showStatus('Historique des téléchargements effacé', 'success');
        }, historyItems.length * 50 + 300);
    }
}