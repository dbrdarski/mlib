const chokidar = require('chokidar');

chokidar.watch('.', {ignored: /(^|[\/\\])\../}).on('all', (event, path) => {
  console.log({event, path});
});
