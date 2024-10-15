/* ****************************************************************************
 * All Routes
 **************************************************************************** */

const path = require('path');
const fs = require('fs');

const routes = (server) => {
    fs.readdirSync(__dirname).filter((file) => path.join(__dirname, file) != __filename).forEach((file) => {
        require(`./${path.basename(file)}`)(server);
    });
};
module.exports = routes;
