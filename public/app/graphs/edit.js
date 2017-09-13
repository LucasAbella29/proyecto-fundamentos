(function() {
    'use strict';

    var controllerName = 'editGraph';

    angular.module('app').controller(controllerName, ['$scope', 'dialogs', 'toastr', 'graphService', editGraph]);

    /**
     * Controlador de la pantalla de edicion de grafo.
     */
    function editGraph($scope, dialogs, logger, graphSrv) {

        /**
         * Obtiene un grafo en formato JSON y lo agrega como dato al network.
         */
        function getJson() {
            graphSrv.getJson().then(function(result) {
                $scope.networkData.nodes.add(result.nodes);
                $scope.networkData.edges.add(result.edges);
            });
        }

        getJson();
        logger.info('Activado', 'Editor');
        
        /**
         * Datos a mostrar del grafo.
         * @type {Object}
         */
        $scope.networkData = {
           nodes: new vis.DataSet(),
           edges: new vis.DataSet()
        };

        /**
         * Eventos declarados en vis js.
         * @type {Object}
         */
        $scope.networkEvents = {
            click: function(properties) {
                if (properties.nodes.length > 0) {
                    var node = $scope.networkData.nodes._data[properties.nodes[0]];
                    console.log('node: ', JSON.stringify(node));                    
                } else {
                    var edge = $scope.networkData.edges._data[properties.edges[0]];
                    console.log('edge: ', JSON.stringify(edge));   
                }
            },
            doubleClick: function(properties) {
                if (properties.nodes.length > 0) {
                    var node = $scope.networkData.nodes._data[properties.nodes[0]];
                    node.color = {background: '#32CD32'};
                    $scope.networkData.nodes.update(node);
                }
            }
        };

        /**
         * Opciones de visualizacion.
         * @type {Object}
         */
        $scope.networkOptions = {
            edges: {
                arrows: {
                    to: true,
                }
            },
            nodes: {
               physics: true,
               color: {
                   background: 'cyan'
               }
            },
            interaction: {
                navigationButtons: true,
                hoverConnectedEdges: false
            },
            manipulation: {
                addNode: function(node, callback) {
                    node.label = "";
                    showNodeModal(node, callback);
                },
                editNode: function(node, callback) {
                    showNodeModal(node, callback);                    
                },
                addEdge: function(edge, callback) {
                    showEdgeModal(edge, callback);
                },
                editEdge: {
                    editWithoutDrag: function(edge, callback) {
                        showEdgeModal(edge, callback);
                    }
                },
                deleteNode: function(node, callback) {
                    var dlg = dialogs.confirm('¿Está seguro de que desea eliminar el nodo?', 'Confirmación requerida', {size: 'md'});

                    dlg.result.then(function() {
                        logger.success('Eliminado');
                        callback(node);
                    }, function() {
                        callback(null);
                    });
                },
                deleteEdge: function(edge, callback) {
                    var dlg = dialogs.confirm('¿Está seguro de que desea eliminar la relación?', 'Confirmación requerida', {size: 'md'});
                    
                    dlg.result.then(function() {
                        logger.success('Eliminado');
                        callback(edge);
                    }, function() {
                        callback(null);
                    });
                }
            }
        };

        /**
         * Muestra el modal de edicion de nodo.
         * @param {Object} node nodo a editar
         * @param {Function} callback 
         */
        function showNodeModal(node, callback) {
            var dlg = dialogs.create('/app/dialogs/nodeDlg.html','nodeDlgCtrl', node, {size: 'md'});
            
            dlg.result.then(
                function(newNode) {
                    logger.success('Guardado');
                    callback(newNode);
                }, function() {
                    callback(null);
                }
            );
        }

        /**
         * Muestra el modal de edicion de relacion.
         * @param {Object} edge 
         * @param {Function} callback 
         */
        function showEdgeModal(edge, callback) {
            var inputs = getEdgeInputs();
            var data = {edge: edge, inputs: inputs};

            var dlg = dialogs.create('/app/dialogs/edgeDlg.html','edgeDlgCtrl', data, {size: 'md'});
            
            dlg.result.then(
                function(newEdge) {
                    newEdge.from = newEdge.from.id || newEdge.from;
                    newEdge.to = newEdge.to.id || newEdge.to;
                    logger.success('Guardado');                    
                    callback(newEdge);
                }, function() {
                    callback(null);
                }
            );
        }

        /**
         * Obtiene las entradas definidas en las relaciones.
         * @return {Array} todas las entradas posibles.
         */
        function getEdgeInputs() {
            var inputs = [];
            var edges = Object.values($scope.networkData.edges._data);
            
            for (var i = 0; i < edges.length; i++) {
                if ((inputs.indexOf(edges[i].label) < 0) && (edges[i].label != "")) {
                    inputs.push(edges[i].label);
                }
            }

            return inputs;
        }

    } // fin controlador.

})();
