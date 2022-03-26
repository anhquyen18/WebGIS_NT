pageEffects();

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
var map;
//-------------------------------------------------------------------------
jQuery(document).ready(function($) {

    // Danh Mục
    // map data from json file
    // var mapData;
    (async() => {
        var dataMap = [];
        var huyen = [];
        var thanhPho = ["Nha Trang", "Cam Ranh"];
        var thiXa = ["Ninh Hòa"];

        function HanhChinhLabel(name, parrent, pos_x, pos_y) {
            this.name = name;
            this.parrent = parrent;
            this.pos_x = pos_x;
            this.pos_y = pos_y;
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
        huyen.splice(3, 2);
        huyen.splice(4, 1);



        $('.left').html = '';
        const hanhChinh = document.createElement('div');
        const satLoDat = document.createElement('div');
        const firstContentHC = document.createElement('div');
        const firstContentSLD = document.createElement('div');
        const secondContentNhaTrang = document.createElement('div');
        const secondContentCamRanh = document.createElement('div');
        const secondContentNinhHoa = document.createElement('div');
        const secondContentVanNinh = document.createElement('div');
        const secondContentCamLam = document.createElement('div');
        const secondContentKhanhVinh = document.createElement('div');
        const secondContentDienKhanh = document.createElement('div');
        const secondContentKhanhSon = document.createElement('div');

        hanhChinh.classList.add('first-bar');
        satLoDat.classList.add('first-bar');
        firstContentHC.classList.add('first-bar-content');
        firstContentSLD.classList.add('first-bar-content');
        secondContentNhaTrang.classList.add('second-bar-content');
        secondContentCamRanh.classList.add('second-bar-content');
        secondContentNinhHoa.classList.add('second-bar-content');
        secondContentVanNinh.classList.add('second-bar-content');
        secondContentCamLam.classList.add('second-bar-content');
        secondContentKhanhVinh.classList.add('second-bar-content');
        secondContentDienKhanh.classList.add('second-bar-content');
        secondContentKhanhSon.classList.add('second-bar-content');

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
        for (let i = 0; i < thanhPho.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Tp ${thanhPho[i]}</p>
</div>`;
        };
        for (let i = 0; i < thiXa.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Thị xã ${thiXa[i]}</p>
</div>`;
        };
        for (let i = 0; i < huyen.length; i++) {
            firstContentHC.innerHTML += `
    <div class="second-bar">
    <i class="fa-regular fa-square-plus"></i>
    <i class="fa-regular fa-square-minus"></i>
    <p class="plus-heading">Huyện ${huyen[i]}</p>
</div>`;
        };

        for (let i = 0; i < phuong_NhaTrang.length; i++) {
            secondContentNhaTrang.innerHTML += `
            <div class="second-content-item">Phường ${phuong_NhaTrang[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_NhaTrang.length; i++) {
            secondContentNhaTrang.innerHTML += `
            <div class="second-content-item">Xã ${xa_NhaTrang[i].name}</div>
            `;
        };
        for (let i = 0; i < phuong_CamRanh.length; i++) {
            secondContentCamRanh.innerHTML += `
            <div class="second-content-item">Phường ${phuong_CamRanh[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_CamRanh.length; i++) {
            secondContentCamRanh.innerHTML += `
            <div class="second-content-item">Xã ${xa_CamRanh[i].name}</div>
            `;
        };
        for (let i = 0; i < phuong_NinhHoa.length; i++) {
            secondContentNinhHoa.innerHTML += `
            <div class="second-content-item">Phường ${phuong_NinhHoa[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_NinhHoa.length; i++) {
            secondContentNinhHoa.innerHTML += `
            <div class="second-content-item">Xã ${xa_NinhHoa[i].name}</div>
            `;
        };
        for (let i = 0; i < thiTran_VanNinh.length; i++) {
            secondContentVanNinh.innerHTML += `
            <div class="second-content-item">Thị trấn ${thiTran_VanNinh[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_VanNinh.length; i++) {
            secondContentVanNinh.innerHTML += `
            <div class="second-content-item">Xã ${xa_VanNinh[i].name}</div>
            `;
        };
        for (let i = 0; i < thiTran_CamLam.length; i++) {
            secondContentCamLam.innerHTML += `
            <div class="second-content-item">Thị trấn ${thiTran_CamLam[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_CamLam.length; i++) {
            secondContentCamLam.innerHTML += `
            <div class="second-content-item">Xã ${xa_CamLam[i].name}</div>
            `;
        };
        for (let i = 0; i < thiTran_KhanhVinh.length; i++) {
            secondContentKhanhVinh.innerHTML += `
            <div class="second-content-item">Thị trấn ${thiTran_KhanhVinh[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_KhanhVinh.length; i++) {
            secondContentKhanhVinh.innerHTML += `
            <div class="second-content-item">Xã ${xa_KhanhVinh[i].name}</div>
            `;
        };
        for (let i = 0; i < thiTran_DienKhanh.length; i++) {
            secondContentDienKhanh.innerHTML += `
            <div class="second-content-item">Thị trấn ${thiTran_DienKhanh[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_DienKhanh.length; i++) {
            secondContentDienKhanh.innerHTML += `
            <div class="second-content-item">Xã ${xa_DienKhanh[i].name}</div>
            `;
        };
        for (let i = 0; i < thiTran_KhanhSon.length; i++) {
            secondContentKhanhSon.innerHTML += `
            <div class="second-content-item">Thị trấn ${thiTran_KhanhSon[i].name}</div>
            `;
        };
        for (let i = 0; i < xa_KhanhSon.length; i++) {
            secondContentKhanhSon.innerHTML += `
            <div class="second-content-item">Xã ${xa_KhanhSon[i].name}</div>
            `;
        };
        $('.left').append(hanhChinh);
        $('.left').append(firstContentHC);
        $('.left').append(satLoDat);
        // console.log($(".first-bar:nth(1)"));
        $(".first-bar:nth(1)").after(firstContentSLD);

        $('.plus-heading').each(function() {
            if ($(this).text() === "Tp Nha Trang")
                $(this).parent().after(secondContentNhaTrang);
            else if ($(this).text() === "Tp Cam Ranh")
                $(this).parent().after(secondContentCamRanh);
            else if ($(this).text() === "Thị xã Ninh Hòa")
                $(this).parent().after(secondContentNinhHoa);
            else if ($(this).text() === "Huyện Vạn Ninh")
                $(this).parent().after(secondContentVanNinh);
            else if ($(this).text() === "Huyện Cam Lâm")
                $(this).parent().after(secondContentCamLam);
            else if ($(this).text() === "Huyện Khánh Vĩnh")
                $(this).parent().after(secondContentKhanhVinh);
            else if ($(this).text() === "Huyện Diên Khánh")
                $(this).parent().after(secondContentDienKhanh);
            else if ($(this).text() === "Huyện Khánh Sơn")
                $(this).parent().after(secondContentKhanhSon);
        });

        $(".left .first-bar").click(function() {
            $(this).next().toggleClass("first-bar-content--active");
            $(this).toggleClass("first-bar--active");
        });
        $(".left .first-bar-content .second-bar").click(function() {
            $(this).next().toggleClass("second-bar-content--active");
            $(this).toggleClass("second-bar--active");
        });

        //MAP --------------------------------------------------------------------------------------------------
        // --------------------------------------------------------------------------------------------------------
        var format = 'image/png';
        var bounds = [108.66931915300006, 11.769107818000066,
            109.46916961700006, 12.868671416000073
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

        var hanhChinhMap = new ol.layer.Image({
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

        map = new ol.Map({
            controls: ol.control.defaults().extend([fullScreen, mousePositionControl, overviewMapControl]),
            target: 'map',
            layers: [
                openStreetMapStandard, hanhChinhMap
            ],
            view: new ol.View({
                // center: ol.proj.fromLonLat([109.196749, 12.238791]),
                // zoom: 9.5,
                // maxZoom: 20,
                //minZoom: 1,
                //rotation: 0.8,
                projection: projection
            }),
            overlays: [overlayPopup]
        });

        map.getView().fit(bounds, map.getSize());
        // addInteraction();


        // Hightlight map when click style
        var styles = {
            'MultiPolygon': new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'orange',
                    width: 1
                })
            })
        };

        var styleFunction = function(feature) {
            return styles[feature.getGeometry().getType()];
        };

        var vectorLayerPopup = new ol.layer.Vector({
            style: styleFunction
        });
        map.addLayer(vectorLayerPopup);

        // Tạo zoom slider mới
        var zoomSlider = new ol.control.ZoomSlider();
        map.addControl(zoomSlider);

        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = hanhChinhMap.getSource();
        var clickEvent = function(evt) {
            var url = source.getFeatureInfoUrl(
                evt.coordinate, viewResolution, view.getProjection(), {
                    'INFO_FORMAT': 'application/json',
                    'FEATURE_COUNT': 1
                });
            if (url) {
                $.ajax({
                    type: "GET",
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function(data, status) {
                        console.log(data);
                        var content = "";
                        // var feature = data.features[0];
                        // var featureAttr = feature.properties;
                        // content = featureAttr["TYPE_3"] + " " + featureAttr["NAME_3"];
                        for (var i = 0; i < data.features.length; i++) {
                            var feature = data.features[i];
                            var featureAttr = feature.properties;
                            content = featureAttr["TYPE_3"] + " " + featureAttr["NAME_3"];
                        }
                        $("#popup-content").html(content);

                        overlayPopup.setPosition(evt.coordinate);
                        // console.log(ol.control.MousePosition.getCoordinateFormat(), evt.coordinate);

                        var vectorSource = new ol.source.Vector({
                            features: (new ol.format.GeoJSON()).readFeatures(data.features[0])
                        });

                        vectorLayerPopup.setSource(vectorSource);
                    }
                });
            }
        };
        map.on('singleclick', function(evt) {
            var url = source.getFeatureInfoUrl(
                evt.coordinate, viewResolution, view.getProjection(), {
                    'INFO_FORMAT': 'application/json',
                    'FEATURE_COUNT': 1
                });
            if (url) {
                $.ajax({
                    type: "GET",
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    success: function(data, status) {
                        try {
                            var feature = data.features[0];
                            var featureAttr = feature.properties;
                            content = featureAttr["TYPE_3"] + " " + featureAttr["NAME_3"] + ", " + featureAttr["NAME_2"];
                            $("#popup-content").html(content);
                            overlayPopup.setPosition(evt.coordinate);

                            var vectorSource = new ol.source.Vector({
                                features: (new ol.format.GeoJSON()).readFeatures(data)
                            });

                            vectorLayerPopup.setSource(vectorSource);
                        } catch (err) {

                        }
                    }
                });
            }
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
            $('#draw-line-button').unbind();
        });
        $('#popup-button').click(function() {
            map.addOverlay(overlayPopup);
            vectorLayerPopup.setVisible(true);
        });
        $('#popdown-button').click(function() {
            map.removeOverlay(overlayPopup);
            vectorLayerPopup.setVisible(false);
        });


        // });
        // $('#draw-line-button').off('click');


        // Click Danh mục nhảy vị trí
        console.log(parseFloat(phuong_NhaTrang[0].pos_x), parseFloat(phuong_NhaTrang[0].pos_y), phuong_NhaTrang[0].name);
        // var idxPos = 0; 
        console.log(dataMap[0].pos_x);
        console.log($(".second-content-item"));
        $(".second-content-item").each(function(idx) {
            for (let i = 0; i < dataMap.length; i++) {
                if ($(this).text().endsWith(dataMap[i].name)) {
                    $(this).click(function() {
                        var coord = [parseFloat(dataMap[i].pos_x), parseFloat(dataMap[i].pos_y)];
                        map.getView().setCenter(coord);
                        map.getView().setZoom(13);
                    });
                }
            }
        });


    })();


});