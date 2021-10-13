require('dotenv').config();
const { response } = require('express');
const express = require('express');
const models = require('./models/index');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTSecret = process.env.JWT_SECRET_KEY;
const uri = process.env.APP_URL
const port = process.env.PORT

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('port', process.env.APP_PORT);

function auth(req, res, next) {//Middleware
    const authToken = req.headers['authorization'];

    if (authToken != undefined) {
        const splitToken = authToken.split(' ');
        var token = splitToken[1];
        jwt.verify(token, JWTSecret, (err, data) => {

            if (err) {
                res.status(401);
                res.json({ err: "Token inválido!" });
            } else {
                req.token = token;
                req.authUser = { id: data.id, email: data.email };
                next();
            }
        });

    } else {
        res.status(401);
        res.json({ err: "Token inválido!" });
    }

}

function links(id = 1) {//HATEOAS Links
    var links = [
        {
            href: uri + "game",
            method: "POST",
            rel: "create_game"
        },
        {
            href: uri + "games",
            method: "GET",
            rel: "get_all_games"
        },
        {
            href: uri + "game/" + id,
            method: "GET",
            rel: "get_game"
        },
        {
            href: uri + "game/" + id,
            method: "PUT",
            rel: "edit_game"
        },
        {
            href: uri + "game/" + id,
            method: "DELETE",
            rel: "delete_game"
        },
        {
            href: uri + "auth",
            method: "POST",
            rel: "login"
        },
    ];

    return links
}

app.post('/game', auth, (req, res) => { //Create
    var { title, price, year } = req.body
    try {
        const result = models.sequelize.transaction(transaction => {
            models.game.create({
                title,
                price,
                year
            }).then((game) => {
                res.status(200);
                res.json({ game: game, _links: links(game.id) });
            });
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.get("/games", auth, (req, res) => { //Read all

    try {
        const result = models.sequelize.transaction(transaction => {
            res.status(200);
            models.game.findAll().then((games) => {
                res.status(200);
                res.json({ games: games, _links: links() });
            }).catch((errors) => {
                res.sendStatus(404).json(errors);
            });
        });
    } catch (err) {
        res.sendStatus(404).json(err);
    }
});

app.get("/game/:id", auth, (req, res) => { //Read unic
    try {
        const result = models.sequelize.transaction(transaction => {
            if (isNaN(req.params.id)) {
                res.sendStatus(400);
            } else {
                var id = parseInt(req.params.id);
                models.game.findByPk(id).then((game) => {
                    if (game !== null) {
                        res.status(200);
                        res.json({ game: game, _links: links(id) });
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

app.put('/game/:id', auth, (req, res) => {//Update
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
                        res.status(200);
                        res.json({ game: game, _links: links(id) });
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

app.delete('/game/:id', auth, (req, res) => { //Delete
    try {
        const result = models.sequelize.transaction(transaction => {
            if (isNaN(req.params.id)) {
                res.sendStatus(400);
            } else {
                var id = parseInt(req.params.id);

                models.game.findByPk(id).then((game) => {
                    if (game !== null) {
                        game.destroy();
                        res.status(200);
                        res.json({ deleted_id: id, _links: links(id) });
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
                        res.json({ token: token, _links: links() });
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

app.listen(app.get('port'), function () {//Start server
    console.log("API Work");
});

