import { User } from "../models/User.js";
import { ProjectBuild } from "../models/ProjectBuild.js";
import getDataUri from "../utils/dataUri.js";
// import getMultipleDataUri from "../utils/multipleDataUri.js";

import { sendEmail } from "../utils/sendEmail.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import cloudinary from "cloudinary";
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // const file = req.file;
    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).send({
        success: false,
        message: "user already exist",
      });
    }

    user = await User.create({
      name,
      email,
      password,
    });

    sendToken(res, user, "register successfully", 201);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send({
        success: false,
        message: "incorrect password or email",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "incorrect password or email",
      });
    }

    sendToken(res, user, `Welcome back ${user.name}`, 200);
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const logoutController = (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      secure: true,
      httpOnly: true,
      sameSite: "none",
    })
    .send({
      success: true,
      message: "logged out successfully",
    });
};

export const getMyProfileController = async (req, res) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user._id);
    res.status(200).send({
      success: true,
      user,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error ",
    });
  }
};
export const updatePasswordController = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        success: false,
        message: "Please enter all fields",
      });
    }
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).send({
        success: false,
        message: "incorrect oldPassword",
      });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "password changed successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
    });
  }
};
export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      blood_group,
      gender,
      country,
      state,
      city,
      pincode,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (blood_group) user.blood_group = blood_group;
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (state) user.state = state;
    if (city) user.city = city;
    if (pincode) user.pincode = pincode;
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile updated successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const updateProfilePicController = async (req, res) => {
  try {
    const file = req.file;
    console.log(file, "upload it");
    if (!file) {
      return res.status(400).send({
        success: false,
        message: "Please provide a avatar",
      });
    }
    const user = await User.findById(req.user._id);

    const fileUri = getDataUri(file);

    if (user?.avatar?.public_id) {
      console.log("now also", user?.avatar, Object.keys(user.avatar).length);
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    console.log(myCloud);

    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    await user.save();
    res.status(200).send({
      success: true,
      message: "profile picture updated successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const forgetPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "user not found",
      });
    }
    const resetToken = await user.getResetToken();
    await user.save();
    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    const message = `
    Click on the link to reset your password ${url} if you have not request then please ignore
    `;
    await sendEmail(user.email, "Godspeed Reset Password", message);

    console.log("resetToken", resetToken);
    res.status(200).send({
      success: true,
      message: `reset token hab been send to ${user.email} `,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });
    if (!user) {
      res.status(401).send({
        success: false,
        message: "token is invalid or has been expired",
      });
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();
    res.status(200).send({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const uploadProjectController = async (req, res) => {
  try {
    const { file1, file2, file3 } = req.files;
    const { artWorkName, width, height, builder, status } = req.body;
    const user = await User.findById(req.user._id);

    const project = await ProjectBuild.find({
      user: req.user._id,
      "subscriptionId.status": "active",
    });
    // const checker=await ProjectBuild.find({user:req.user._id});

    console.log("length123", project.length);
    console.log(user?.project_report.length);
    console.log(project.length + 2);

    if (user?.project_report.length >= project.length + 2) {
      return res.status(400).send({
        success: false,
        message: "Upgrade your existing free project to create a new project",
      });
    }
    if (!file1 || !file2 || !artWorkName) {
      return res.status(400).send({
        success: false,
        message: "Please provide video , image and artWorkName ",
      });
    }

    const fileUri1 = getDataUri(file1[0]);
    const fileUri2 = getDataUri(file2[0]);

    const myCloud1 = await cloudinary.v2.uploader.upload(fileUri1.content, {
      resource_type: "video",
    });
    const myCloud2 = await cloudinary.v2.uploader.upload(fileUri2.content);

    let targetMind = {};
    if (file3) {
      const fileUri3 = getDataUri(file3[0]);
      const myCloud3 = await cloudinary.v2.uploader.upload(fileUri3.content);
      targetMind = {
        public_id: myCloud3.public_id,
        url: myCloud3.secure_url,
      };
    }

    console.log(user);
    const projectBuild = await ProjectBuild.create({
      user: user._id,
      target: {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      },
      content: {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      },
      targetMind,
      artWorkName,
      width,
      height,
      builder,
      status,
    });

    user.project_report.push(projectBuild._id);
    await user.save();

    res.status(200).send({
      success: true,
      message: "project  added successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const getAllProjectAdminController = async (req, res) => {
  try {
    const project = await ProjectBuild.find({}).populate("user");

    if (!project) {
      res.status(404).send({
        success: false,
        message: "no any user",
      });
    }
    res.status(200).send({
      success: true,
      message: "All Project is fetched successfully",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const getAllProjectController = async (req, res) => {
  try {
    const project = await User.findById(req.user._id).populate(
      "project_report"
    );

    if (!project) {
      res.status(404).send({
        success: false,
        message: "no any user",
      });
    }
    res.status(200).send({
      success: true,
      message: "project is fetched successfully",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const getBuildProjectController = async (req, res) => {
  try {
    const project = await ProjectBuild.find({
      builder: true,
    }).populate("user");

    if (!project) {
      res.status(404).send({
        success: false,
        message: "no any request for project building",
      });
    }
    res.status(200).send({
      success: true,
      message: "Build project is fetched successfully",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const deleteProjectController = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(404).send({
        success: false,
        message: "Id Not Found",
      });
    }
    const project = await ProjectBuild.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).send({
        success: false,
        message: "This id is not exist",
      });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user is not found",
      });
    }

    const data = user.project_report.filter(
      (p, i) => p._id.toString() !== projectId.toString()
    );
    user.project_report = data;
    await user.save();

    res.status(201).send({
      success: true,
      message: "project is deleted successfully",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const updateProjectController = async (req, res) => {
  try {
    const { status } = req.body;
    const file = req.file;

    const { id } = req.params;
    console.log("server***", id);
    const project = await ProjectBuild.findById(id);
    // console.log(project);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (status) project.status = "reject";
    if (file) {
      console.log("serverFile");

      project.mindArUpload = true;
      project.status = "approved";
      console.log("start");

      const fileUri = getDataUri(file);
      console.log("end", fileUri);
      if (project?.targetMind?.public_id) {
        await cloudinary.v2.uploader.destroy(project.targetMind.public_id);
      }
      const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
        resource_type: "auto",
      });
      console.log(myCloud);

      project.targetMind = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    await project.save();
    const user = await User.findById(project?.user);
    const url = `${process.env.FRONTEND_URL}/userdashboard`;
    const message = `
    We're excited to inform you that your project is now ready for viewing! Click on the link below to see the finished product:

${url}

Thank you for choosing us for your project. If you have any questions or need further assistance, please don't hesitate to contact us.

Best regards,
TravelAR
    `;
    await sendEmail(user.email, "Godspeed Project is Ready", message);

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const updateProjectUserController = async (req, res) => {
  try {
    const { status, builder } = req.body;

    const { id } = req.params;

    const project = await ProjectBuild.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (status) project.status = status;
    if (builder) project.builder = builder;
    const a = await project.save();
    res.status(200).send({
      success: true,
      message: "Single Project updated successfully",
      a,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const projectEditController = async (req, res) => {
  try {
    const { file1, file2 } = req.files;
    const {
      isPlay,
      mindArUpload,
      artWorkName,
      width,
      height,
      builder,
      status,
    } = req.body;
    const { id } = req.params;
    const project = await ProjectBuild.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (status) project.status = status;
    if (artWorkName) project.artWorkName = artWorkName;
    if (width) project.width = width;
    if (height) project.height = height;
    if (builder) project.builder = builder;
    if (mindArUpload) project.mindArUpload = mindArUpload;
    if (isPlay) project.isPlay = isPlay;
    if (file1) {
      const fileUri1 = getDataUri(file1[0]);
      if (project?.content?.public_id) {
        await cloudinary.v2.uploader.destroy(project.content.public_id);
      }

      const myCloud1 = await cloudinary.v2.uploader.upload(fileUri1.content, {
        resource_type: "video",
      });
      project.content = {
        public_id: myCloud1.public_id,
        url: myCloud1.secure_url,
      };
    }

    if (file2) {
      const fileUri2 = getDataUri(file2[0]);
      if (project?.target?.public_id) {
        await cloudinary.v2.uploader.destroy(project.target.public_id);
      }

      const myCloud2 = await cloudinary.v2.uploader.upload(fileUri2.content);

      project.target = {
        public_id: myCloud2.public_id,
        url: myCloud2.secure_url,
      };
    }

    await project.save();
    //     const user = await User.findById(project?.user);
    //     const url = `${process.env.FRONTEND_URL}/userdashboard`;
    //     const message = `
    //     We're excited to inform you that your project is now ready for viewing! Click on the link below to see the finished product:

    // ${url}

    // Thank you for choosing us for your project. If you have any questions or need further assistance, please don't hesitate to contact us.

    // Best regards,
    // Godspeed
    //     `;
    //     await sendEmail(user.email, "Godspeed Project is Ready", message);

    res.status(200).send({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const projectGetController = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await ProjectBuild.findById(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).send({
      success: true,
      message: "Single project fetched",
      project,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};
export const getAllUserController = async (req, res) => {
  try {
    const user = await User.find({});
    if (!user) {
      res.status(404).send({
        success: false,
        message: "no any user",
      });
    }
    res.status(200).send({
      success: true,
      message: "user is fetched successfully",
      user,
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const changeRoleController = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).send({
        success: false,
        message: "user id is invalid",
      });
    }
    if (user.role === "admin") {
      user.role = "user";
    } else {
      user.role = "admin";
    }
    await user.save();

    res.status(200).send({
      success: true,
      message: "user role is changed",
    });
  } catch (e) {
    res.status(500).send({
      success: false,
      message: "internal server error",
      e,
    });
  }
};

export const getLatestProjectController = async (req, res) => {
  try {
    const latestProject = await User.findOne({ _id: req.user._id })
      .populate("project_report")
      .lean();

    latestProject.project_report.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Get the first element of the sorted array (which will be the element with the latest timestamp)
    const latestProjectReport = latestProject.project_report[0];

    res.json(latestProjectReport);
    // res.json({ project: latestProject });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
