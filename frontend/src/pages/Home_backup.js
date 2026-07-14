import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegCommentDots,
  FaMicrophone,
  FaFileImage,
  FaLanguage,
  FaBrain, FaChartLine,
  FaMountain,
  FaSitemap,
  FaVideo,
} from "react-icons/fa";
import "./home.css";
import marbleBg from "./marble_bg.png";

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Chatbot",
      icon: <FaRegCommentDots size={40} />,
      path: "/chat",
      desc: "Talk to your AI assistant",
    },
    {
      title: "Text Translator",
      icon: <FaLanguage size={40} />,
      path: "/text",
      desc: "Translate text instantly",
    },
    {
      title: "Image Translator",
      icon: <FaFileImage size={40} />,
      path: "/image",
      desc: "Extract and translate text from images",
    },
    {
      title: "Voice Translator",
      icon: <FaMicrophone size={40} />,
      path: "/voice",
      desc: "Speak and translate in real-time",
    },
    {
      title: "Real-Time Chat",
      icon: <FaRegCommentDots size={40} />,
      path: "/RealTimeChat",
      desc: "Chat with your friends live",
    },
    {
      title: "AI Text Summarizer",
      icon: <FaBrain size={40} />,
      path: "/summarizer",
      desc: "Summarize long text instantly",
    },
    {
      title: "AI Image Generator",
      icon: <FaMountain size={40} />,
      path: "/imagegen",
      desc: "Create stunning AI images with stone-breathing power",
    },
    {
      title: "AI Concept Mapper",
      icon: <FaSitemap size={40} />,
      path: "/conceptmapper",
      desc: "Visualize topics as a glowing knowledge graph",
    },
    {
      title: "AI Data Intelligence Hub",
      icon: <FaChartLine size={40} />,
      path: "/dataintelligence",
      desc: "Upload datasets to uncover insights, trends, and AI-powered analytics",
    },

  ];

  return (
    <div
      className="home-container"
      style={{
        backgroundImage: `url(${marbleBg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      {/* 🌟 Title Section with Logo */}
      <div className="title-container">
        <img src="/logo.png" alt="TransBot Logo" className="logo" />
        <h1 className="title-text">AI ECOSYSTEM</h1>
      </div>

      <p className="subtitle">A Unified Intelligent Multi-Tool Platform</p>

      {/* 🧱 Card Layout */}
      <div className="card-grid">
        {cards.map((card, index) => (
          <div
            key={index}
            className="card"
            onClick={() => navigate(card.path)}
          >
            {/* Ornamental corners */}
            <span className="corner tl"></span>
            <span className="corner br"></span>

            {/* Card content */}
            <div className="icon">{card.icon}</div>
            <h2>{card.title}</h2>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
