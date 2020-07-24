'use strict';

const app = require('./config/server');

app.listen(process.env.APIPORT || process.env.PORT, () => {
    console.log('API is listening on port:', process.env.APIPORT || process.env.PORT);
});