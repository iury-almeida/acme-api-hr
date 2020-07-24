'use strict';

const staffController = require('./staffController');

module.exports = (app) => {
    app.post('/staff', staffController.create);
    app.put('/staff/:id', staffController.update);
    app.get('/staff', staffController.select);
    app.get('/staff/:id', staffController.selectById);
    app.delete('/staff/:id', staffController.remove);
    app.get('/ping', (req, res) => {
        res.send(new Date());
    });
}