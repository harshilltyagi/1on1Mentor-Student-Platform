import prisma from "../utils/prismaClient.js";

export const saveEditorState = async (req, res) => {
  try {
    const { meetingCode, yjsState, language } = req.body;

    if (!meetingCode || !yjsState) {
      return res
        .status(400)
        .json({ message: "Meeting code and state are required" });
    }

    const bufferState = Buffer.from(yjsState, "base64");

    const editorState = await prisma.editorState.upsert({
      where: { meetingCode },
      update: {
        yjsState: bufferState,
        language: language || "javascript",
      },
      create: {
        meetingCode,
        yjsState: bufferState,
        language: language || "javascript",
      },
    });

    return res.status(200).json({
      message: "Editor state saved",
      editorState,
    });
  } catch (error) {
    console.log("Save editor state error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getEditorState = async (req, res) => {
  try {
    const { meetingCode } = req.params;

    const editorState = await prisma.editorState.findUnique({
      where: { meetingCode },
    });

    if (!editorState) {
      return res.status(404).json({ message: "No saved editor state found" });
    }

    return res.status(200).json({
      meetingCode: editorState.meetingCode,
      yjsState: Buffer.from(editorState.yjsState).toString("base64"),
      language: editorState.language,
    });
  } catch (error) {
    console.log("Get editor state error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
