const sharp = require('sharp');
const fs = require('fs');

async function makeCircle() {
  const size = 512;
  const radius = size / 2;
  
  // Create an SVG with a circle for the mask
  const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white" /></svg>`;
  const svgBuffer = Buffer.from(circleSvg);
  
  await sharp('src/app/icon.png')
    .resize(size, size)
    .composite([{ input: svgBuffer, blend: 'dest-in' }])
    .png()
    .toFile('src/app/icon_circular.png');

  // Overwrite the original files with the new circular version
  fs.copyFileSync('src/app/icon_circular.png', 'public/logo.png');
  fs.copyFileSync('src/app/icon_circular.png', 'src/app/icon.png');
  fs.copyFileSync('src/app/icon_circular.png', 'public/icon.png');
  fs.copyFileSync('src/app/icon_circular.png', 'src/app/favicon.ico');
  fs.copyFileSync('src/app/icon_circular.png', 'public/favicon.ico');
}

makeCircle().then(() => console.log('Done')).catch(console.error);
