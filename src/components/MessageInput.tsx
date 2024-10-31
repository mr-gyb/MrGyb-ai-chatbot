import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  Square,
  Send,
  Headphones,
  Camera,
  Image,
  Folder,
  Video,
  X,
} from "lucide-react";
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  VoiceEmotion,
} from "@heygen/streaming-avatar";
import type { StartAvatarResponse } from "@heygen/streaming-avatar";
import LoadingModal from "./LoadingModal";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isTTSEnabled: boolean;
  toggleTTS: () => void;
  onAIResponse?: (response: string) => void;
}

interface VoiceRecognition extends EventTarget {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  isTTSEnabled,
  toggleTTS,
  onAIResponse,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [stream, setStream] = useState<MediaStream>();
  const [debug, setDebug] = useState<string>();
  const [data, setData] = useState<StartAvatarResponse>();
  const mediaStream = useRef<HTMLVideoElement>(null);
  const avatar = useRef<StreamingAvatar | null>(null);
  const [isUserTalking, setIsUserTalking] = useState(false);
  const [messages, setMessages] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: string; message: string }[]>([]);

  const [aiResponse, setAIResponse] = useState<string>("");

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isFileLoading, setIsFileLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const data = await response.json();
        const aiMessage = data.message;

        setAIResponse(aiMessage);

        if (showAvatarModal && avatar.current) {
          await avatar.current.talk(aiMessage);
        }

        setChatHistory((prevHistory) => [
          ...prevHistory,
          { role: "User", message: message },
          { role: "AI", message: aiMessage },
        ]);

        setMessage("");
        
        onSendMessage(message);
        if (onAIResponse) {
          onAIResponse(aiMessage);
        }
      } catch (error) {
        console.error("Error getting AI response:", error);
      }
    }
  };

  const handleTranscriptionComplete = async (text: string) => {
    setMessage(text);
    if (text.trim()) {
      await handleSend();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);

      mediaRecorderRef.current.ondataavailable = async (event) => {
        const audioBlob = new Blob([event.data], { type: "audio/wav" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Transcription failed");
          }

          const { text } = await response.json();
          await handleTranscriptionComplete(text);
        } catch (error) {
          console.error("Transcription error:", error);
        }
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleToggleTTS = useCallback(() => {
    toggleTTS();
  }, [toggleTTS]);

  const handleCameraClick = () => {
    console.log("Camera clicked");
  };

  const handleImageClick = () => {
    console.log("Image upload clicked");
  };

  const handleFolderClick = () => {
    console.log("📁 Folder clicked - opening file selector");
    fileInputRef.current?.click();
  };

  const handleVideoClick = useCallback(() => {
    console.log("Video button clicked");
    setShowAvatarModal(true);
    startAvatarSession();
  }, []);

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/heygen", { method: "POST" });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch token: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      setDebug(`Token Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return "";
    }
  };

  async function startAvatarSession() {
    console.log("Starting avatar session...");
    const newToken = await fetchAccessToken();
    console.log("Fetched Heygen token");

    avatar.current = new StreamingAvatar({ token: newToken });

    let userSpeech = ""; // Store the user's speech

    // Listen for when the avatar starts talking
    avatar.current.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
      console.log("🎭 Avatar started talking:", e);
    });

    // Listen for when the avatar stops talking
    avatar.current.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
      console.log("🎭 Avatar stopped talking:", e);
    });

    // Listen for stream disconnection
    avatar.current.on(StreamingEvents.STREAM_DISCONNECTED, () => {
      console.log("🔌 Stream disconnected");
    });

    // Listen for user's voice content using the correct event
    avatar.current.on(StreamingEvents.user, (event) => {
      console.log("🎤 Received voice message fragment:", event.detail);
      userSpeech += event.detail.message || "";
      console.log("🎤 Current accumulated speech:", userSpeech);
    });

    // Process the complete speech when user stops talking
    avatar.current.on(StreamingEvents.USER_STOP, async () => {
      console.log("🎤 User stopped talking");
      console.log("📝 Complete user speech:", userSpeech);
      setIsUserTalking(false);

      if (userSpeech.trim()) {
        try {
          console.log("🔄 Sending message to OpenAI:", userSpeech);
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userSpeech }),
          });

          if (!response.ok) {
            throw new Error("Failed to get AI response");
          }

          const data = await response.json();
          const aiMessage = data.message;
          console.log("🤖 Received OpenAI response:", aiMessage);

          // Make the avatar speak the AI response
          if (avatar.current) {
            console.log("🎭 Making avatar speak response");
            await avatar.current.talk({ text: aiMessage });
            console.log("🎭 Avatar started speaking response");
          }

          // Update chat history
          setChatHistory(prev => [
            ...prev,
            { role: "User", message: userSpeech },
            { role: "AI", message: aiMessage }
          ]);
          console.log("📝 Updated chat history");

          // Reset the user speech buffer
          userSpeech = "";
          console.log("🔄 Reset speech buffer");
        } catch (error) {
          console.error("❌ Error processing voice input:", error);
        }
      } else {
        console.log("⚠️ No speech content to process");
      }
    });

    // User starts talking
    avatar.current.on(StreamingEvents.USER_START, () => {
      console.log("🎤 User started talking");
      setIsUserTalking(true);
      userSpeech = ""; // Reset the speech buffer when user starts talking
      console.log("🔄 Reset speech buffer for new input");
    });

    // Stream ready event
    avatar.current?.on(StreamingEvents.STREAM_READY, (event) => {
      console.log("🎥 Stream ready, video stream details:", event.detail);
      setStream(event.detail);
    });

    try {
      console.log("🚀 Creating avatar start session...");
      const response = await avatar.current.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: "",
        knowledgeId: "",
        voice: {
          rate: 1.0,
          emotion: VoiceEmotion.EXCITED,
        },
        language: "en",
      });

      console.log("✅ Avatar session created successfully:", response);
      setData(response);
      setStream(response.videoStream);

      console.log("🎤 Starting voice chat...");
      await avatar.current?.startVoiceChat();
      console.log("✅ Voice chat started successfully");
    } catch (error) {
      console.error("❌ Error in avatar session setup:", error);
    }
  }

  const endAvatarSession = async () => {
    console.log("Ending avatar session...");
    try {
      if (avatar.current) {
        await avatar.current.stopAvatar();
        avatar.current = null;
        console.log("Avatar stopped successfully");
      }
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        console.log("Media tracks stopped");
      }
      setStream(undefined);
      setShowAvatarModal(false);
      setMessages("");
      setChatHistory([]);
      console.log("Avatar session cleaned up successfully");
    } catch (error) {
      console.error("Error closing avatar session:", error);
    }
  };

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [stream]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAvatarModal) {
        endAvatarSession();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
      if (showAvatarModal) {
        endAvatarSession();
      }
    };
  }, [showAvatarModal]);

  const handleCloseLoadingModal = () => {
    setShowLoadingModal(false);
  };

  const startVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return;
    }

    // @ts-ignore - WebkitSpeechRecognition is not in TypeScript types
    const recognition = new webkitSpeechRecognition() as VoiceRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map(result => result.transcript)
        .join('');

      if (event.results[0].isFinal) {
        setMessage(transcript);
        
        // Get OpenAI response
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: transcript }),
          });

          if (!response.ok) {
            throw new Error("Failed to get AI response");
          }

          const data = await response.json();
          const aiMessage = data.message;

          // Make Heygen avatar speak the response
          if (avatar.current) {
            await avatar.current.sendMessage(aiMessage);
          }

          // Update chat history
          setChatHistory(prev => [
            ...prev,
            { role: "User", message: transcript },
            { role: "AI", message: aiMessage }
          ]);
        } catch (error) {
          console.error("Error getting AI response:", error);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsFileLoading(true);
    console.log("📄 Files selected:", files);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        console.log(`📎 Attaching file: ${file.name} (${file.type})`);
        formData.append('files', file);
      });

      console.log("🚀 Sending files to API...");
      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process files");
      }

      const data = await response.json();
      console.log("✅ API Response:", data);

      // Update chat history with file upload and AI response
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      setChatHistory(prev => [
        ...prev,
        { role: "User", message: `Uploaded files: ${fileNames}` },
        { role: "AI", message: data.message }
      ]);

      // Clear the message input
      setMessage("");

    } catch (error) {
      console.error("❌ Error processing files:", error);
    } finally {
      setIsFileLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800">
        <button
          onClick={handleCameraClick}
          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Camera size={20} />
        </button>
        <button
          onClick={handleImageClick}
          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Image size={20} />
        </button>
        <button
          onClick={handleFolderClick}
          className={cn(
            "p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            isFileLoading && "opacity-50 cursor-wait"
          )}
          disabled={isFileLoading}
          title="Upload text files"
        >
          <Folder size={20} className={isFileLoading ? "animate-pulse" : ""} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept=".txt,.md,.json,.csv,.doc,.docx,.pdf,.rtf"
          multiple
        />
        <div className="flex-grow flex items-center p-2 border rounded-lg dark:bg-gray-700 dark:text-white">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="flex-grow bg-transparent outline-none"
            disabled={isLoading || isRecording}
          />
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isLoading}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Mic size={20} />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="text-red-500 hover:text-red-600"
            >
              <Square size={20} />
            </button>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading || isRecording || !message}
          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
        <button
          onClick={handleToggleTTS}
          disabled={isLoading || isRecording}
          className={cn(
            "p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200",
            "transition-all duration-300 ease-in-out",
            isTTSEnabled &&
              "bg-blue-100 dark:bg-blue-900 rounded-full shadow-lg"
          )}
        >
          <Headphones
            size={20}
            className={cn(isTTSEnabled && "text-blue-500")}
          />
        </button>
        <button
          onClick={handleVideoClick}
          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Video size={20} />
        </button>
      </div>
      <LoadingModal isOpen={showLoadingModal} onClose={handleCloseLoadingModal} />

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-[80vw] h-[80vh] relative">
            <button
              onClick={() => endAvatarSession()}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            
            <div className="h-[70%] relative">
              {stream ? (
                <video
                  ref={mediaStream}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading avatar...</p>
                    {debug && <p className="text-red-500 mt-2">{debug}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 h-[30%] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Chat History</h3>
              <div className="space-y-2">
                {chatHistory.map((entry, index) => (
                  <div key={index} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <strong>{entry.role}:</strong> {entry.message}
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isListening ? 'Listening...' : 'Voice inactive'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageInput;
