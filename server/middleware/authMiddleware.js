import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //Check authorization headers
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Check Json web token here

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
