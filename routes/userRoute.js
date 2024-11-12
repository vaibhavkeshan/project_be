import express from "express";
const router = express.Router();
import {
  registerController,
  loginController,
  logoutController,
  getMyProfileController,
  updatePasswordController,
  updateProfileController,
  updateProfilePicController,
  forgetPasswordController,
  resetPasswordController,
  uploadProjectController,
  getAllUserController,
  changeRoleController,
  getAllProjectController,
  deleteProjectController,
  updateProjectController,
  getBuildProjectController,
  projectGetController,
  updateProjectUserController,
  getAllProjectAdminController,
  projectEditController,
  getLatestProjectController,
} from "../controllers/userController.js";
import { isAdmin, isAuthenticated } from "../middleware/auth.js";
import singleUpload from "../middleware/multer.js";
import { multipleUpload } from "../middleware/multipleMulter.js";
router.post("/register", singleUpload, registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);
router.get("/me", isAuthenticated, getMyProfileController);
router.put("/updatepassword", isAuthenticated, updatePasswordController);
router.put("/updateprofile", isAuthenticated, updateProfileController);
router.put(
  "/updateprofilepic",
  isAuthenticated,
  singleUpload,
  updateProfilePicController
);

router.post("/forgetpassword", forgetPasswordController);
router.put("/resetpassword/:token", resetPasswordController);
router.post(
  "/uploadproject",

  isAuthenticated,
  multipleUpload,
  uploadProjectController
);
router.get("/allproject", isAuthenticated, getAllProjectController);
router.get(
  "/allprojectadmin",
  isAuthenticated,
  isAdmin,
  getAllProjectAdminController
);

router.delete("/deletepropject/:id", isAuthenticated, deleteProjectController);
router.patch(
  "/updatepropject/:id",
  isAuthenticated,
  // isAdmin,
  singleUpload,
  updateProjectController
);
router.put(
  "/updatepropjectuser/:id",
  isAuthenticated,
  updateProjectUserController
);
router.get(
  "/buildproject",
  isAuthenticated,
  isAdmin,
  getBuildProjectController
);
router.get("/projectget/:id", projectGetController);

router.get("/alluser", isAuthenticated, isAdmin, getAllUserController);
router.put("/chagerole/:id", isAuthenticated, isAdmin, changeRoleController);
router.put(
  "/projectedit/:id",
  isAuthenticated,
  multipleUpload,
  projectEditController
);
router.get("/getlatestproject", isAuthenticated, getLatestProjectController);
export default router;
