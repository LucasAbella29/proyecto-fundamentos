/**
 * Modulo de rutas para la api Rest del sistema.
 */
var draft = require('../json/draft.json');
var machineCtrl = require('../controllers/machineController');

var express = require('express');
var router = express.Router();

/**
 * Informacion del estado del servidor, util como ruta de testeo.
 */
router.get('/info', function(req, res) {
    var info = {version: "1.5", fecha: "septiembre 2017"};
    defaultCallback(res, null, info);    
});

/**
 * Retorna un automata de prueba en formato Json.
 */
router.get('/api/json/draft', function(req, res) {
    defaultCallback(res, null, draft);    
});

/**
 * Retorna todos los automatas registrados en la base de datos.
 */
router.get('/api/machines', function(req, res) {
    machineCtrl.findAll(function(error, all) {
        defaultCallback(res, error, all);
    });
});

/**
 * Retorna un automata buscado por su ID.
 */
router.get('/api/machines/:id', function(req, res) {
    var id = req.params.id;

    machineCtrl.findById(id, function(error, result) {
        defaultCallback(res, error, result);        
    });
});

/**
 * Funcion de callback por defecto, esto evita repetir codigo
 * en todas las rutas declaradas previamente.
 */
function defaultCallback(res, error, result) {
    if (error)
        return res.status(404).send({error: error});
    
    return res.status(200).send({response: result});
}

module.exports = router;
