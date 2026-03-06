import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import {
  Box, Paper, IconButton, Divider, Tooltip,
  FormControl, FormHelperText, InputLabel
} from '@mui/material';
import {
  FormatBold, FormatItalic, FormatUnderlined, StrikethroughS,
  FormatListBulleted, FormatListNumbered, FormatQuote,
  Code, HorizontalRule, Link as LinkIcon,
  Undo, Redo,
  LooksOne, LooksTwo, Looks3
} from '@mui/icons-material';

const editorStyles = {
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  transition: 'border-color 0.2s',
  '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' },
  '&.Mui-focused': { borderColor: '#1976D2', borderWidth: '2px' },
  '&.Mui-error': { borderColor: '#d32f2f' },
};

const MenuBar = ({ editor }) => {
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  // --- CORRECTED MENU ITEMS WITH REAL ICONS ---
  const menuItems = [
    { action: () => editor.chain().focus().toggleBold().run(), icon: <FormatBold />, title: 'Bold', isActive: editor.isActive('bold') },
    { action: () => editor.chain().focus().toggleItalic().run(), icon: <FormatItalic />, title: 'Italic', isActive: editor.isActive('italic') },
    { action: () => editor.chain().focus().toggleUnderline().run(), icon: <FormatUnderlined />, title: 'Underline', isActive: editor.isActive('underline') },
    { action: () => editor.chain().focus().toggleStrike().run(), icon: <StrikethroughS />, title: 'Strike', isActive: editor.isActive('strike') },
    { type: 'divider' },
    { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), icon: <LooksOne />, title: 'H1', isActive: editor.isActive('heading', { level: 1 }) },
    { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), icon: <LooksTwo />, title: 'H2', isActive: editor.isActive('heading', { level: 2 }) },
    { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), icon: <Looks3 />, title: 'H3', isActive: editor.isActive('heading', { level: 3 }) },
    { type: 'divider' },
    { action: () => editor.chain().focus().toggleBulletList().run(), icon: <FormatListBulleted />, title: 'Bullet List', isActive: editor.isActive('bulletList') },
    { action: () => editor.chain().focus().toggleOrderedList().run(), icon: <FormatListNumbered />, title: 'Numbered List', isActive: editor.isActive('orderedList') },
    { action: () => editor.chain().focus().toggleBlockquote().run(), icon: <FormatQuote />, title: 'Blockquote', isActive: editor.isActive('blockquote') },
    { action: setLink, icon: <LinkIcon />, title: 'Set Link', isActive: editor.isActive('link') },
    { type: 'divider' },
    { action: () => editor.chain().focus().setHorizontalRule().run(), icon: <HorizontalRule />, title: 'Horizontal Rule' },
    { action: () => editor.chain().focus().toggleCodeBlock().run(), icon: <Code />, title: 'Code Block', isActive: editor.isActive('codeBlock') },
  ];

  return (
    <Box className="flex items-center flex-wrap p-1">
      {menuItems.map((item, index) =>
        item.type === 'divider' ?
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 0.5 }} key={index} /> :
          <Tooltip title={item.title} key={index}>
            <IconButton onClick={item.action} color={item.isActive ? 'primary' : 'default'} size="small">
              {item.icon}
            </IconButton>
          </Tooltip>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="Undo"><IconButton onClick={() => editor.chain().focus().undo().run()} size="small"><Undo /></IconButton></Tooltip>
      <Tooltip title="Redo"><IconButton onClick={() => editor.chain().focus().redo().run()} size="small"><Redo /></IconButton></Tooltip>
    </Box>
  );
};

const TiptapEditor = ({ value, onChange, label, error, helperText, disabled }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'p-4 min-h-[200px] outline-none prose max-w-none',
      },
    },
  });

  return (
    <FormControl fullWidth error={!!error}>
      {label && <InputLabel shrink sx={{ position: 'relative', transform: 'none', mb: 1, fontSize: '1rem', color: 'rgba(0, 0, 0, 0.6)' }}>{label}</InputLabel>}
      <Paper elevation={0} sx={editorStyles} className={`${editor?.isFocused ? 'Mui-focused' : ''} ${error ? 'Mui-error' : ''}`}>
        {editor && <MenuBar editor={editor} />}
        <Divider />
        <EditorContent editor={editor} />
      </Paper>
      {helperText && <FormHelperText className="!text-xs !ml-0">{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default TiptapEditor;