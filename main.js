mainMap();
buttonEvents();

function mainMap() {
    var format = 'image/png';
    var huyen = [];
    var bounds = [109.4080660949702, 12.37178195598381,
        109.73938600697923, 12.62397399460134
    ];

    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    var openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'OSMStandard',
        maxZoom: 15
    })

    var projection = new ol.proj.Projection({
        code: 'EPSG:4326',
        units: 'degrees',
        axisOrientation: 'neu',
    });

    /**
     * Create an overlay to anchor the popup to the map.
     */
    var overlay = new ol.Overlay( /** @type {olx.OverlayOptions} */ ({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));
    /**
     * Add a click handler to hide the popup.
     * @return {boolean} Don't follow the href.
     */
    closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    // Measure tools
    const raster = new ol.layer.Tile({
        source: new ol.source.OSM(),
    });
    const sourceMeasure = new ol.source.Vector();

    const vectorMeasure = new ol.layer.Vector({
        source: sourceMeasure,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33',
                }),
            }),
        }),
    });

    // Mouse Position
    const mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
    });

    //Measure Tools

    // Full Screen
    var fullScreen = new ol.control.FullScreen();

    var hanhChinh = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/WebGIS_NhaTrang/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                STYLES: '',
                LAYERS: 'WebGIS_NhaTrang:hanh_chinh_nha_trang',
            },
        })
    });

    //OverViewMap
    const overviewMapControl = new ol.control.OverviewMap({
        layers: [
            new ol.layer.Tile({
                source: openStreetMapStandard.getSource(),
            }),
        ],
    });

    var map = new ol.Map({
        controls: ol.control.defaults().extend([fullScreen, mousePositionControl, overviewMapControl]),
        target: 'map',
        layers: [
            openStreetMapStandard, raster, vectorMeasure, hanhChinh
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([109.196749, 12.238791]),
            zoom: 10,
            // maxZoom: 20,
            //minZoom: 1,
            //rotation: 0.8,
            // projection: projection
        }),
        overlays: [overlay]
    });


    // addInteraction();


    // Hightlight map when click style
    var styles = {
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 1
            })
        })
    };

    var styleFunction = function(feature) {
        return styles[feature.getGeometry().getType()];
    };

    var vectorLayer = new ol.layer.Vector({
        //source: vectorSource,
        style: styleFunction
    });
    map.addLayer(vectorLayer);

    // Tạo zoom slider mới
    var zoomSlider = new ol.control.ZoomSlider();
    map.addControl(zoomSlider);

    // map.getView().fit(bounds, map.sgetSize());
    var view = map.getView();
    var viewResolution = view.getResolution();
    var source = hanhChinh.getSource();

    /*map.on('singleclick', function(evt) {
        var url = source.getFeatureInfoUrl(
            evt.coordinate, viewResolution, view.getProjection(), {
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 50
            });
        if (url) {
            $.ajax({
                type: "GET",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function(data, status) {
                    var content = "<table>";
                    for (var i = 0; i < data.features.length; i++) {
                        var feature = data.features[i];
                        var featureAttr = feature.properties;
                        content = "Xã " + featureAttr["NAME_3"]

                    }
                    content += "</table>";
                    $("#popup-content").html(content);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(data)
                    });

                    vectorLayer.setSource(vectorSource);
                }
            });
        }
    });*/

    $("#hanhChinhCb").change(function() {
        if ($("#hanhChinhCb").is(":checked")) {

            hanhChinh.setVisible(true);
        } else {
            hanhChinh.setVisible(false);
        }
    });


    // OPACITY
    const opacityInput = document.getElementById('opacity-input');
    const opacityOutput = document.getElementById('opacity-output');

    function update() {
        const opacity = parseFloat(opacityInput.value);
        hanhChinh.setOpacity(opacity);
        opacityOutput.innerText = Math.floor(opacity * 100) +
            "%";
    }
    opacityInput.addEventListener('input', update);
    opacityInput.addEventListener('change', update);
    update();

    //BUTTON BAR-------------------------------------------------------------------------
    $('#zoom-in-button').click(function() {
        map.getView().setZoom(map.getView().getZoom() + 1);
    });
    $('#zoom-out-button').click(function() {
        map.getView().setZoom(map.getView().getZoom() - 1);
    });
    $('#hand-button').click(function() {
        $('#draw-line-button').unbind();
    })

    // $('#draw-line-button').off('click');

    $('#draw-line-button').on('click', function() {
        let sketch;
        let helpTooltipElement;
        let helpTooltip;
        let measureTooltipElement;
        let measureTooltip;
        const continuePolygonMsg = 'Click to continue drawing the polygon';
        const continueLineMsg = 'Click to continue drawing the line';
        const pointerMoveHandler = function(evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            let helpMsg = 'Click to start drawing';

            if (sketch) {
                const geom = sketch.getGeometry();
                if (geom instanceof ol.geom.Polygon) {
                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = continueLineMsg;
                }
            }
            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);
            helpTooltipElement.classList.remove('hidden');
        };

        // Measure Tools
        map.on('pointermove', pointerMoveHandler);
        map.getViewport().addEventListener('mouseout', function() {
            helpTooltipElement.classList.add('hidden');
        });

        const typeSelect = document.getElementById('type');

        let draw; // global so we can remove it later

        /**
         * Format length output.
         * @param {LineString} line The line.
         * @return {string} The formatted length.
         */
        const formatLength = function(line) {
            const length = ol.sphere.getLength(line);
            let output;
            if (length > 100) {
                output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
            } else {
                output = Math.round(length * 100) / 100 + ' ' + 'm';
            }
            return output;
        };

        const formatArea = function(polygon) {
            const area = ol.sphere.getArea(polygon);
            let output;
            if (area > 10000) {
                output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
            } else {
                output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
            }
            return output;
        };

        function addInteraction() {
            // const type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
            var type;
            if (typeSelect.value == 'area') {
                type = 'Polygon';
            } else if (typeSelect.value == 'length') {
                type = 'LineString';
            } else if (typeSelect.value == 'none') {

            }

            draw = new ol.interaction.Draw({
                source: source,
                type: type,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)',
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.5)',
                        lineDash: [10, 10],
                        width: 2,
                    }),
                    image: new ol.style.Circle({
                        radius: 5,
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 0, 0.7)',
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 255, 255, 0.2)',
                        }),
                    }),
                }),
            });
            map.addInteraction(draw);

            createMeasureTooltip();
            createHelpTooltip();

            let listener;
            draw.on('drawstart', function(evt) {
                // set sketch
                sketch = evt.feature;

                /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
                let tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function(evt) {
                    const geom = evt.target;
                    let output;
                    if (geom instanceof ol.geom.Polygon) {
                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    } else if (geom instanceof ol.geom.LineString) {
                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            });

            draw.on('drawend', function() {
                measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                ol.Observable.unByKey(listener);
            });
        }

        function createHelpTooltip() {
            if (helpTooltipElement) {
                helpTooltipElement.parentNode.removeChild(helpTooltipElement);
            }
            helpTooltipElement = document.createElement('div');
            helpTooltipElement.className = 'ol-tooltip hidden';
            helpTooltip = new ol.Overlay({
                element: helpTooltipElement,
                offset: [15, 0],
                positioning: 'center-left',
            });
            map.addOverlay(helpTooltip);
        }

        function createMeasureTooltip() {
            if (measureTooltipElement) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
            }
            measureTooltipElement = document.createElement('div');
            measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
            measureTooltip = new ol.Overlay({
                element: measureTooltipElement,
                offset: [0, -15],
                positioning: 'bottom-center',
                stopEvent: false,
                insertFirst: false,
            });
            map.addOverlay(measureTooltip);
        }

        /**
         * Let user change the geometry type.
         */
        typeSelect.onchange = function() {
            map.removeInteraction(draw);
            addInteraction();
        };

        addInteraction();
    });
}


//-------------------------------------------------------------------------
function buttonEvents() {
    const mapButton = document.getElementById("map-button");
    const mapMenu = document.getElementById("map-menu");
    mapButton.addEventListener('click', () => {
        mapMenu.classList.toggle("active");
    })

    const search = document.querySelector('.search-button');
    const searchBt = document.querySelector('#search-button');
    const inputSearch = document.querySelector('#input');

    searchBt.addEventListener('click', () => {
        search.classList.toggle('active');
        inputSearch.focus();
    })
}

//-------------------------------------------------------------------------
jQuery(document).ready(function($) {
    $(".left .plus").click(function() {
        // $(this).next().toggle();
        $(this).next().toggleClass("plus-content--active");
        $(this).toggleClass("plus--active");
    });



});