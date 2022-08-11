// add data to data pool for searching
function addElementToSearchingPool(array, pool) {
    for (let i = 0; i < array.length; i++) {
        const li = document.createElement('li');
        pool.push({ objectid: array[i].objectid, object: li, position: `${array[i].pos_x}, ${array[i].pos_y}` });
        li.innerHTML = `${array[i].type_3} ${array[i].name}, ${getParentPrefix(array[i].name_2)} ${array[i].name_2}`;
        $('.address-list').append(li);
    };
}

// Search by full name
function filterData(searchTerm, listItems) {
    listItems.forEach(item => {
        if (item.object.innerText.toLowerCase().includes(searchTerm.toLowerCase())) {
            item.object.classList.remove('hide');
        } else {
            item.object.classList.add('hide');
        }
    })
}


// Lấy tên tiền tố của cấp huyện, thị xã, thành phố
function getParentPrefix(string) {
    if (string === 'Nha Trang' || string === 'Cam Ranh') {
        return 'Thành phố';
    } else if (string === 'Ninh Hòa') {
        return 'Thị xã';
    } else {
        return 'Huyện';
    }
}

// Hiển thị popup với GetFeatureInfoURL 
function showOnlyOneLabelInfo(coord, view, vectorLayerPopup, overlayPopup, source) {
    var url = source.getFeatureInfoUrl(
        coord, (view.getResolution() / 20), view.getProjection(), {
            'INFO_FORMAT': 'application/json',
            'FEATURE_COUNT': 20
        });
    if (url) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function(data, status) {
                try {
                    var text = coord[2];
                    var newCoord = [coord[0], coord[1]];
                    var feature = data.features;
                    var exactlyFeature;
                    for (let i = 0; i < data.features.length; i++) {
                        if (text.endsWith(feature[i].properties['NAME_3'])) {
                            exactlyFeature = feature[i];
                            break;
                        }
                    }
                    var content;
                    var featureAttr = exactlyFeature.properties;
                    content = featureAttr["TYPE_3"] + " " + featureAttr["NAME_3"] + ",<br>" + `${getParentPrefix(featureAttr["NAME_2"])} ` + featureAttr["NAME_2"] + ".<br>Dân số: " + featureAttr["population"] + "<br>Diện tích: " + featureAttr["area"] + " m<sup>2</sup>";
                    $("#popup-content").html(content);
                    overlayPopup.setPosition(newCoord);
                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(exactlyFeature)
                    });
                    vectorLayerPopup.setSource(vectorSource);
                } catch (err) {

                }
            }
        });
    }
}

function showLabelInfo(coord, view, vectorLayerPopup, overlayPopup, source) {
    var url = source.getFeatureInfoUrl(
        coord, (view.getResolution() / 20), view.getProjection(), {
            'INFO_FORMAT': 'application/json',
            'FEATURE_COUNT': 20
        });
    if (url) {
        $.ajax({
            type: "GET",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function(data, status) {
                try {
                    // (parseFloat(featureAttr["area"]) / Math.pow(10, 6)).toFixed(2)
                    var content;
                    var feature = data.features[0];
                    var featureAttr = feature.properties;
                    content = featureAttr["TYPE_3"] + " " + featureAttr["NAME_3"] + ",<br>" + `${getParentPrefix(featureAttr["NAME_2"])} ` + featureAttr["NAME_2"] + ".<br>Dân số: " + featureAttr["population"] + "<br>Diện tích: " + featureAttr["area"] + " m<sup>2</sup>";
                    $("#popup-content").html(content);
                    overlayPopup.setPosition(coord);
                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(data)
                    });
                    vectorLayerPopup.setSource(vectorSource);
                } catch (err) {

                }
            }
        });
    }
}

// Get distinct value json array
function getDistinct(items) {
    var lookup = {};
    var result = [];
    for (var item, i = 0; item = items[i++];) {
        var name = item.name;

        if (!(name in lookup)) {
            lookup[name] = 1;
            result.push(item);
        }
    }
    return result;
}

// Create field for editing feature
function createField(parent, name, value, disabled) {
    var div = document.createElement("div");
    var label = document.createElement("label");
    var input = document.createElement("input");
    var iconButton = document.createElement("i");
    iconButton.classList.add('fa-solid');
    iconButton.classList.add('fa-circle-minus');
    div.append(iconButton, label, input);
    iconButton.addEventListener('click', function() {
        var parentRemove = iconButton.parentElement;
        var grandParent = document.getElementById("feature-properties");
        grandParent.removeChild(parentRemove);
        $('#save-edit').prop('disabled', false);
    });
    if (disabled == true) {
        iconButton.style.visibility = "hidden";
    }
    iconButton.style.visibility = "hidden";
    label.innerText = `${name}`;
    input.type = "text";
    input.value = `${value}`;
    input.disabled = disabled;
    input.addEventListener('input', function() {
        $('#save-edit').prop('disabled', false);
    });
    $(`${parent}`).append(div);
}

// DELETE FEATURE OF LAYER
function deleteFeature(layer, featureSelect) {
    var typeName = "TestEditingFeature:hanh_chinh_nha_trang_EPSG3857";
    // var typeName = "WebGIS_NhaTrang:hanh_chinh_nha_trang_EPSG3857";
    var url = "http://localhost:8080/geoserver/wfs";
    // var url = "https://dutmaps.site/geoserver/wfs";
    var selectedFeatures = featureSelect.getFeatures();
    var selectedFeature = selectedFeatures.item(0);
    var selectedId = selectedFeature.getId();
    if (confirm('Are you sure you want to delete the selected feature?\nYour feature will never comeback!')) {
        if (selectedId == undefined) {
            featureSelect.getFeatures().clear();
            layer.getSource().removeFeature(selectedFeature);
            return;
        } else if (selectedId != undefined) {
            featureSelect.getFeatures().clear();
            layer.getSource().removeFeature(selectedFeature);
            var postData_del =
                `<wfs:Transaction service="WFS" version="1.0.0"
                xmlns:cdf="http://www.opengis.net/cite/data"
                xmlns:ogc="http://www.opengis.net/ogc"
                xmlns:wfs="http://www.opengis.net/wfs"
                xmlns:topp="http://www.openplans.org/topp">
                <wfs:Delete typeName="${typeName}">
                <ogc:Filter>
                <ogc:FeatureId fid=" ${selectedId}"/>
                </ogc:Filter>
                </wfs:Delete>
                </wfs:Transaction>`;
            var req_del = new XMLHttpRequest();
            req_del.open("POST", url, false);
            req_del.setRequestHeader('Content-type', 'text/xml');
            req_del.onreadystatechange = function() {
                if (req_del.readyState != 4) return;
                if (req_del.status != 200 && req_del.status != 304) {
                    alert('HTTP error ' + req_del.status);
                    return;
                }
            }
            if (req_del.readyState == 4) return;
            req_del.send(postData_del);
            alert('Feature is deleted successfully');
            layer.getSource().refresh();
        }
    } else {
        alert('Feature is not deleted');
        featureSelect.getFeatures().clear();
    }
}

// UPDATE A FEATURE OF LAYER
function saveEdit(layer, featureSelect) {
    var selectedFeatures = featureSelect.getFeatures();
    var selectedFeature = selectedFeatures.item(0);
    var selectedId = selectedFeature.getId();
    var selectedProperties = selectedFeature.getProperties();
    var fieldArr = [];

    var typeName = "TestEditingFeature:hanh_chinh_nha_trang_EPSG3857";
    // var typeName = "WebGIS_NhaTrang:hanh_chinh_nha_trang_EPSG3857";
    var url = 'http://localhost:8080/geoserver/wfs';
    // var url = 'https://dutmaps.site/geoserver/wfs';
    var method = 'POST';

    for (let x in selectedProperties) {
        if (x === 'geometry') {
            continue;
        }
        selectedFeature.unset(x);
    }

    $('.feature-properties label').each(function() {
        var key = $(this).text();
        var value = $(this).next().val();
        fieldArr.push(`
            <wfs:Property>
            <wfs:Name>${key}</wfs:Name>
            <wfs:Value>${value}</wfs:Value>
            </wfs:Property>
            `);
    });

    var allField = '';
    for (let i = 1; i < fieldArr.length; i++) {
        allField += fieldArr[i];
    }
    var coords = selectedFeature.getGeometry();

    var format = new ol.format.GML3({});
    var gml3 = format.writeGeometry(coords, {
        srsName: "urn:x-ogc:def:crs:EPSG:3857"
    });

    var postData = `<wfs:Transaction service="WFS" version="1.1.0"
  xmlns:topp="http://www.openplans.org/topp"
  xmlns:ogc="http://www.opengis.net/ogc"
  xmlns:wfs="http://www.opengis.net/wfs"
  xmlns:gml="http://www.opengis.net/gml"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
  <wfs:Update typeName="${typeName}">
    <wfs:Property>
      <wfs:Name>the_geom</wfs:Name>
      <wfs:Value>
        ${gml3}
      </wfs:Value>
    </wfs:Property>
    ${allField}
    <ogc:Filter>
      <ogc:FeatureId fid="${selectedId}"/>
    </ogc:Filter>
  </wfs:Update>
</wfs:Transaction>`;

    var req = new XMLHttpRequest();
    req.open(method, url, false);
    req.setRequestHeader('Content-type', 'text/xml');
    req.onreadystatechange = function() {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
            alert('HTTP error ' + req.status);
            return;
        }
    }
    if (req.readyState == 4) return;
    req.send(postData);
    layer.getSource().refresh();
    alert('Feature updated successfully');
    featureSelect.getFeatures().clear();
}

// CREATE A NEW FEATURE OF LAYER
function saveCreate(layer, featureSelect) {
    var geometry = featureSelect.getGeometry();
    var format = new ol.format.GML({});
    var gml3 = format.writeGeometry(geometry, {});

    var layerName = "hanh_chinh_nha_trang_EPSG3857";
    var url = 'http://localhost:8080/geoserver/TestEditingFeature/wfs';
    // var url = 'http://localhost:8080/geoserver/WebGIS_NhaTrang/wfs';
    // var url = 'https://dutmaps.site/geoserver/WebGIS_NhaTrang/wfs';
    var method = 'POST';
    // Không thêm VARNAME_2 vào được vì layer đang hiển thị theo field này, mặt dù đã set trước giá trị gì vẫn không hiện thị được
    // Không set trước thì sẽ hiện thì được màu theo lengend others và giá trị là null
    var postData =
        `<wfs:Transaction service="WFS" version="1.1.0"
    xmlns:topp="http://www.openplans.org/topp"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">
    <wfs:Insert>
    <${layerName}>
    <the_geom>
    ${gml3}
    </the_geom>
    <OBJECTID>-1</OBJECTID>
    <NAME>null</NAME>
    <GID_0>null</GID_0>
    <NAME_0>null</NAME_0>
    <NAME_1>null</NAME_1>
    <NAME_2>null</NAME_2>
    <NAME_3>null</NAME_3>
    <VARNAME_3>null</VARNAME_3>
    <TYPE_3>null</TYPE_3>
    <CLOSED>null</CLOSED>
    <BORDER_STY>null</BORDER_STY>
    <LABEL_POS>null</LABEL_POS>
    <FONT_SIZE>-1</FONT_SIZE>
    <FONT_COLOR>null</FONT_COLOR>
    <FONT_CHARS>-1</FONT_CHARS>
    <Shape_Leng>-1</Shape_Leng>
    <Shape_Area>-1</Shape_Area>
    <ID1>-1</ID1>
    <ID2>-1</ID2>
    <pos_x>-1</pos_x>
    <pos_y>-1</pos_y>
    <area>-1</area>
    <population>null</population>
    </${layerName}>
    </wfs:Insert>
    </wfs:Transaction>`
    var req1 = new XMLHttpRequest();
    req1.open(method, url, false);
    req1.setRequestHeader('Content-type', 'text/xml');
    req1.onreadystatechange = function() {
        if (req1.readyState != 4) return;
        if (req1.status != 200 && req1.status != 304) {
            alert('HTTP error ' + req1.status);
            return;
        }
    }

    if (req1.readyState == 4) return;
    if (confirm('Do you want to insert this feature?')) {
        req1.send(postData);
    } else {
        alert('Feature is not inserted');
    }

    layer.getSource().refresh();
}


// Select highlight
function highlightSelected(evt) {
    if (selectOverlay) {
        selectOverlay.getSource().clear();
        map.remove(selectOverlay);
    }
    feature = map.forEachFeatureAtPixel(evt.pixel, function(feature, layer) {
        return feature;
    })

    if (feature) {
        selectOverlay.getSource().addFeature(feature);
        map.updateSize();
    }
}


export { addElementToSearchingPool, filterData, showLabelInfo, showOnlyOneLabelInfo, getParentPrefix, getDistinct, createField, deleteFeature, highlightSelected, saveEdit, saveCreate };