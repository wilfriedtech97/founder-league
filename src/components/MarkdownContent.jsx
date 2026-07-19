import ReactMarkdown from 'react-markdown';

const components = {
  h1: (props) => <h1 className="text-base font-bold mt-3 mb-2 text-white" {...props} />,
  h2: (props) => <h2 className="text-sm font-bold mt-3 mb-1.5 text-white" {...props} />,
  h3: (props) => <h3 className="text-sm font-semibold mt-2 mb-1 text-white" {...props} />,
  h4: (props) => <h4 className="text-xs font-semibold mt-2 mb-1 text-white/90" {...props} />,
  p: (props) => <p className="mb-2 leading-relaxed last:mb-0" {...props} />,
  ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1 pl-1" {...props} />,
  ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1 pl-1" {...props} />,
  li: (props) => <li className="leading-relaxed marker:text-white/40" {...props} />,
  strong: (props) => <strong className="font-bold text-white" {...props} />,
  em: (props) => <em className="italic text-white/80" {...props} />,
  code: (props) => <code className="px-1 py-0.5 rounded bg-white/10 text-xs font-mono text-white" {...props} />,
  pre: (props) => <pre className="p-3 rounded-lg bg-black/40 border border-white/10 mb-2 overflow-x-auto text-xs" {...props} />,
  blockquote: (props) => <blockquote className="border-l-2 border-white/20 pl-3 italic text-white/70 mb-2" {...props} />,
  a: (props) => <a className="text-sky-400 underline hover:text-sky-300" target="_blank" rel="noreferrer" {...props} />,
  hr: (props) => <hr className="my-3 border-white/10" {...props} />,
  table: (props) => <table className="w-full mb-2 border-collapse" {...props} />,
  th: (props) => <th className="border border-white/10 px-2 py-1 text-left font-bold text-white bg-white/5" {...props} />,
  td: (props) => <td className="border border-white/10 px-2 py-1" {...props} />,
};

export default function MarkdownContent({ children, className = '' }) {
  return (
    <div className={`text-sm text-white/90 space-y-1.5 ${className}`}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}