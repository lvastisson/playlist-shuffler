const fs = require('fs');
const path = require('path');

const mp3Directory = './mp3s';
const outputDirectory = './output';
const numberOfDuplicates = 3; // Number of times to duplicate each file

// Ensure output directory exists
if (!fs.existsSync(outputDirectory)) {
  fs.mkdirSync(outputDirectory);
}

// Generate a random number sequence
const generateRandomNumber = () => {
  return Math.floor(Math.random() * 1000000); // 6 digit random number
};

function extractFilename(filename) {
  let regex = /^[0-9]-[0-9]+-(.+)\.mp3$/;
  return filename.match(regex)[1];
}

// Function to copy a file
const copyFile = (src, dest) => {
  return new Promise((resolve, reject) => {
    fs.copyFile(src, dest, (err) => {
      if (err) {
        console.error('Error copying file', err);
        reject(err);
      } else {
        console.log(`Copied ${src} to ${dest}`);
        resolve(dest);
      }
    });
  });
};

console.log('Starting...');

// Get the list of MP3 files
fs.readdir(mp3Directory, async (err, files) => {
  if (err) {
    console.error('Error reading the directory', err);
    return;
  }

  const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
  const copyPromises = [];

  for (let i = 0; i < numberOfDuplicates; i++) { 
    mp3Files.forEach(file => {
      const randomNumber = generateRandomNumber();
      const newFilename = `${i}-${randomNumber}-${file}`;
      const srcPath = path.join(mp3Directory, file);
      const destPath = path.join(outputDirectory, newFilename);

      // Add the copy promise to the array
      copyPromises.push(copyFile(srcPath, destPath));
    });
  }

  try {
    await Promise.all(copyPromises);
    console.log('All files have been copied into shuffled playlists, now removing consequent duplicates if there are any found.');
    deleteDuplicates();
  } catch (err) {
    console.error('Error copying files', err);
  }
});

function deleteDuplicates() {
  // Get the list of previously duplicated MP3 files
  fs.readdir(outputDirectory, (err, files) => {
    if (err) {
      console.error('Error reading the directory', err);
      return;
    }

    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

    console.log('Output directory content:');
    console.log(mp3Files);

    let lastMusicName = '';

    mp3Files.forEach(file => {
      const srcPath = path.join(outputDirectory, file);
      const musicName = extractFilename(file);

      if (lastMusicName === musicName) {
        fs.unlink(srcPath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err.message}`);
            return;
          }
          console.log(`Duplicate of file "${musicName}" deleted successfully`);
        });
      }

      lastMusicName = musicName;
    });
  });
}