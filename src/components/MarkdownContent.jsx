import ReactMarkdown from 'react-markdown';

const components = {
  h1: (props) => <h1 className="text-base font-bold mt-4 mb-2 text-white" {...props} />,
  h2: (props) => <h2 className="text-sm font-bold mt-3.5 mb-2 text-white border-b border-white/10 pb-1.5" {...props} />,
  h3: (props) => <h3 className="text-sm font-semibold mt-2.5 mb-1.5 text-white/95" {...props} />,
  h4: (props) => <h4 className="text-xs font-bold mt-2 mb-1 text-white/80 uppercase tracking-wide" {...props} />,
  p: (props) => <p className="mb-2.5 leading-relaxed last:mb-0 text-white/90" {...props} />,
  ul: (props) => <ul className="list-disc list-outside mb-2.5 space-y-1.5 pl-5 marker:text-white/40" {...props} />,
  ol: (props) => <ol className="list-decimal list-outside mb-2.5 space-y-1.5 pl-5 marker:text-amber-400 marker:font-bold" {...props} />,
  li: (props) => <li className="leading-relaxed text-white/85 pl-1" {...props} />,
  strong: (props) => <strong className="font-bold text-white" {...props} />,
  em: (props) => <em className="italic text-white/80" {...props} />,
  code: (props) => <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono text-amber-300" {...props} />,
  pre: (props) => <pre className="p-3 rounded-lg bg-black/40 border border-white/10 mb-2.5 overflow-x-auto text-xs" {...props} />,
  blockquote: (props) => <blockquote className="border-l-2 border-amber-400/40 pl-3 italic text-white/70 mb-2.5" {...props} />,
  a: (props) => <a className="text-sky-400 underline hover:text-sky-300 break-words" target="_blank" rel="noreferrer" {...props} />,
  hr: (props) => <hr className="my-3 border-white/10" {...props} />,
  table: (props) => <div className="overflow-x-auto mb-2.5"><table className="w-full border-collapse text-xs" {...props} /></div>,
  th: (props) => <th className="border border-white/10 px-2.5 py-1.5 text-left font-bold text-white bg-white/5" {...props} />,
  td: (props) => <td className="border border-white/10 px-2.5 py-1.5 text-white/80" {...props} />,
};

export default function MarkdownContent({ children, className = '' }) {
  return (
    <div className={`text-sm text-white/90 space-y-2 ${className}`}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}