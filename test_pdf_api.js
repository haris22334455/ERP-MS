const axios = require('axios');
async function run() {
    try {
        const res = await axios.get('http://localhost:5000/admin/ledger-report?period=daily');
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error:', e.message);
        if (e.response) console.error(e.response.data);
    }
}
run();
