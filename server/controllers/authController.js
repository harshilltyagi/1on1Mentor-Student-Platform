import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const userSign = async (req, res) => {
  try {
    // Retrive data from frontend

    const { name, email, password, role } = req.body;

    //validate If any form field is missing or not
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Required data is missing" });

    //validate user is existed or not
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser)
      return res.status(400).json({ message: "User is already exists" });

    //Bcrypt Password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add To Database
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: hashedPassword,
        role: role,
      },
    });
    res.status(200).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validate If any form field is missing or not
    if (!email || !password)
      return res.status(400).json({ message: "Required data is missing" });

    //validate user by check user email is saved in database
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentails" });
    }
    const matchPassword = await bcrypt.compare(password, user.passwordHash);
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid credentails" });
    }
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return res
      .status(200)
      .json({ message: "User login successfully", token, user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
