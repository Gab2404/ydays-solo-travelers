const Path = require('../models/Path');
const Quest = require('../models/Quest');
const { validatePathData } = require('../utils/validation');

// @desc    Récupérer tous les parcours (avec filtre optionnel par ville)
// @route   GET /api/paths?city=Bordeaux
// @access  Public
const getAllPaths = async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = {};
    if (city) {
      query.city = new RegExp(city, 'i'); // Recherche insensible à la casse
    }

    const paths = await Path.find(query).populate('quests').sort({ createdAt: -1 });
    res.status(200).json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des parcours' });
  }
};

// @desc    Récupérer un parcours par ID
// @route   GET /api/paths/:id
// @access  Public
const getPathById = async (req, res) => {
  try {
    const path = await Path.findById(req.params.id).populate('quests');
    
    if (!path) {
      return res.status(404).json({ message: 'Parcours introuvable' });
    }

    res.status(200).json(path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération du parcours' });
  }
};

// @desc    Récupérer les parcours par ville
// @route   GET /api/paths/city/:city
// @access  Public
const getPathsByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const paths = await Path.find({ 
      city: new RegExp(city, 'i') 
    }).populate('quests').sort({ createdAt: -1 });

    res.status(200).json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des parcours' });
  }
};

// @desc    Créer un parcours
// @route   POST /api/paths
// @access  Private (Admin)
const createPath = async (req, res) => {
  try {
    const { title, city, difficulty, description } = req.body;

    // Validation
    const validation = validatePathData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    const newPath = new Path({
      title,
      city,
      difficulty: difficulty || 'Mixte',
      description,
      createdBy: req.user._id
    });

    const savedPath = await newPath.save();
    res.status(201).json(savedPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du parcours' });
  }
};

// @desc    Modifier un parcours
// @route   PUT /api/paths/:id
// @access  Private (Admin)
const updatePath = async (req, res) => {
  try {
    const { title, city, difficulty, description } = req.body;

    const path = await Path.findById(req.params.id);
    
    if (!path) {
      return res.status(404).json({ message: 'Parcours introuvable' });
    }

    // Validation
    const validation = validatePathData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }

    path.title = title || path.title;
    path.city = city || path.city;
    path.difficulty = difficulty || path.difficulty;
    path.description = description || path.description;

    const updatedPath = await path.save();
    res.status(200).json(updatedPath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification du parcours' });
  }
};

// @desc    Supprimer un parcours et toutes ses quêtes
// @route   DELETE /api/paths/:id
// @access  Private (Admin)
const deletePath = async (req, res) => {
  try {
    const path = await Path.findById(req.params.id);
    
    if (!path) {
      return res.status(404).json({ message: 'Parcours introuvable' });
    }

    // Supprimer toutes les quêtes associées
    await Quest.deleteMany({ _id: { $in: path.quests } });

    // Supprimer le parcours
    await Path.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Parcours et ses quêtes supprimés avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression du parcours' });
  }
};

module.exports = {
  getAllPaths,
  getPathById,
  getPathsByCity,
  createPath,
  updatePath,
  deletePath
};