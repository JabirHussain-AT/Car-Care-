const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

function cropImage(files) {
  files.forEach((ob) => {
    sharp(`./public/uploads/${ob}`)
    .resize({
      width: 374,
      height: 480,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFile(`public/uploads/cropped_images/${ob}`, (err) => {
      if (!err) {
        console.log(`Cropping image ${ob}`);
      } else {
        throw err;
      }
    });
  });
}
module.exports = cropImage