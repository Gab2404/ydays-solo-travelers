const galleryService = require('../services/galleryService');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

// @desc    Récupérer toutes les photos d'un parcours complété
// @route   GET /api/gallery/path/:pathId
// @access  Private
const getPathGallery = async (req, res) => {
  try {
    const { pathId } = req.params;
    const userId = req.user.id;

    const gallery = await galleryService.getPathGallery(userId, pathId);
    res.status(200).json(gallery);

  } catch (err) {
    console.error('Erreur récupération galerie:', err);
    
    // Déterminer le code de statut approprié
    let statusCode = 500;
    if (err.message.includes('introuvable')) {
      statusCode = 404;
    } else if (err.message.includes('non complété')) {
      statusCode = 403;
    }
    
    res.status(statusCode).json({ message: err.message });
  }
};

// @desc    Télécharger un ZIP de toutes les photos d'un parcours
// @route   GET /api/gallery/path/:pathId/download
// @access  Private
const downloadPathGalleryZip = async (req, res) => {
  try {
    const { pathId } = req.params;
    const userId = req.user.id;

    // Récupérer les données nécessaires via le service
    const zipData = await galleryService.getZipData(userId, pathId);

    // Configurer les headers pour le téléchargement
    const zipFilename = `${zipData.pathTitle.replace(/[^a-z0-9]/gi, '_')}_photos.zip`;
    res.attachment(zipFilename);
    res.setHeader('Content-Type', 'application/zip');

    // Créer le flux ZIP
    const archive = archiver('zip', {
      zlib: { level: 6 } // Compression moyenne (balance vitesse/taille)
    });

    // Gérer les erreurs du stream
    archive.on('error', (err) => {
      console.error('Erreur archiver:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Erreur lors de la création du ZIP' });
      }
    });

    // Logger la progression
    archive.on('progress', (progress) => {
      console.log(`📦 ZIP Progress: ${progress.entries.processed}/${progress.entries.total}`);
    });

    // Pipe le ZIP vers la réponse
    archive.pipe(res);

    // Ajouter chaque photo au ZIP
    let photoIndex = 1;
    for (const cq of zipData.completedQuests) {
      try {
        // Construire le chemin du fichier
        const photoPath = path.join(__dirname, '..', cq.photoUrl);
        
        // Vérifier que le fichier existe
        if (fs.existsSync(photoPath)) {
          const ext = path.extname(cq.photoUrl);
          const questTitle = cq.questId.title
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 50); // Limiter la longueur du nom
          
          // Formater le nom avec padding (01_, 02_, etc.)
          const filename = `${String(photoIndex).padStart(2, '0')}_${questTitle}${ext}`;
          
          // Ajouter le fichier au ZIP
          archive.file(photoPath, { name: filename });
          photoIndex++;
        } else {
          console.warn(`⚠️ Photo introuvable: ${photoPath}`);
        }
      } catch (fileErr) {
        console.error('❌ Erreur ajout fichier:', fileErr);
        // Continuer avec les autres fichiers
      }
    }

    // Ajouter un fichier README.txt dans le ZIP
    const readmeContent = `
╔══════════════════════════════════════════════════════════╗
║            GALERIE TRAVEL QUEST                          ║
╚══════════════════════════════════════════════════════════╝

📍 Parcours : ${zipData.pathTitle}
🏙️  Ville    : ${zipData.pathCity}
📅 Date      : ${new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })}
📸 Photos    : ${photoIndex - 1}

─────────────────────────────────────────────────────────

🎉 Félicitations pour avoir complété ce parcours !

Tes photos sont numérotées dans l'ordre chronologique
de complétion des quêtes.

Merci d'utiliser Travel Quest ! ✨

─────────────────────────────────────────────────────────
    `.trim();

    archive.append(readmeContent, { name: 'README.txt' });

    // Finaliser le ZIP
    await archive.finalize();

    console.log(`✅ ZIP généré: ${zipFilename} (${photoIndex - 1} photos)`);

  } catch (err) {
    console.error('❌ Erreur téléchargement ZIP:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || 'Erreur lors du téléchargement' });
    }
  }
};

module.exports = {
  getPathGallery,
  downloadPathGalleryZip
};