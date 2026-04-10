const axios = require('axios');
async function run() {
    try {
        const res = await axios.post('http://localhost:5000/book-order', {
            shop_id: 2,
            user_id: 1,
            items: [
                { product_id: 1, quantity: 10, price: 100 }
            ],
            total_amount: 1000
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error response:', e.response ? e.response.data : e.message);
    }
}
run();
