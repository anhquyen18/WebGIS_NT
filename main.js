import * as mapModules from "./modules.js";

pageEffects();

//-------------------------------------------------------------------------
function pageEffects() {
    const mapButton = document.getElementById("map-button");
    const mapMenu = document.getElementById("map-menu");
    mapButton.addEventListener('click', () => {
        mapMenu.classList.toggle("active");
    });

    const search = document.querySelector('.search-button');
    const searchBt = document.querySelector('#search-button');
    const searchInput = document.querySelector('#search-input');
    const searchResult = document.querySelector('.address');

    searchBt.addEventListener('click', () => {
        search.classList.toggle('active');
        searchResult.classList.remove('active');
    });
    searchInput.addEventListener('focus', () => {
        searchResult.classList.add('active');
    });

}

function HanhChinhLabel(name, parrent, pos_x, pos_y) {
    this.name = name;
    this.parrent = parrent;
    this.pos_x = pos_x;
    this.pos_y = pos_y;
}


//-------------------------------------------------------------------------
jQuery(document).ready(function($) {

    (async() => {
        var hanhChinhData = [];
        var huyenData = [];


        await fetch("./map_data_epsg3857.json")
            .then(function(resp) {
                return resp.json();
            }).then(function(data) {
                hanhChinhData = data.rows;
            });

        hanhChinhData.sort(function(a, b) {
            return a.type_3.localeCompare(b.type_3);
        });


        for (let i = 0; i < hanhChinhData.length; i++) {
            huyenData.push({ name: hanhChinhData[i].name_2, prefix: `${mapModules.getParentPrefix(hanhChinhData[i].name_2)}` });
        }

        huyenData = mapModules.getDistinct(huyenData);

        huyenData.sort(function(a, b) {
            return b.prefix.localeCompare(a.prefix);
        });

        $('.left').html = '';
        const hanhChinh = document.createElement('div');
        const satLoDat = document.createElement('div');
        const firstContentHC = document.createElement('div');
        const firstContentSLD = document.createElement('div');

        var secondBarContentDiv = [];
        for (let i = 0; i < huyenData.length; i++) {
            secondBarContentDiv.push({ div: document.createElement('div'), name: huyenData[i].name });
            secondBarContentDiv[i].div.classList.add('second-bar-content');
        }

        hanhChinh.classList.add('first-bar', 'first-bar--active');
        satLoDat.classList.add('first-bar');
        firstContentHC.classList.add('first-bar-content', 'first-bar-content--active');
        firstContentSLD.classList.add('first-bar-content');

        hanhChinh.innerHTML = `
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Ranh giới hành chính</p>
    `;
        satLoDat.innerHTML = `
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Sạt lở đất</p>
    `;
        for (let i = 0; i < 6; i++) {
            firstContentSLD.innerHTML += `
<div class="second-bar">
<i class="fa-regular fa-square-plus"></i>
<i class="fa-regular fa-square-minus"></i>
<p class="plus-heading">Kịch bản ${i}</p>
</div>`;
        };

        for (let i = 0; i < huyenData.length; i++) {
            firstContentHC.innerHTML += `
                <div class="second-bar">
                <i class="fa-regular fa-square-plus"></i>
                <i class="fa-regular fa-square-minus"></i>
                <p class="plus-heading">${huyenData[i].prefix} ${huyenData[i].name}</p>
            </div>`;
        };

        for (let i = 0; i < hanhChinhData.length; i++) {
            for (let j = 0; j < secondBarContentDiv.length; j++) {
                if (hanhChinhData[i].name_2 === secondBarContentDiv[j].name) {
                    secondBarContentDiv[j].div.innerHTML += `<div class="second-content-item">${hanhChinhData[i].type_3} ${hanhChinhData[i].name}</div>`;
                }
            }
        }

        $('.left').append(hanhChinh);
        $('.left').append(firstContentHC);
        $('.left').append(satLoDat);

        $(".first-bar:nth(1)").after(firstContentSLD);
        for (let i = 0; i < secondBarContentDiv.length; i++) {
            $('.plus-heading').each(function() {
                if ($(this).text().endsWith(secondBarContentDiv[i].name)) {
                    $(this).parent().after(secondBarContentDiv[i].div);
                }
            });
        }

        $(".left .first-bar").click(function() {
            $(this).next().toggleClass("first-bar-content--active");
            $(this).toggleClass("first-bar--active");
        });
        $(".left .first-bar-content .second-bar").click(function() {
            $(this).next().toggleClass("second-bar-content--active");
            $(this).toggleClass("second-bar--active");
        });










        //MAP ---------------------------------------------------------------------------------------------------------------
        // ------------------------------------------------------------------------------------------------------------------
        var format = 'image/png';
        var bounds = [12097013.272963697, 1319442.5689750076,
            12186052.219326938, 1444732.2450413236
        ];

        // POPUP
        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');
        // MEASURE TOOLS
        const typeSelect = document.getElementById('type');
        const showSegments = document.getElementById('segments');
        const clearPrevious = document.getElementById('clear');
        // DRAW TOOL
        const drawTypeSelect = document.getElementById('draw-type');

        var openStreetMapStandard = new ol.layer.Tile({
            source: new ol.source.OSM(),
            visible: true,
            title: 'OSMStandard'
        });

        var projection = new ol.proj.Projection({
            // code: 'EPSG:4326',
            code: 'EPSG:3857',
            // units: 'degrees',
            units: 'm',
            axisOrientation: 'neu',
        });

        /**
         * Create an overlay to anchor the popup to the map.
         */
        var overlayPopup = new ol.Overlay( /** @type {olx.OverlayOptions} */ ({
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
            overlayPopup.setPosition(undefined);
            closer.blur();
            return false;
        };

        // MEASURE TOOLS STYLE
        const measureStyle = new ol.style.Style({
            // Đa giác lúc đo vùng
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            // Đường thẳng
            stroke: new ol.style.Stroke({
                color: 'rgba(38, 111, 247, 0.8)',
                lineDash: [10, 10],
                width: 2,
            }),
            // Đường tròn con trỏ chuột lúc đo
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(38, 111, 247, 0.5)',
                }),
            }),
        });

        const measureLabelStyle = new ol.style.Style({
            // Màu chữ km tổng
            text: new ol.style.Text({
                font: '14px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1)',
                }),
                backgroundFill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                padding: [3, 3, 3, 3],
                textBaseline: 'bottom',
                offsetY: -15,
            }),
            // Tam giác cuối line
            image: new ol.style.RegularShape({
                radius: 8,
                points: 3,
                angle: Math.PI,
                displacement: [0, 10],
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.7)',
                    // color: 'rgba(212, 2, 2, 0.7)'
                }),
            }),
        });

        const measureTipStyle = new ol.style.Style({
            // Nhấn chuột trái để bắt đầu vẽ
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1)',
                }),
                backgroundFill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.4)',
                }),
                padding: [2, 2, 2, 2],
                textAlign: 'left',
                offsetX: 15,
            }),
        });

        const measureModifyStyle = new ol.style.Style({
            // Kéo để tùy chỉnh
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.4)',
                    color: 'rgba(38, 111, 247, 0.8)',

                }),
            }),
            text: new ol.style.Text({
                text: 'Kéo để tùy chỉnh',
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1)',
                }),
                backgroundFill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.7)',
                }),
                padding: [2, 2, 2, 2],
                textAlign: 'left',
                offsetX: 15,
            }),
        });

        const measureSegmentStyle = new ol.style.Style({
            // Số km mỗi đoạn nhỏ
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 1)',
                }),
                backgroundFill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.4)',
                }),
                padding: [2, 2, 2, 2],
                textBaseline: 'bottom',
                offsetY: -12
            }),
            // Tam giác trỏ xuống mỗi line nhỏ
            image: new ol.style.RegularShape({
                radius: 6,
                points: 3,
                angle: Math.PI,
                displacement: [0, 8],
                fill: new ol.style.Fill({
                    color: 'rgba(0, 0, 0, 0.4)',
                }),
            }),
        });

        const measureSegmentStyles = [measureSegmentStyle];

        const measureFormatLength = function(line) {
            const length = ol.sphere.getLength(line);
            let output;
            if (length > 100) {
                output = Math.round((length / 1000) * 100) / 100 + ' km';
            } else {
                output = Math.round(length * 100) / 100 + ' m';
            }
            return output;
        };
        const measureFormatArea = function(polygon) {
            const area = ol.sphere.getArea(polygon);
            let output;
            if (area > 10000) {
                output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
            } else {
                output = Math.round(area * 100) / 100 + ' m\xB2';
            }
            return output;
        };

        const measureSource = new ol.source.Vector();

        const measureModify = new ol.interaction.Modify({ source: measureSource, style: measureModifyStyle });
        let tipPoint;

        function measureStyleFunction(feature, segments, drawType, tip) {
            const styles = [measureStyle];
            const geometry = feature.getGeometry();
            const type = geometry.getType();
            let point, label, line;
            if (!drawType || drawType === type) {
                if (type === 'Polygon') {
                    point = geometry.getInteriorPoint();
                    label = measureFormatArea(geometry);
                    line = new ol.geom.LineString(geometry.getCoordinates()[0]);
                } else if (type === 'LineString') {
                    point = new ol.geom.Point(geometry.getLastCoordinate());
                    label = measureFormatLength(geometry);
                    line = geometry;
                }
            }
            if (segments && line) {
                let count = 0;
                line.forEachSegment(function(a, b) {
                    const segment = new ol.geom.LineString([a, b]);
                    const label = measureFormatLength(segment);
                    if (measureSegmentStyles.length - 1 < count) {
                        measureSegmentStyles.push(measureSegmentStyle.clone());
                    }
                    const segmentPoint = new ol.geom.Point(segment.getCoordinateAt(0.5));
                    measureSegmentStyles[count].setGeometry(segmentPoint);
                    measureSegmentStyles[count].getText().setText(label);
                    styles.push(measureSegmentStyles[count]);
                    count++;
                });
            }
            if (label) {
                measureLabelStyle.setGeometry(point);
                measureLabelStyle.getText().setText(label);
                styles.push(measureLabelStyle);
            }
            if (
                tip &&
                type === 'Point' &&
                !measureModify.getOverlay().getSource().getFeatures().length
            ) {
                tipPoint = geometry;
                measureTipStyle.getText().setText(tip);
                styles.push(measureTipStyle);
            }
            return styles;
        }

        const measureVector = new ol.layer.Vector({
            source: measureSource,
            style: function(feature) {
                return measureStyleFunction(feature, showSegments.checked);
            },
        });

        // Export Map
        const exportFormat = new ol.format.WKT();
        const exportFeature = exportFormat.readFeature(
            'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
            '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
            '-39.1552734375, 10.689697265625 -25.0927734375))'
        );
        const exportVector = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [exportFeature],
            }),
            opacity: 0,
        });

        // Mouse Position
        const mousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            // projection: 'EPSG:4326',
            projection: 'EPSG:3857',
            // projection: 'EPSG:32648',
            // comment the following two lines to have the mouse position
            // be placed within the map.
            className: 'custom-mouse-position',
            target: document.getElementById('mouse-position'),
        });

        const pageSize = {
            a0: [1189, 841],
            a1: [841, 594],
            a2: [594, 420],
            a3: [420, 297],
            a4: [297, 210],
            a5: [210, 148],
        };


        // Map Scale Bar
        const scaleControl = new ol.control.ScaleLine({
            units: 'metric',
            bar: true,
            steps: 4,
            text: true,
            minWidth: 100,
            target: document.getElementById('scale-line'),
        });

        // Full Screen
        var fullScreen = new ol.control.FullScreen();

        var hanhChinhMap = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                ratio: 1,
                url: 'http://localhost:8080/geoserver/WebGIS_NhaTrang/wms',
                params: {
                    'FORMAT': format,
                    'VERSION': '1.1.1',
                    STYLES: 'WebGIS_NhaTrang:style_hanhChinhNhaTrang',
                    LAYERS: 'WebGIS_NhaTrang:hanh_chinh_nha_trang_EPSG3857',
                },
                crossOrigin: "Anonymous",
                format: new ol.format.GeoJSON(),
                wrapX: false,
            }),
        });


        var googleBaseMap = new ol.layer.Tile({
            title: "GoogleMap",
            type: "base",
            visible: true,
            opacity: 1,
            source: new ol.source.XYZ({
                url: "https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}&s=Ga",
                crossOrigin: "Anonymous"
            }),
        });

        var noBasemap = new ol.layer.Tile({
            title: 'NoBasemap',
            visible: false,
        });

        //OverViewMap
        const osmOverviewMapControl = new ol.control.OverviewMap({
            layers: [
                new ol.layer.Tile({
                    source: openStreetMapStandard.getSource(),
                }),
            ],
        });
        const googleOverviewMapControl = new ol.control.OverviewMap({
            layers: [
                new ol.layer.Tile({
                    source: googleBaseMap.getSource(),
                }),
            ],
        });

        // Basemap
        var baseLayerGroup = new ol.layer.Group({
            layers: [
                openStreetMapStandard, googleBaseMap, noBasemap
            ]
        });

        var baseLayerElements = document.querySelectorAll('.map-menu__map>input[type=radio]');
        for (let baseLayerElement of baseLayerElements) {
            baseLayerElement.addEventListener('change', function() {
                let baseLayerElementValue = this.value;
                baseLayerGroup.getLayers().forEach(function(element, index, array) {
                    let baseLayerTitle = element.get('title');
                    element.setVisible(baseLayerTitle === baseLayerElementValue);
                })
            })
        }

        // Draw Vector
        var drawVector = new ol.layer.Vector({
            background: 'transparent',
            source: new ol.source.Vector({
                url: 'test (1).json',
                format: new ol.format.GeoJSON(),
                wrapX: false,
            }),
        });

        // Select for editing feature
        var featureSelect = new ol.interaction.Select({
            wrapX: false,
        });
        var selectedFeatures, selectedFeature, selectedId, selectedGeometry, selectedProperties;
        var newSelectedProperties = [];
        featureSelect.on('select', function() {
            newSelectedProperties = [];
            $('.feature-properties').html("");

            selectedFeatures = featureSelect.getFeatures();
            selectedFeature = selectedFeatures.item(0);

            selectedId = selectedFeature.getId();
            selectedGeometry = selectedFeature.getGeometry();
            selectedProperties = selectedFeature.getProperties();
            console.log(selectedProperties);

            mapModules.createField('.feature-properties', 'id', selectedId, true);

            for (let x in selectedProperties) {
                if (x === 'geometry') {
                    continue;
                }
                mapModules.createField('.feature-properties', x, selectedProperties[x], false);
                // newProperties.push({
                //     [label.innerText]: text.value
                // });
            }
        });

        var featureModify = new ol.interaction.Modify({
            features: featureSelect.getFeatures(),
        });

        const featureVector = new ol.layer.Vector({
            background: 'transparent',
            source: new ol.source.Vector({
                url: 'test.json',
                format: new ol.format.GeoJSON(),
                wrapX: false,
            }),
        });


        var map = new ol.Map({
            controls: ol.control.defaults().extend([fullScreen, mousePositionControl, googleOverviewMapControl, scaleControl]),
            // interactions: ol.interaction.defaults().extend([featureSelect, featureModify]),
            target: 'map',
            layers: [
                baseLayerGroup, hanhChinhMap, drawVector, featureVector, measureVector, exportVector,
            ],
            view: new ol.View({
                // center: ol.proj.fromLonLat([109.196749, 12.238791]),
                //rotation: 0.8,
                minZoom: 3,
                maxZoom: 20,
                projection: projection
            }),

            // overlays: [overlayPopup]
        });

        map.getView().fit(bounds, map.getSize());

        // Change overviewmap
        $('.map-menu__map input').change(function() {
                if ($(this).val() === 'OSMStandard') {
                    map.removeControl(googleBaseMap);
                    map.addControl(osmOverviewMapControl);
                } else if ($(this).val() === 'GoogleMap') {
                    map.removeControl(osmOverviewMapControl);
                    map.addControl(googleOverviewMapControl);
                } else {
                    map.removeControl(osmOverviewMapControl);
                    map.removeControl(googleOverviewMapControl);
                }
            })
            // Measure Tools
        map.addInteraction(measureModify);
        let draw;

        function measureAddInteraction() {

            const drawType = typeSelect.value;
            const activeTip =
                'Nhấn chuột trái để tiếp tục vẽ ' +
                (drawType === 'Polygon' ? 'vùng' : 'đoạn thẳng');
            const idleTip = 'Nhấn chuột trái để bắt đầu vẽ';
            let tip = idleTip;
            draw = new ol.interaction.Draw({
                source: measureSource,
                type: drawType,
                style: function(feature) {
                    return measureStyleFunction(feature, showSegments.checked, drawType, tip);
                },
            });
            draw.on('drawstart', function() {
                if (clearPrevious.checked) {
                    measureSource.clear();
                }
                measureModify.setActive(false);
                tip = activeTip;
            });
            draw.on('drawend', function() {
                // measureModifyStyle.setGeometry(tipPoint);
                measureModify.setActive(true);
                map.once('pointermove', function() {
                    measureModifyStyle.setGeometry();
                });
                tip = idleTip;
            });
            measureModify.setActive(true);
            map.addInteraction(draw);
        }

        measureAddInteraction();
        typeSelect.onchange = function() {
            map.removeInteraction(draw);
            measureAddInteraction();
        };
        showSegments.onchange = function() {
            measureVector.changed();
            draw.getOverlay().changed();
        };
        map.removeInteraction(draw);

        // Draw tool
        let drawFeature;

        var featrueIdArr = []; // Tạo id cho features
        drawVector.getSource().on('featuresloadend', function(evt) {
            const source = evt.target;
            source.forEachFeature(function(feature) {
                featrueIdArr.push(feature.getId());
            });
        });

        function drawAddInteraction() {
            const value = drawTypeSelect.value;
            drawFeature = new ol.interaction.Draw({
                source: drawVector.getSource(),
                type: value,
            });
            drawFeature.on('drawend', function(e) {
                var id = parseInt(featrueIdArr.length) + 1;
                featrueIdArr.push(id);
                e.feature.setId(id);
            });
            map.addInteraction(drawFeature);
        }
        drawTypeSelect.onchange = function() {
            map.removeInteraction(drawFeature);
            drawAddInteraction();
        };
        document.getElementById('undo-draw-feature').addEventListener('click', function() {
            drawFeature.removeLastPoint();
        });

        // Hightlight map when click style
        var highlightLabelStyles = {
            'MultiPolygon': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    // color: 'rgb(98, 225, 225)',
                    color: 'cyan',
                    width: 2,
                }),
                // fill: new ol.style.Stroke({
                //     color: 'cyan',
                // })
            })
        };

        var stylePopupFunction = function(feature) {
            return highlightLabelStyles[feature.getGeometry().getType()];
        };

        var vectorLayerPopup = new ol.layer.Vector({
            projection: projection,
            style: stylePopupFunction
        });
        map.addLayer(vectorLayerPopup);
        vectorLayerPopup.setVisible(false);


        // Tạo zoom slider mới 
        var zoomSlider = new ol.control.ZoomSlider();
        map.addControl(zoomSlider);

        var view = map.getView();
        var hanhChinhMapSource = hanhChinhMap.getSource();

        map.on('singleclick', function(evt) {
            mapModules.showLabelInfo(evt.coordinate, view, vectorLayerPopup, overlayPopup, hanhChinhMapSource);
        });

        $("#hanhChinhCb").change(function() {
            if ($("#hanhChinhCb").is(":checked")) {
                hanhChinhMap.setVisible(true);
            } else {
                hanhChinhMap.setVisible(false);
            }
        });


        // OPACITY
        const opacityInput = document.getElementById('opacity-input');
        const opacityOutput = document.getElementById('opacity-output');

        function update() {
            const opacity = parseFloat(opacityInput.value);
            hanhChinhMap.setOpacity(opacity);
            opacityOutput.innerText = Math.floor(opacity * 100) +
                "%";
        }
        opacityInput.addEventListener('input', update);
        opacityInput.addEventListener('change', update);
        update();

        //BUTTON BAR-------------------------------------------------------------------------
        $('#home-button').click(() => {
            map.getView().fit(bounds, map.getSize());
        })
        $('#zoom-in-button').click(function() {
            map.getView().setZoom(map.getView().getZoom() + 1);
        });
        $('#zoom-out-button').click(function() {
            map.getView().setZoom(map.getView().getZoom() - 1);
        });
        $('#hand-button').click(function() {
            map.removeOverlay(overlayPopup);
            vectorLayerPopup.setVisible(false);
            $('#measure-switch').prop('checked', false);
            map.removeInteraction(draw);
        });
        $('#popup-button').click(function() {
            map.addOverlay(overlayPopup);
            vectorLayerPopup.setVisible(true);
        });
        $('#popdown-button').click(function() {
            map.removeOverlay(overlayPopup);
            vectorLayerPopup.setVisible(false);
        });
        $('#measure-button').on('click', function() {
            $('.measure-tool .form-inline').toggleClass('form-inline--show');
        });
        $('#measure-switch').click(function() {
            if ($('#measure-switch').is(':checked')) {
                map.addInteraction(draw);
            } else {
                map.removeInteraction(draw);
            }
        });
        $('#export-button').click(function() {
            $('.export-form').toggleClass('export-form--show');
        });
        $('#export-pdf-button').click(function() {
            $('#export-pdf-button').prop('disabled', true);
            document.body.style.cursor = 'progress';
            const format = document.getElementById('export-format').value;
            const resolution = document.getElementById('export-resolution').value;
            const dim = pageSize[format];
            const width = Math.round((dim[0] * resolution) / 25.4);
            const height = Math.round((dim[1] * resolution) / 25.4);
            const size = map.getSize();
            const viewResolution = map.getView().getResolution();

            map.once('rendercomplete', function() {
                const mapCanvas = document.createElement('canvas');
                mapCanvas.width = width;
                mapCanvas.height = height;

                const mapContext = mapCanvas.getContext('2d');
                Array.prototype.forEach.call(
                    document.querySelectorAll('.ol-layer canvas'),
                    function(canvas) {
                        if (canvas.width > 0) {
                            canvas.setAttribute('crossOrigin', 'anonymous');
                            const opacity = canvas.parentNode.style.opacity;
                            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
                            const transform = canvas.style.transform;
                            // Get the transform parameters from the style's transform matrix
                            const matrix = transform
                                .match(/^matrix\(([^\(]*)\)$/)[1]
                                .split(',')
                                .map(Number);
                            // Apply the transform to the export map context
                            CanvasRenderingContext2D.prototype.setTransform.apply(
                                mapContext,
                                matrix
                            );
                            mapContext.drawImage(canvas, 0, 0);
                        }
                    }
                );

                mapContext.globalAlpha = 1;
                const pdf = new jspdf.jsPDF('landscape', undefined, format);

                pdf.addImage(
                    mapCanvas.toDataURL('image/jpeg'),
                    'PNG', 20, 20,
                    dim[0] - 40,
                    dim[1] - 50
                );

                pdf.rect(20, 20, dim[0] - 40, dim[1] - 50);
                pdf.addFont('resources/JetBrainsMono-Bold.ttf', 'JetBrain', 'bold');
                pdf.setFont('JetBrain', 'bold');

                pdf.setFontSize(6);
                pdf.text(dim[0] - 20, dim[1] - 10, 'GIS DUT TEAM');

                pdf.setTextColor('#4271A7');
                pdf.setFontSize(16);
                pdf.text(dim[0] / 2, 10, 'Trường Đại học Bách Khoa - Đại học Đà Nẵng\n Khoa Xây dựng Công trình thủy', { align: 'center' });

                pdf.save($('#export-name').val());
                // Reset original map size
                map.setSize(size);
                map.getView().setResolution(viewResolution);
                // map.getView().setZoom(map.getView().getZoom() - 1);/
                $('#export-pdf-button').prop('disabled', false);
                document.body.style.cursor = 'auto';
            });

            // Set print size
            const printSize = [width, height];
            map.setSize(printSize);
            const scaling = Math.min(width / size[0], height / size[1]);
            map.getView().setResolution(viewResolution / scaling);
            $('#export-pdf-button').prop('disabled', false);
        });
        $('#edit-button').click(function() {
            $('.edit-tool .edit-form').toggleClass('edit-form--show');
        });
        $('#start-edit').click(function() {
            $('#stop-edit').prop('disabled', false);
            $('#add-field-button').prop('disabled', false);
            $('#add-field-input').prop('disabled', false);
            map.addInteraction(featureSelect);
            map.addInteraction(featureModify);
        });
        $('#save-edit').click(function() {
            $(this).prop('disabled', true);
            for (let x in selectedProperties) {
                if (x === 'geometry') {
                    continue;
                }
                selectedFeature.unset(x);
            }
            // console.log(newProperties);
            $('.feature-properties label').each(function() {
                var key = $(this).text();
                var value = $(this).next().val();
                selectedFeature.setProperties({
                    [key]: value
                });
            });
            selectedFeature.unset('id');
        });
        $('#stop-edit').click(function() {
            $('#stop-edit').prop('disabled', true);
            $('#add-field-button').prop('disabled', true);
            $('#add-field-input').prop('disabled', true);
            $('#save-edit').prop('disabled', true);
            $('#feature-properties').html('');
            map.removeInteraction(featureSelect);
            map.removeInteraction(featureModify);
        });
        $('#draw-button').click(function() {
            $('.draw-tool .draw-form').toggleClass('draw-form--show');
        });
        $('#start-draw').click(function() {
            $('#stop-draw').prop('disabled', false);
            $('#undo-draw-feature').prop('disabled', false);
            $('#draw-type').prop('disabled', false);
            drawAddInteraction();
        });
        $('#stop-draw').click(function() {
            $('#stop-draw').prop('disabled', true);
            $('#undo-draw-feature').prop('disabled', true);
            $('#draw-type').prop('disabled', true);
            map.removeInteraction(drawFeature);
        });
        $('#add-field-button').click(function() {
            $('#save-edit').prop('disabled', false);
            var name = $('#add-field-input').val();
            mapModules.createField('.feature-properties', name, '', false);
            var fieldCount = document.getElementById('feature-properties').childElementCount;
            var fieldMaxCount = 18;
            if (fieldCount > fieldMaxCount) {
                $('#add-field-button').prop('disabled', true);
            }
        });
        // DEMO SAVE GEOJSON
        $('#test-save').click(function() {
            var allFeatures = drawVector.getSource().getFeatures();
            // var allFeatures = usVector.getSource().getFeatures();
            var format = new ol.format.GeoJSON();
            var arrVector = format.writeFeaturesObject(allFeatures, { featureProjection: 'EPSG:3857' });
            exportJson(arrVector);
        });

        function exportJson(featuresCollection) {
            var txtArray = [];
            txtArray.push(JSON.stringify(featuresCollection));

            var blob = new Blob(txtArray, { type: 'text/json;charset=utf8' });
            saveAs(blob, 'test' + ".txt")
        };

        // Click Danh mục nhảy vị trí
        $(".second-content-item").each(function(event) {
            for (let i = 0; i < hanhChinhData.length; i++) {
                if ($(this).text().endsWith(hanhChinhData[i].name)) {
                    $(this).click(function() {
                        map.addOverlay(overlayPopup);
                        vectorLayerPopup.setVisible(true);
                        var coord = [parseFloat(hanhChinhData[i].pos_x), parseFloat(hanhChinhData[i].pos_y), `${$(this).text()}`];
                        map.getView().setCenter(coord);
                        map.getView().setZoom(13);
                        mapModules.showOnlyOneLabelInfo(coord, view, vectorLayerPopup, overlayPopup, hanhChinhMapSource);

                    });
                }
            }
        });

        // Tìm kiếm theo tên
        const searchingPool = [];
        mapModules.addElementToSearchingPool(hanhChinhData, searchingPool);
        // console.log(searchingPool.length);
        $('#search-input').on('input', function(e) {
                mapModules.filterData(e.target.value, searchingPool);
            })
            // mapModules.filterData(searchingPool);
            // Click kết quả search nhảy vị trí
        $(".address-list li").each(function() {
            var text = $(this).text().split(',', 2);
            for (let i = 0; i < hanhChinhData.length; i++) {
                if (text[0].endsWith(hanhChinhData[i].name)) {
                    $(this).click(function() {
                        map.addOverlay(overlayPopup);
                        vectorLayerPopup.setVisible(true);
                        var coord = [parseFloat(hanhChinhData[i].pos_x), parseFloat(hanhChinhData[i].pos_y), `${text[0]}`];
                        map.getView().setCenter(coord);
                        map.getView().setZoom(13);
                        $('.active').removeClass('active');
                        mapModules.showOnlyOneLabelInfo(coord, view, vectorLayerPopup, overlayPopup, hanhChinhMapSource);

                    });
                }
            }
        });




    })();


});