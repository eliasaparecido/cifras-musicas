import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon } from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        hardBreak: {
          keepMarks: false,
        },
      }),
      Underline,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      // Preservar espaços múltiplos convertendo para &nbsp;
      let html = editor.getHTML();
      
      // Converter múltiplos espaços em &nbsp; para preservar alinhamento
      html = html.replace(/ {2,}/g, (match) => {
        return '&nbsp;'.repeat(match.length);
      });
      
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3 min-h-[300px] max-h-[600px] overflow-y-auto font-mono text-sm',
        style: 'font-family: "Courier New", monospace; white-space: pre-wrap; tab-size: 4;',
      },
      transformPastedHTML(html) {
        // Preservar espaços ao colar
        return html.replace(/ {2,}/g, (match) => {
          return '&nbsp;'.repeat(match.length);
        });
      },
      transformPastedText(text) {
        // Preservar espaços ao colar texto puro
        return text.replace(/ {2,}/g, (match) => {
          return '\u00A0'.repeat(match.length); // Non-breaking space
        });
      },
    },
  });

  // Atualizar conteúdo quando value mudar externamente
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Converter &nbsp; de volta para espaços normais ao carregar
      let content = value;
      if (content && !content.includes('&nbsp;')) {
        // Se for conteúdo antigo (texto puro), converter espaços múltiplos
        content = content.replace(/ {2,}/g, (match) => {
          return '&nbsp;'.repeat(match.length);
        });
      }
      editor.commands.setContent(content);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 px-3 py-2 flex gap-2 items-center">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={18} />
        </button>
        
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className={`p-1.5 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          }`}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1" />

        <div className="text-xs text-gray-500 self-center">
          Dica: Selecione o texto e use os botões ou <b>Ctrl+B</b> para negrito, <i>Ctrl+I</i> para itálico
        </div>
      </div>
      
      {/* Editor */}
      <div className="relative">
        {editor.isEmpty && placeholder && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none font-mono text-sm">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      
      <style>{`
        .ProseMirror {
          min-height: 300px;
          max-height: 600px;
          overflow-y: auto;
          padding: 0.75rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          white-space: pre-wrap;
          tab-size: 4;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p {
          margin: 0;
        }
        
        .ProseMirror strong,
        .ProseMirror b {
          font-weight: bold;
        }
        
        .ProseMirror em,
        .ProseMirror i {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
