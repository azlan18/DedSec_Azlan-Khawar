import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
    text: string;
}

const Markdown: React.FC<MarkdownProps> = ({ text }) => {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
        </div>
    );
};

export default Markdown; 