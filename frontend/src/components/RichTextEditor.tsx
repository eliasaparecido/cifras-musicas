import { useRef, useEffect } from 'react';
import { Bold } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleBold = () => {
    document.execCommand('bold', false);
    editorRef.current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Obter texto do clipboard
    const text = e.clipboardData.getData('text/plain');
    const html = e.clipboardData.getData('text/html');
    
    // Se tiver HTML, processar para manter apenas negrito
    if (html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Processar nós para manter apenas <b>, <strong> e texto
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || '';
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();
          const content = Array.from(node.childNodes)
            .map(child => processNode(child))
            .join('');
          
          if (tagName === 'b' || tagName === 'strong') {
            return `<b>${content}</b>`;
          }
          if (tagName === 'br') {
            return '\n';
          }
          if (tagName === 'p' || tagName === 'div') {
            return content + '\n';
          }
          return content;
        }
        
        return '';
      };
      
      const processedText = Array.from(tempDiv.childNodes)
        .map(node => processNode(node))
        .join('')
        .replace(/\n+$/, ''); // Remove quebras extras no final
      
      document.execCommand('insertHTML', false, processedText);
    } else {
      // Se for texto puro, inserir normalmente
      document.execCommand('insertText', false, text);
    }
    
    handleInput();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-2">
        <button
          type="button"
          onClick={toggleBold}
          disabled={disabled}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
          title="Negrito (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        <div className="text-xs text-gray-500 self-center ml-2">
          Dica: Selecione o texto e clique no <b>B</b> para deixar em negrito
        </div>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onPaste={handlePaste}
        className="p-3 min-h-[300px] max-h-[600px] overflow-y-auto focus:outline-none font-mono text-sm whitespace-pre-wrap"
        style={{ 
          fontFamily: 'Courier New, monospace',
          tabSize: 4,
        }}
        data-placeholder={placeholder}
      />
      
      <style>{`
        [contentEditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
        }
        [contentEditable] {
          outline: none;
        }
      `}</style>
    </div>
  );
}
