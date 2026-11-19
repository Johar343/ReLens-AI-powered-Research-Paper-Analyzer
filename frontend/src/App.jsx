import {
  createPaperFromAPI,
  createPaperFromHistory,
} from "./utils/paperAdapter";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AnalysisProgressModal from "./components/AnalysisProgressModal";
import { SAMPLE_PAPERS } from "./data/mockData";
import "./App.css";
import { generateAcademicAnswer } from "./data/mockData";
import { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function App() {
  const [currentPaper, setCurrentPaper] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingPaper, setPendingPaper] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const [browserId] = useState(() => {
    let id = localStorage.getItem("relens_browser_id");

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("relens_browser_id", id);
    }

    return id;
  });

  const [historyPapers, setHistoryPapers] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/history?browserId=${encodeURIComponent(browserId)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load paper history.");
        }

        const data = await response.json();

        setHistoryPapers((data.history || []).map(createPaperFromHistory));
      } catch (error) {
        console.error("History loading error:", error);
      }
    };

    loadHistory();
  }, [browserId]);

  const initializeChatForPaper = (paper) => [
    {
      id: `welcome-${paper.id}`,
      sender: "assistant",
      text: `Welcome to **ReLens Research Assistant**. I've analyzed **${paper.title}**. You can now ask questions about its content, methodology, results, and other technical details.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ];

  const handleAskQuestion = async (questionText) => {
    if (!questionText.trim() || isAsking) return;

    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    // Sample papers still use their existing mock answers.
    if (!currentPaper?.pages?.length) {
      const responseText = generateAcademicAnswer(currentPaper, questionText);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: "assistant",
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      return;
    }

    setIsAsking(true);

    try {
      const chatHistory = [...chatMessages, userMsg].map((msg) => ({
        role: msg.sender === "assistant" ? "model" : "user",
        text: msg.text,
      }));

      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pages: currentPaper.pages,
          question: questionText,
          chat_history: chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to generate an answer.");
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: "assistant",
          text: data.answer || "No answer was returned.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error("Question answering error:", error);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-error-${Date.now()}`,
          sender: "assistant",
          text: `I couldn't generate an answer. ${error.message}`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Upload and analyze a real PDF using FastAPI.
  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/extract`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze this PDF.");
      }

      const paper = createPaperFromAPI(data);

      try {
        const saveResponse = await fetch(`${API_BASE_URL}/api/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            browserId,
            filename: data.filename || file.name,
            title: paper.title,
            totalPages: data.total_pages || 1,
            analysis: data,
          }),
        });

        if (!saveResponse.ok) {
          throw new Error("Could not save paper history.");
        }

        const savedData = await saveResponse.json();

        const savedPaper = {
          ...paper,
          id: savedData.id,
        };

        setHistoryPapers((prev) => [savedPaper, ...prev]);
        setCurrentPaper(savedPaper);
      } catch (error) {
        console.error("History saving error:", error);

        // Analysis should still work even if history saving fails.
        setCurrentPaper(paper);
      }

      setChatMessages(initializeChatForPaper(paper));

      setCurrentPaper(paper);
      setChatMessages(initializeChatForPaper(paper));
    } catch (error) {
      console.error("PDF analysis error:", error);

      setErrorMessage(
        error.message || "Something went wrong while analyzing the PDF.",
      );

      window.alert(error.message || "Unable to analyze this PDF.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Existing sample-paper selection remains mock-based.
  const handleSelectSample = (samplePaper) => {
    setPendingPaper(samplePaper);
    setCurrentPaper(samplePaper);
    setChatMessages(initializeChatForPaper(samplePaper));
  };

  const handleSwitchPaperFromDashboard = (paper) => {
    setPendingPaper(paper);
    setCurrentPaper(paper);
    setChatMessages(initializeChatForPaper(paper));
  };

  const handleUploadNew = () => {
    setCurrentPaper(null);
    setPendingPaper(null);
    setErrorMessage("");
  };

  return (
    <div className="relens-app-root">
      {!currentPaper ? (
        <Home
          onUpload={handleUploadFile}
          onSelectSample={handleSelectSample}
          samplePapers={SAMPLE_PAPERS}
          isAnalyzing={isAnalyzing}
        />
      ) : (
        <Dashboard
          paper={currentPaper}
          samplePapers={SAMPLE_PAPERS}
          onSelectPaper={handleSwitchPaperFromDashboard}
          onUploadNew={handleUploadNew}
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          onAskQuestion={handleAskQuestion}
          isAsking={isAsking}
          historyPapers={historyPapers}
        />
      )}

      {isAnalyzing && (
        <AnalysisProgressModal
          paperTitle={pendingPaper?.title || "Processing PDF"}
        />
      )}
    </div>
  );
}
