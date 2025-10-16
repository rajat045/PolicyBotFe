import React, { useState, useRef } from "react";
import "./PresentationViewer.css";
import { Maximize2, Minimize2, FileText } from "lucide-react";
import ChatBot from './../ChatBot/ChatBot';

export default function PresentationViewer({ file = "/Faq-Chatbot.pdf" }) {
  const [activeTab, setActiveTab] = useState("slides");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  // toggle fullscreen only for iframe
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeRef.current.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // sample documents for “Documents” tab
  const documents = [
    { name: "AI_FAQ_Bot_Architecture.pdf", path: "/AI_FAQ_Bot_Architecture.pdf" },
    { name: "LangChain_Integration_Guide.pdf", path: "/LangChain_Integration_Guide.pdf" },
    { name: "Employee_FAQ_List.docx", path: "/Employee_FAQ_List.docx" },
  ];

  return (
    <div className="presentation-container">
      <div className="presentation-card">
        <div className="presentation-header">
          <h2>PolicyGenie ChatBot</h2>
          <button className="fullscreen-btn" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>

        <div className="presentation-card-content">
          {/* Tabs */}
          <div className="tabs-list">
            <button
              className={`tab-trigger ${activeTab === "slides" ? "active" : ""}`}
              onClick={() => setActiveTab("slides")}
            >
              Slides
            </button>
            <button
              className={`tab-trigger ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
         
            <button
              className={`tab-trigger ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              Documents
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "slides" && (
              <iframe
                ref={iframeRef}
                key={file}
                src={`${file}#toolbar=0&navpanes=0&scrollbar=0`} // disables PDF toolbar
                title="Presentation Slides"
                className="slides-frame"
                allowFullScreen
              />
            )}

            {activeTab === "overview" && (
              <div>
                <h3>Project Overview</h3>
                <p>
                  This presentation covers the architecture, implementation, and deployment
                  of the AI FAQ Bot. It includes frontend-backend integration, LangChain setup,
                  and CI/CD workflow.
                </p>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="documents-tab">
                <h3>Project Documents</h3>
                <p>Drag and drop these into your bot when needed:</p>
                <div className="documents-list">
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="document-item"
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/plain", doc.path)}
                    >
                      <FileText size={20} />
                      <a href={doc.path} target="_blank" rel="noopener noreferrer">
                        {doc.name}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
