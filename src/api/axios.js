import axios from 'axios';
// const BASE_URL = 'https://aig4backend.mcqbank.online/';
const BASE_URL = 'http://127.0.0.1:8000/';
// const BASE_URL = 'https://mcqbank.online/'
// const BASE_URL = 'http://192.168.10.12:8000/'
export default axios.create({
    baseURL: BASE_URL,
    headers: { "X-CSRFToken": '{{csrf_token}}' },
});