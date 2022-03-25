mainMap();
pageEffects();

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
    });

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
            zoom: 9.5,
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

    map.on('singleclick', function(evt) {
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
    });

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


}


//-------------------------------------------------------------------------
function pageEffects() {
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

    // Danh Mục
    // map data from json file
    // var mapData;
    (async() => {
        var dataMap = [];
        var xa = [];
        var huyen = [];
        var thanhPho = ["Nha Trang", "Cam Ranh"];
        var thiXa = ["Ninh Hòa"];
        // const HanhChinhObject = {
        //     name: "",
        //     parent: "",
        //     pos_x: "",
        //     pos_y: ""
        // }
        function HanhChinhLabel(name, parrent, pos_x, pos_y) {
            this.name = name;
            this.parrent = parrent;
            this.pos_x = pos_x;
            this.pox_y = pos_y;
        }
        var phuong_NhaTrang = [];
        var xa_NhaTrang = [];
        var phuong_CamRanh = [];
        var xa_CamRanh = [];
        var phuong_NinhHoa = [];
        var xa_NinhHoa = [];
        var thiTran_CamLam = [];
        var xa_CamLam = [];
        var thiTran_DienKhanh = [];
        var xa_DienKhanh = [];
        var thiTran_KhanhSon = [];
        var xa_KhanhSon = [];
        var thiTran_KhanhVinh = [];
        var xa_KhanhVinh = [];
        var thiTran_VanNinh = [];
        var xa_VanNinh = [];


        await fetch("./map_data.json")
            .then(function(resp) {
                return resp.json();
            }).then(function(data) {
                dataMap = data.rows;
            });

        var dataHuyen = [];
        for (let i = 0; i < dataMap.length; i++) {
            dataHuyen.push(dataMap[i].name_2);
            if (dataMap[i].name_2 === "Nha Trang" && dataMap[i].type_3 === "Phường") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                phuong_NhaTrang.push(hc);
            } else if (dataMap[i].name_2 === "Nha Trang" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_NhaTrang.push(hc);
            } else if (dataMap[i].name_2 === "Cam Ranh" && dataMap[i].type_3 === "Phường") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                phuong_CamRanh.push(hc);
            } else if (dataMap[i].name_2 === "Cam Ranh" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_CamRanh.push(hc);
            } else if (dataMap[i].name_2 === "Ninh Hòa" && dataMap[i].type_3 === "Phường") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                phuong_NinhHoa.push(hc);
            } else if (dataMap[i].name_2 === "Ninh Hòa" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_NinhHoa.push(hc);
            } else if (dataMap[i].name_2 === "Cam Lâm" && dataMap[i].type_3 === "Thị trấn") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                thiTran_CamLam.push(hc);
            } else if (dataMap[i].name_2 === "Cam Lâm" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_CamLam.push(hc);
            } else if (dataMap[i].name_2 === "Diên Khánh" && dataMap[i].type_3 === "Thị trấn") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                thiTran_DienKhanh.push(hc);
            } else if (dataMap[i].name_2 === "Diên Khánh" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_DienKhanh.push(hc);
            } else if (dataMap[i].name_2 === "Khánh Sơn" && dataMap[i].type_3 === "Thị trấn") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                thiTran_KhanhSon.push(hc);
            } else if (dataMap[i].name_2 === "Khánh Sơn" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_KhanhSon.push(hc);
            } else if (dataMap[i].name_2 === "Khánh Vĩnh" && dataMap[i].type_3 === "Thị trấn") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                thiTran_KhanhVinh.push(hc);
            } else if (dataMap[i].name_2 === "Khánh Vĩnh" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_KhanhVinh.push(hc);
            } else if (dataMap[i].name_2 === "Vạn Ninh" && dataMap[i].type_3 === "Thị trấn") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                thiTran_VanNinh.push(hc);
            } else if (dataMap[i].name_2 === "Vạn Ninh" && dataMap[i].type_3 === "Xã") {
                const hc = new HanhChinhLabel(dataMap[i].name, dataMap[i].name_2, dataMap[i].pos_x, dataMap[i].pos_y);
                xa_VanNinh.push(hc);
            }
        }

        //Lấy huyện không trùng nhau
        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }
        var huyen = dataHuyen.filter(onlyUnique);
        huyen.splice(2, 2);
        huyen.splice(3, 1);



        $('.left').html = '';
        const hanhChinh = document.createElement('div');
        const firstContentHC = document.createElement('div');
        const secondContentThanhPho = document.createElement('div');

        hanhChinh.classList.add('first-bar');
        firstContentHC.classList.add('first-bar-content');


        hanhChinh.innerHTML = `
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Ranh giới hành chính</p>
    `;
        for (let i = 0; i < thanhPho.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Tp ${thanhPho[i]}</p>
</div>
<div class="second-bar-content">
</div>`;
        }
        for (let i = 0; i < thiXa.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Thị xã ${thiXa[i]}</p>
</div>
<div class="second-bar-content">
</div>`;
        }
        for (let i = 0; i < huyen.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Huyện ${huyen[i]}</p>
</div>
<div class="second-bar-content">
</div>`;
        }


        $('.left').append(hanhChinh);
        $('.left').append(firstContentHC);

        $(".left .first-bar").click(function() {
            // $(this).next().toggle();
            $(this).next().toggleClass("first-bar-content--active");
            $(this).toggleClass("first-bar--active");
        });

        $(".left .first-bar-content .second-bar").click(function() {
            $(this).next().toggleClass("second-bar-content--active");
            $(this).toggleClass("second-bar--active");
        });
    })();



});