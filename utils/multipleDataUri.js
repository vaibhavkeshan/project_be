import DataUriParser from "datauri/parser.js";
import path from "path";

const getMultipleDataUri = (files) => {
  console.log(files);

  const parser = new DataUriParser();
  const dataUris = [];

  files.forEach((file) => {
    const extName = path.extname(file.originalname);
    dataUris.push(parser.format(extName, file.buffer));
  });
  return dataUris;
};

export default getMultipleDataUri;
