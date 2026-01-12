interface ToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onTextChange: (newText: string) => void;
  currentText: string;
}

export default function Toolbar({ textareaRef, onTextChange, currentText }: ToolbarProps) {
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentText.substring(start, end);
    const beforeText = currentText.substring(0, start);
    const afterText = currentText.substring(end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // Si du texte est sélectionné, l'entourer avec before et after
      newText = beforeText + before + selectedText + after + afterText;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Sinon, insérer before et after avec le curseur entre les deux
      newText = beforeText + before + after + afterText;
      newCursorPos = start + before.length;
    }

    onTextChange(newText);

    // Restaurer le focus et la position du curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertText('**', '**');
  const formatItalic = () => insertText('*', '*');
  const formatUnderline = () => insertText('<u>', '</u>');
  const formatCode = () => insertText('`', '`');
  const formatHeading = () => insertText('## ', '');
  const formatLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentText.substring(start, end);
    
    if (selectedText) {
      insertText('[', '](url)');
    } else {
      insertText('[texte](url)', '');
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600">
      <button
        onClick={formatBold}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Gras (Ctrl+B)"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={formatItalic}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Italique (Ctrl+I)"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={formatUnderline}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Souligné (Ctrl+U)"
      >
        <span className="underline">U</span>
      </button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <button
        onClick={formatCode}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors font-mono text-sm"
        title="Code"
      >
        {'</>'}
      </button>
      <button
        onClick={formatHeading}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Titre"
      >
        <span className="font-bold">H</span>
      </button>
      <button
        onClick={formatLink}
        className="px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
        title="Lien"
      >
        🔗
      </button>
    </div>
  );
}

