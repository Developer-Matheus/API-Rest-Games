const { response } = require('express');
const express = require('express');
const models = require('./models/index');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/games", (req, res) => { //Read all
    try {
        const result = models.sequelize.transaction(transaction => {
            res.statusCode = 200;
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
                        res.statusCode = 200;
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

app.listen(4000, function () {
    console.log("API Work");
});