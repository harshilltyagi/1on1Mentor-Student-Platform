import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const YJS_URL = import.meta.env.VITE_YJS_URL;

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function Room() {
  const { meetingCode } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [language, setLanguage] = useState("javascript");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [remoteUserName, setRemoteUserName] = useState("Other User");

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);
  const editorRef = useRef(null);

  const socketRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    if (!token || !user) {
      navigate("/");
    }
  }, [token, user, navigate]);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(YJS_URL, meetingCode, ydoc);
    providerRef.current = provider;

    provider.awareness.setLocalStateField("user", {
      name: user?.name || "Anonymous",
      color: user?.role === "mentor" ? "blue" : "green",
    });

    const updateUsers = () => {
      const states = Array.from(provider.awareness.getStates().values());
      const users = states.map((state) => state.user).filter(Boolean);
      setOnlineUsers(users);
    };

    provider.awareness.on("change", updateUsers);

    const loadSavedState = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/editor/${meetingCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data.language) setLanguage(data.language);

        if (data.yjsState) {
          const binary = Uint8Array.from(atob(data.yjsState), (c) =>
            c.charCodeAt(0),
          );
          Y.applyUpdate(ydoc, binary);
        }
      } catch (error) {
        console.log("Load editor state error:", error);
      }
    };

    loadSavedState();

    return () => {
      provider.awareness.off("change", updateUsers);
      bindingRef.current?.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [meetingCode, token, user?.name, user?.role]);

  useEffect(() => {
    const otherUser = onlineUsers.find((u) => u.name !== user?.name);
    if (otherUser) {
      setRemoteUserName(otherUser.name);
    }
  }, [onlineUsers, user?.name]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    const startMedia = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = localStream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (error) {
        console.log("Media access error:", error);
      }
    };

    const createPeerConnection = () => {
      if (peerConnectionRef.current) {
        return peerConnectionRef.current;
      }

      const pc = new RTCPeerConnection(rtcConfig);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            roomId: meetingCode,
            candidate: event.candidate,
          });
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    };

    startMedia().then(() => {
      socketRef.current.emit("join-room", {
        roomId: meetingCode,
        userName: user?.name,
        role: user?.role,
      });
    });

    socketRef.current.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("user-joined", async ({ userName }) => {
      if (userName) {
        setRemoteUserName(userName);
      }

      try {
        const pc = createPeerConnection();

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit("offer", {
          roomId: meetingCode,
          offer,
        });
      } catch (error) {
        console.log("Offer error:", error);
      }
    });

    socketRef.current.on("offer", async ({ offer, userName }) => {
      try {
        if (userName) {
          setRemoteUserName(userName);
        }

        const pc = createPeerConnection();

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socketRef.current.emit("answer", {
          roomId: meetingCode,
          answer,
        });
      } catch (error) {
        console.log("Answer error:", error);
      }
    });

    socketRef.current.on("answer", async ({ answer }) => {
      try {
        const pc = createPeerConnection();
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.log("Set answer error:", error);
      }
    });

    socketRef.current.on("ice-candidate", async ({ candidate }) => {
      try {
        const pc = createPeerConnection();

        if (candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.log("ICE candidate error:", error);
      }
    });

    socketRef.current.on("mentor-left", () => {
      alert("Mentor left the session");
      navigate("/dashboard");
    });

    return () => {
      socketRef.current?.disconnect();

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [meetingCode, navigate, user?.name, user?.role]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    const yText = ydocRef.current.getText("monaco");

    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      providerRef.current.awareness,
    );
  };

  const handleSave = async () => {
    try {
      const update = Y.encodeStateAsUpdate(ydocRef.current);
      const base64State = btoa(String.fromCharCode(...update));

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/editor/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: ` Bearer ${token}`,
          },
          body: JSON.stringify({
            meetingCode,
            yjsState: base64State,
            language,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Save failed");
        return;
      }

      alert("Editor state saved");
    } catch (error) {
      console.log("Save error:", error);
      alert("Save failed");
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    socketRef.current.emit("send-message", {
      roomId: meetingCode,
      message: input,
      user: user?.name,
    });

    setInput("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleLeaveRoom = () => {
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#1f2937",
          padding: "12px 16px",
          borderRadius: "10px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>1-to-1 Mentor Room</h2>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#9ca3af" }}
          >
            Room ID: {meetingCode} | User: {user?.name}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSave}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Save Code
          </button>

          <button
            onClick={handleLeaveRoom}
            style={{
              background: "#374151",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Leave Room
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Video Call</h3>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <div>
                <p style={{ marginBottom: "8px" }}>{user?.name || "You"}</p>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: "280px",
                    height: "180px",
                    background: "black",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <p style={{ marginBottom: "8px" }}>{remoteUserName}</p>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: "280px",
                    height: "180px",
                    background: "black",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          >
            <label style={{ marginRight: "10px" }}>Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "6px",
                background: "#374151",
                color: "white",
                border: "1px solid #4b5563",
              }}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            <Editor
              height="500px"
              language={language}
              defaultValue="// Start coding..."
              theme="vs-dark"
              onMount={handleEditorDidMount}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Online Users</h3>
            {onlineUsers.length === 0 ? (
              <p style={{ color: "#9ca3af" }}>No users online</p>
            ) : (
              onlineUsers.map((u, i) => (
                <div key={i} style={{ marginBottom: "8px", color: "white" }}>
                  {u.name}
                </div>
              ))
            )}
          </div>

          <div
            style={{
              background: "#1f2937",
              padding: "12px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              height: "500px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Chat</h3>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid #374151",
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "10px",
                background: "#111827",
              }}
            >
              {messages.length === 0 ? (
                <p style={{ color: "#9ca3af" }}>No messages yet</p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "10px",
                      padding: "8px",
                      borderRadius: "8px",
                      background:
                        msg.user === user?.name ? "#2563eb" : "#374151",
                    }}
                  >
                    <strong>{msg.user}</strong>
                    <div>{msg.message}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type message..."
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  background: "#374151",
                  color: "white",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
