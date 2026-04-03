import prisma from "../utils/prismaClient.js";

export const createSession = async (req, res) => {
  try {
    const mentorId = req.user.userId;

    const meetingCode = `MEET-${Date.now()}`;

    const session = await prisma.session.create({
      data: {
        meetingCode,
        mentorId,
        status: "waiting",
      },
    });

    return res.status(201).json({
      message: "Session created successfully",
      session,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { meetingCode } = req.body;
    const studentId = req.user.userId;

    if (!meetingCode) {
      return res.status(400).json({ message: "Meeting code is required" });
    }

    const session = await prisma.session.findUnique({
      where: { meetingCode },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.status === "ended") {
      return res.status(400).json({ message: "Session has ended" });
    }

    return res.status(200).json({
      message: "Session joined successfully",
      session,
      studentId,
    });
  } catch (error) {
    console.log("Join session error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
