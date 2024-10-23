const fs = require('fs');
const path = require('path');

const directory = 'src'; // Change this to your source directory

function renameFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      renameFiles(fullPath);
    } else if (path.extname(fullPath) === '.js' && /^[A-Z]/.test(path.basename(fullPath))) {
      const newFullPath = fullPath.replace('.js', '.jsx');
      fs.renameSync(fullPath, newFullPath);
      console.log(`Renamed: ${fullPath} -> ${newFullPath}`);
    }
  });
}

renameFiles(directory);