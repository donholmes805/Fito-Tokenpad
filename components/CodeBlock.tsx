import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

interface CodeBlockProps {
  code: string;
  isLoading: boolean;
  error: string;
  tokenName?: string;
  loadingText?: string;
}

function CodeBlock({ code, isLoading, error, tokenName, loadingText = "Generating your smart contract..." }: CodeBlockProps): React.ReactNode {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    if (copyStatus === 'copied') {
      const timer = setTimeout(() => setCopyStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyStatus]);
  
  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    }
  };

  const handleSave = () => {
    if (!code) return;

    // Sanitize the token name for the filename, defaulting to 'Token.sol'
    const filename = tokenName 
      ? `${tokenName.replace(/[^a-zA-Z0-9]/g, '') || 'Token'}.sol`
      : 'Token.sol';

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
            <Spinner />
            <p className="mt-4 text-lg font-medium text-slate-600">{loadingText}</p>
            <p className="text-sm text-slate-500">The AI is thinking. This may take a moment.</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  if (!code) {
    return null;
  }
  
  return (
    <div>
        <h3 className="text-lg font-medium text-slate-800">Generated Solidity Code</h3>
        <p className="mt-1 text-sm text-slate-500">Review the code below and deploy using your favorite tools like Remix or Hardhat.</p>
        <div className="mt-4 relative">
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                    onClick={handleSave}
                    title="Save as .sol file"
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                >
                    Save File
                </button>
                <button
                    onClick={handleCopy}
                    title="Copy to clipboard"
                    className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                >
                    {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 pt-12 bg-slate-800 text-white rounded-lg overflow-x-auto text-sm leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    </div>
  );
}

export default CodeBlock;
