const { Pool, Client } = require('pg');
var fs = require('fs');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'WebGIS_NhaTrang',
    password: 'anhquyen1809',
    port: 5432,
});


pool.query("select distinct name, varname_3, type_3, pos_x, pos_y, name_2 from public.hanh_chinh_nha_trang", (err, res) => {
    var response = res;
    var arr = [];
    const json = JSON.stringify(response);
    fs.writeFile('./map_data.json', JSON.stringify(response), err => {
        if (err) {
            console.log(err);
        } else {
            console.log('File write successfully')
        }
    });
    // arr.push(response);
    console.log(json);
    pool.end();
});