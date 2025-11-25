const router = require('express').Router();
// Ici tu mettras ta logique de login/register (bcrypt, jwt)
// Pour l'instant on fait un mock pour que ça marche

router.post('/login', (req, res) => {
    // Simulation d'un user connecté
    res.json({
        id: "123",
        username: "ThomasDev",
        email: req.body.email,
        token: "fake-jwt-token-xyz"
    });
});

module.exports = router;