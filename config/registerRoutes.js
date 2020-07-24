'use strict';

const staffRoutes = require('../core/staff/staffRoutes');

module.exports = (app) => {
    staffRoutes(app);
}