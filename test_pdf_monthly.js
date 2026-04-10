const axios = require('axios');
async function run() {
    try {
        const res = await axios.get('http://localhost:5000/admin/ledger-report?period=monthly');
        console.log('Success received rows:', res.data.length);
        console.log(res.data[0]);
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error(e.response.data);
    }
}
run();
