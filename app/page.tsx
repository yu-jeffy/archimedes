"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-monokai';
import UploadImage from '../components/uploadImage';
import ReactMarkdown from 'react-markdown';

const LatexPreview = dynamic(() => import('react-katex'), { ssr: false });

export default function Home() {
  const [problemText, setProblemText] = useState<string>("");
  const [latexExpression, setLatexExpression] = useState<string>("\\frac{a}{b}");
  const [concepts, setConcepts] = useState<string>("");
  const [latexSolutionGPT4o, setLatexSolutionGPT4o] = useState<string>("");
  const [explainMessageGPT4o, setExplainMessageGPT4o] = useState<string>("");
  const [solutionGPTo1, setSolutionGPTo1] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
  const [loadingConcepts, setLoadingConcepts] = useState<boolean>(false);
  const [loadingSolution4o, setLoadingSolution4o] = useState<boolean>(false);
  const [loadingSolutiono1, setLoadingSolutiono1] = useState<boolean>(false);

  const handleImageParsed = (parsedText: string) => {
    try {
      const parsedContent = JSON.parse(parsedText);
      setProblemText(parsedContent.problemText);
      setLatexExpression(parsedContent.latexExpression);
    } catch (error) {
      console.error('Error parsing response content:', error);
    }
  };

  const fetchConcepts = async () => {
    setLoadingConcepts(true);
    try {
      const response = await fetch('/api/gptFindConcepts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latexEquation: latexExpression, problemText }),
      });

      const data = await response.json();
      setConcepts(data);
    } catch (error) {
      console.error('Error fetching concepts:', error);
    } finally {
      setLoadingConcepts(false);
    }
  };

  const fetchSolution = async () => {
    if (selectedModel === 'gpt-4o') {
      setLoadingSolution4o(true);
    } else {
      setLoadingSolutiono1(true);
    }

    try {
      const endpoint = selectedModel === 'gpt-4o' ? '/api/gptSolve4o' : '/api/gptSolveo1';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latexEquation: latexExpression, problemText: problemText }),
      });

      const data = await response.json();
      if (selectedModel === 'gpt-4o') {
        setLatexSolutionGPT4o(data.latexSolution);
        setExplainMessageGPT4o(data.explainMessage);
      } else {
        setSolutionGPTo1(data.solution);
      }
    } catch (error) {
      console.error('Error fetching solution:', error);
    } finally {
      if (selectedModel === 'gpt-4o') {
        setLoadingSolution4o(false);
      } else {
        setLoadingSolutiono1(false);
      }
    }
  };

  return (
    <div className="flex h-screen bg-black text-white p-4">
      {/* Left Panel */}
      <div className="w-1/2 pr-2">
        <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
          <h2 className="text-xl font-bold mb-2">Image Upload</h2>
          <UploadImage onImageParsed={handleImageParsed} />
          
          <h2 className="text-xl font-bold mt-4 mb-2">Problem Text</h2>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            className="bg-gray-800 p-2 rounded-lg w-full h-32"
          />
          
          <h2 className="text-xl font-bold mt-4 mb-2">Problem LaTeX Editor</h2>
          <AceEditor
            mode="latex"
            theme="monokai"
            value={latexExpression}
            onChange={(value) => setLatexExpression(value)}
            name="latex_editor"
            editorProps={{ $blockScrolling: true }}
            width="100%"
            height="150px"
            className="rounded"
          />
          
          <h2 className="text-xl font-bold mt-4 mb-2">Problem Preview</h2>
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto flex-grow">
            <BlockMath>{latexExpression}</BlockMath>
          </div>
        </div>
      </div>
      
      {/* Right Panel */}
      <div className="w-1/2 pl-2">
        <div className="bg-gray-900 rounded-lg p-4 h-full flex flex-col">
          <label className="text-lg font-bold mb-2">Select Model:</label> 
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-white text-black font-bold py-2 px-4 rounded-full mb-4 w-full cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-o1">GPT-o1</option>
          </select>
          
          {selectedModel === 'gpt-4o' && (
            <div className="mb-4">
              <button
                onClick={fetchConcepts}
                className="bg-white text-black font-bold py-2 px-4 rounded-full w-full hover:bg-gray-200 transition-colors mb-2"
                disabled={loadingConcepts}
              >
                {loadingConcepts ? 'Loading...' : 'Explain Concepts'}
              </button>
              {concepts && (
                <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
                  <h3 className="text-lg font-bold mb-2">Identified Concepts</h3>
                  <p>{concepts}</p>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={fetchSolution}
            className="bg-white text-black font-bold py-2 px-4 rounded-full mb-4 w-full hover:bg-gray-200 transition-colors"
            disabled={selectedModel === 'gpt-4o' ? loadingSolution4o : loadingSolutiono1}
          >
            {selectedModel === 'gpt-4o' ? (loadingSolution4o ? 'Loading...' : 'Solve Equation with GPT-4o') : (loadingSolutiono1 ? 'Loading...' : 'Solve Equation with GPT-o1')}
          </button>
          
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto flex-grow">
            {selectedModel === 'gpt-4o' ? (
              <>
                <h2 className="text-xl font-bold mb-2">Solution Preview</h2>
                <BlockMath>{latexSolutionGPT4o}</BlockMath>
                <h3 className="text-lg font-bold mt-4 mb-2">Explanation</h3>
                <p>{explainMessageGPT4o}</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-2">Solution (GPT-o1)</h2>
                <ReactMarkdown>{solutionGPTo1}</ReactMarkdown>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}