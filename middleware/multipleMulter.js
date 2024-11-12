import multer from "multer";
const storage = multer.memoryStorage();
const multipleUpload = multer({ storage }).fields([
  { name: "file1", maxCount: 1 },
  { name: "file2", maxCount: 1 },
  { name: "file3", maxCount: 1 },
]);
export { multipleUpload };
