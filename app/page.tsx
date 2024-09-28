"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-latex';
import 'ace-builds/src-noconflict/theme-github';
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
    }
  };

  const fetchSolutionGPT4o = async () => {
    try {
      const response = await fetch('/api/gptSolve4o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latexEquation: latexExpression, problemText: problemText }),
      });

      const data = await response.json();
      setLatexSolutionGPT4o(data.latexSolution);
      setExplainMessageGPT4o(data.explainMessage);
    } catch (error) {
      console.error('Error fetching solution:', error);
    }
  };

  const fetchSolutionGPTo1 = async () => {
    try {
      const response = await fetch('/api/gptSolveo1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latexEquation: latexExpression, problemText: problemText }),
      });

      const data = await response.json();
      setSolutionGPTo1(data.solution);
    } catch (error) {
      console.error('Error fetching solution:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>

      {/* Image Upload */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Image Upload</h2>
        <UploadImage onImageParsed={handleImageParsed} />
      </div>

      <h1>Question Preview</h1>

      {/* Problem Text Editor and Preview */}
      <div style={{ marginTop: '2rem' }}>
        <h2>Problem Text Editor</h2>
        <textarea
          value={problemText}
          onChange={(e) => setProblemText(e.target.value)}
          style={{ width: '100%', height: '200px', color: 'black' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* LaTeX Editor */}
        <div style={{ width: '50%' }}>
          <h2>Editor</h2>
          <AceEditor
            mode="latex"
            theme="github"
            value={latexExpression}
            onChange={(value) => setLatexExpression(value)}
            name="latex_editor"
            editorProps={{ $blockScrolling: true }}
            height="200px"
            width="100%"
          />
        </div>

        {/* LaTeX Preview */}
        <div style={{ width: '50%' }}>
          <h2>Preview</h2>
          <div style={{ minHeight: '200px', padding: '10px', border: '1px solid #ddd' }}>
            <BlockMath>{latexExpression}</BlockMath>
          </div>
        </div>
      </div>

      {/* Fetch Concepts Button */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={fetchConcepts}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Explain Concepts
        </button>
      </div>

      {/* Concepts Display */}
      {concepts && (
        <div style={{
          marginTop: '2rem',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '10px',
          backgroundColor: 'black',
        }}>
          <h2>Identified Concepts</h2>
          <p>{concepts}</p>
        </div>
      )}

      {/* Fetch Solution Button */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={fetchSolutionGPT4o}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Solve Equation (GPT-4o)
        </button>
      </div>

      {/* Solution LaTeX Editor and Preview */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>

        <div style={{ width: '100%' }}>
          <h2>Solution Preview</h2>
          <div style={{ minHeight: '200px', padding: '10px', border: '1px solid #ddd' }}>
            <BlockMath>{latexSolutionGPT4o}</BlockMath>
          </div>
          <div style={{ marginTop: '1rem', padding: '10px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9', color: 'black' }}>
            <h3>Explanation</h3>
            <p>{explainMessageGPT4o}</p>
          </div>
        </div>
      </div>

      {/* Fetch Solution GPT-o1 Button */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={fetchSolutionGPTo1}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Solve Equation (GPT-o1)
        </button>
      </div>

      {/* Solution GPT-o1 Display */}
      {solutionGPTo1 && (
        <div style={{
          marginTop: '2rem',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9',
          color: 'black',
        }}>
          <h2>Solution (GPT-o1)</h2>
          <ReactMarkdown>{solutionGPTo1}</ReactMarkdown>
        </div>
      )}

    </div>
  );
}