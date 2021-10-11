const { response } = require('express');
const express = require('express');
const models = require('./models/index');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTSecret = "?#;Dn=:N-ZLa2INf[@bK3RQjt!iy9f|!9U1D+erUG6LwLmK+wN~L{Ecs>,f4TJA";

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/games", (req, res) => { //Read all
    try {
        const result = models.sequelize.transaction(transaction => {
            res.status(200);
            models.game.findAll().then((games) => {
                res.json(games);
            }).catch((errors) => {
                res.sendStatus(404).json(errors);
            });
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.get("/game/:id", (req, res) => { //Read unic
    try {
        const result = models.sequelize.transaction(transaction => {
            if (isNaN(req.params.id)) {
                res.sendStatus(400);
            } else {
                var id = parseInt(req.params.id);
                models.game.findByPk(id).then((game) => {
                    if (game !== null) {
                        res.status(200);
                        res.json(game);
                    } else {
                        res.sendStatus(404);
                    }
                }).catch((errors) => {
                    res.sendStatus(404).json(errors);
                });
            }
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }

});

app.post('/game', (req, res) => { //Create
    var { title, price, year } = req.body
    try {
        const result = models.sequelize.transaction(transaction => {
            models.game.create({
                title,
                price,
                year
            });
        });
        res.sendStatus(200);
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.delete('/game/:id', (req, res) => { //Delete
    try {
        const result = models.sequelize.transaction(transaction => {
            if (isNaN(req.params.id)) {
                res.sendStatus(400);
            } else {
                var id = parseInt(req.params.id);

                models.game.findByPk(id).then((game) => {
                    if (game !== null) {
                        game.destroy();
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(404);
                    }
                }).catch((errors) => {
                    res.sendStatus(404).json(errors);
                });
            }
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.put('/game/:id', (req, res) => {//Edit
    try {
        const result = models.sequelize.transaction(transaction => {
            if (isNaN(req.params.id)) {
                res.sendStatus(400);
            } else {
                var id = parseInt(req.params.id);
                var game = models.game.findByPk(id);

                models.game.findByPk(id).then((game) => {
                    if (game !== null) {
                        var { title, price, year } = req.body
                        if (title != undefined) {
                            game.update({
                                title
                            });
                        }
                        if (price != undefined) {
                            game.update({
                                price
                            });
                        }
                        if (year != undefined) {
                            game.update({
                                year
                            });
                        }
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(404);
                    }
                }).catch((errors) => {
                    res.sendStatus(404).json(errors);
                });
            }
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.post('/auth', (req, res) => { //Auth and generate JWT
    var { email, password } = req.body;
    if (email != undefined) {
        models.user.findOne({ where: { email: email } }).then((user) => {
            const auth = bcrypt.compareSync(password, user.password);
            if (auth) {
                jwt.sign({ id: user.id, email: user.email }, JWTSecret, { expiresIn: '1h' }, (err, token) => {
                    if (err) {
                        res.status(400);
                        res.json({ err: "Falha interna." });
                    } else {
                        res.status(200);
                        res.json({ token: token });
                    }
                });
            } else {
                res.status(401);
                res.json({ err: "Credenciais inválidas!" });
            }
        }).catch((errors) => {
            res.status(400);
            res.json({ err: "E-mail não localizado." });
        });
    } else {
        res.status(400);
        res.json({ err: "E-mail inválido." });
    }
});

app.listen(4000, function () {//Start server
    console.log("API Work");
});