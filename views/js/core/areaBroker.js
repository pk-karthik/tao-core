/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technlogies SA
 *
 */

/**
 * The area broker is a kind of areas hub, it gives the access to predefined areas.
 *
 *
 * @example
 * var broker = areaBroker(['content', 'panel'], $container);
 * broker.defineAreas({
 *    content : $('.content', $container),
 *    //...
 * });
 *
 * //then
 * var $content = broker.getArea('content');
 * var $content = broker.getContentArea();
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash'
], function ($, _) {
    'use strict';

    /**
     * Creates a new area broker.
     * @param {String[]} requireAreas - the list of required areas to map
     * @param {jQueryElement|HTMLElement|String} $container - the main container
     * @param {Object} mapping - keys are the area names, values are jQueryElement
     * @returns {broker} the broker
     * @throws {TypeError} without a valid container
     */
    return function areaBroker(requiredAreas, $container, mapping){

        var broker,
            areas;

        if(typeof $container === 'string' || $container instanceof HTMLElement){
            $container = $($container);
        }
        if(!$container || !$container.length){
            throw new TypeError('Please provide the areaBroker a container');
        }

        requiredAreas = requiredAreas || [];

        /**
         * The Area broker instance
         * @typedef broker
         */
        broker = {

            /**
             * Map the areas to elements.
             *
             * This method needs to be called before getting areas.
             * It's separated from the factory call in order to prepare the mapping in a separated step.
             *
             * @param {Object} mapping - keys are the area names, values are jQueryElement
             * @throws {TypeError} if the required areas are not part of the mapping
             */
            defineAreas : function defineAreas(mapping){
                var keys, required;

                if(!_.isPlainObject(mapping)){
                    throw new TypeError('A mapping has the form of a plain object');
                }

                keys = _.keys(mapping);
                required = _.all(requiredAreas, function(val){
                    return _.contains(keys, val);
                });
                if(!required){
                    throw new TypeError('You have to define a mapping for at least : ' + requiredAreas.join(', '));
                }

                areas = mapping;
            },

            /**
             * Get the main container
             * @returns {jQueryElement} the container
             */
            getContainer : function getContainer(){
                return $container;
            },

            /**
             * Get the area element
             * @param {String} name - the area name
             * @returns {jQueryElement} the area element
             * @throws {Error} if the mapping hasn't been made previously
             */
            getArea : function getArea(name){
                if(!areas){
                    throw new Error('Sorry areas have not been defined yet!');
                }
                return areas[name];
            }
        };

        broker.defineAreas(mapping);

        _.forEach(requiredAreas, function(area){
            broker['get' + area[0].toUpperCase() + area.slice(1) + 'Area'] = _.bind(_.partial(broker.getArea, area), broker);
        });

        return broker;
    };

});
