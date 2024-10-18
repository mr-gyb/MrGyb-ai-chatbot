import React, { useState, useRef, useCallback } from "react";
import {
  Mic,
  Square,
  Send,
  Headphones,
  Camera,
  Image,
  Folder,
  Video,
} from "lucide-react";
import LoadingModal from "./LoadingModal"; // Import the new LoadingModal component
import { cn } from "@/lib/utils"; // Assuming you have a utility function for class names

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isTTSEnabled: boolean;
  toggleTTS: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  isTTSEnabled,
  toggleTTS,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false); // New state for loading modal
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
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
        // TODO: Implement API call to OpenAI Whisper for transcription
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
          setMessage(text);
        } catch (error) {
          console.error("Transcription error:", error);
          // Display error message to user
        }
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      // Display error message to user
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

  // Add new handler functions for the new icons (implement these as needed)
  const handleCameraClick = () => {
    // Implement camera functionality
    console.log("Camera clicked");
  };

  const handleImageClick = () => {
    // Implement image upload functionality
    console.log("Image upload clicked");
  };

  const handleFolderClick = () => {
    // Implement folder/file selection functionality
    console.log("Folder clicked");
  };

  const handleVideoClick = useCallback(() => {
    setShowLoadingModal(true);
    setTimeout(() => {
      setShowLoadingModal(false);
      // Implement your video call logic here
      console.log("Video call initiated");
    }, 2000);
  }, []);

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
          className="p-2 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Folder size={20} />
        </button>
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
      <LoadingModal isOpen={showLoadingModal} />
    </>
  );
};

export default MessageInput;
