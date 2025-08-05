# DocGPT - AI-Powered Document Search and Query System

DocGPT is a full-stack web application that allows users to upload PDF and DOCX documents, extract text content, generate embeddings, and perform intelligent searches using various AI models. The system leverages open ai, llama3 , serp api technologies to provide accurate and context-aware answers to user queries based on uploaded documents or web search results.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running with Docker](#running-with-docker)
  - [Running Locally](#running-locally)
  - [API Endpoints](#api-endpoints)
- [Frontend Setup](#frontend-setup)
  - [Installation](#installation-1)
  - [Running Dev Server](#running-dev-server)
  - [Building for Production](#building-for-production)
  - [Running with Docker](#running-with-docker-1)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Features

- **Document Upload**: Upload PDF and DOCX files for processing
- **Text Extraction**: Automatically extract text content from uploaded documents
- **Intelligent Chunking**: Split documents into manageable chunks for processing
- **Embedding Generation**: Generate semantic embeddings using Sentence Transformers
- **Vector Storage**: Store document embeddings in Pinecone vector database
- **Multi-Model Search**: Query documents or web using Llama3, Gemini, or SerpAPI
- **UI**: Modern React-based interface with flow diagrams for visualization

## Technologies Used

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - High-performance web framework
- [LangChain](https://www.langchain.com/) - Framework for developing LLM applications
- [Sentence Transformers](https://www.sbert.net/) - Generate sentence embeddings
- [Pinecone](https://www.pinecone.io/) - Vector database for similarity search
- [Google Generative AI](https://ai.google.dev/) - Gemini API integration
- [Groq](https://groq.com/) - Llama3 API integration
- [SerpAPI](https://serpapi.com/) - Web search API integration
- [Docker](https://www.docker.com/) - Containerization platform
- [Prometheus](https://prometheus.io/) - Genrating metrics
- [Grafana](https://grafana.com/) - Building Visualizations

### Frontend
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [React Flow](https://reactflow.dev/) - Library for building node-based UIs
- [React Canvas State](https://www.npmjs.com/package/reactflow-canvas-store) - State Management for React Flow
- [Docker](https://www.docker.com/) - Containerization platform

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js >= 16.x
- Python >= 3.8
- Docker (optional, for containerized deployment)
- API keys for:
  - Pinecone
  - Google Generative AI (Gemini)
  - Groq (Llama3)
  - SerpAPI (for web search)

## Backend Setup

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Environment Variables

Create a `.env` file in the `server` directory with the following variables:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
PINECONE_ENVIRONMENT=your_pinecone_environment
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
SERPAPI_API_KEY=your_serpapi_api_key  # Optional
```

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t docgpt-backend .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 --env-file .env docgpt-backend
   ```

### Running Locally

1. Navigate to the server directory and activate the virtual environment:
   ```bash
   cd server
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   The backend will be available at `http://localhost:8000`.

### API Endpoints

- `GET /` - Health check endpoint
- `POST /upload` - Upload PDF or DOCX files for processing
- `POST /search` - Search documents or web with query and model selection

## Frontend Setup

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Dev Server

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`.

### Building for Production

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Preview the production build:
   ```bash
   npm run preview
   ```

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t docgpt-frontend .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:80 docgpt-frontend
   ```

## Usage

1. Start both the backend and frontend servers
2. Open the frontend in your browser (http://localhost:5173)
3. Upload PDF or DOCX documents using the upload interface
4. Wait for documents to be processed and embeddings to be generated
5. Use the search interface to query documents or the web
6. Select the desired AI model (Llama3, Gemini, or SerpAPI) for answering queries

