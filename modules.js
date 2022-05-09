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
                    var newCoord = [coord[0] + 2000, coord[1] + 2000];
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
        var fieldMaxCount = 19;
        var fieldCount = document.getElementById('feature-properties').childElementCount;
        grandParent.removeChild(parentRemove);
        if (fieldCount <= fieldMaxCount) {
            $('#add-field-button').prop('disabled', false);
        }
    });
    if (disabled == true) {
        iconButton.style.visibility = "hidden";
    }
    label.innerText = `${name}`;
    input.type = "text";
    input.value = `${value}`;
    input.disabled = disabled;
    input.addEventListener('input', function() {
        $('#save-edit').prop('disabled', false);
    });
    $(`${parent}`).append(div);
}


export { addElementToSearchingPool, filterData, showLabelInfo, showOnlyOneLabelInfo, getParentPrefix, getDistinct, createField };