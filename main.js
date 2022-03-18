mainMap();
features();

function mainMap() {
    var format = 'image/png';

    var bounds = [109.4080660949702, 12.37178195598381,
        109.73938600697923, 12.62397399460134
    ];

    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    var openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'OSMStandard'
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

    // Mouse Position
    const mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouse-position'),
    });

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
            }
        })
    });

    var map = new ol.Map({
        controls: ol.control.defaults().extend([fullScreen, mousePositionControl]),
        target: 'map',
        layers: [
            openStreetMapStandard, hanhChinh
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([109.196749, 12.238791]),
            zoom: 10,
            //maxZoom: 10,
            //minZoom: 1,
            //rotation: 0.8,
            // projection: projection
        }),
        overlays: [overlay]
    });

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

    map.on('singleclick', function(evt) {
        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = ngapLut.getSource();
        var url = source.getFeatureInfoUrl(
            evt.coordinate, viewResolution, view.getProjection(), {
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 50
            });
        if (url) {
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function(n) {
                    var content = "<table>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content = "Độ sâu ngập: " + featureAttr["DoSauNgap"]

                    }
                    content += "</table>";
                    $("#popup-content").html(content);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer.setSource(vectorSource);
                }
            });
        }
    });


}


//-------------------------------------------------------------------------
function features() {
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