import fs from 'fs';
import { Jimp } from 'jimp';
import axios from 'axios';

export async function filterImageFromURL(inputURL) {
  return new Promise(async (resolve, reject) => {
    try {
      // Fetch the image and validate the response
      const response = await axios.get(inputURL, {
        responseType: 'arraybuffer',
      });
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image')) {
        return reject(new Error('The URL does not point to a valid image'));
      }

      // Read the image buffer
      const buffer = Buffer.from(response.data);

      // Validate and process the image using Jimp
      let photo;
      try {
        photo = await Jimp.read(buffer);
      } catch (error) {
        console.error('Error Reading image:', error);
        return reject(
          new Error(
            'Failed to process the image. Ensure the image format is supported.'
          )
        );
      }

      // Process the image
      const outpath =
        '/tmp/filtered.' + Math.floor(Math.random() * 2000) + '.jpg';
      console.log('outpath', outpath);

      // Resize the image
      await photo.resize({ w: 256, h: 256 });

      // Greyscale the image
      await photo.greyscale();

      // Get the buffer to change the quality
      const bufferWithQuality = await photo.getBuffer('image/jpeg', {
        quality: 60,
      });

      // Write the processed image to the output path
      fs.writeFileSync(outpath, bufferWithQuality);

      resolve(outpath);
    } catch (error) {
      console.error('Error processing image:', error);
      reject(error);
    }
  });
}

// deleteLocalFiles
// helper function to delete files on the local disk
// useful to cleanup after tasks
// INPUTS
//    files: Array<string> an array of absolute paths to files
export async function deleteLocalFiles(files) {
  for (let file of files) {
    fs.unlinkSync(file);
  }
}
