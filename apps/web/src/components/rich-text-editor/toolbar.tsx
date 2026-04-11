'use client'

import {
  ArrowUDownLeft,
  ArrowUDownRight,
  Image,
  ListBullets,
  ListNumbers,
  Quotes,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from '@phosphor-icons/react'
import type { Editor } from '@tiptap/react'
import { useEditorState } from '@tiptap/react'
import clsx from 'clsx'
import { useRef } from 'react'

interface ToolbarProps {
  editor: Editor | null
}

const buttonClass =
  'rounded p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-40 disabled:pointer-events-none'
const activeClass = 'bg-surface-hover text-foreground'
const separatorClass = 'mx-1 h-6 w-px bg-border'

export function Toolbar({ editor }: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        underline: e.isActive('underline'),
        strike: e.isActive('strike'),
        h1: e.isActive('heading', { level: 1 }),
        h2: e.isActive('heading', { level: 2 }),
        h3: e.isActive('heading', { level: 3 }),
        bulletList: e.isActive('bulletList'),
        orderedList: e.isActive('orderedList'),
        blockquote: e.isActive('blockquote'),
        alignLeft: e.isActive({ textAlign: 'left' }),
        alignCenter: e.isActive({ textAlign: 'center' }),
        alignRight: e.isActive({ textAlign: 'right' }),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      }
    },
  })

  if (!editor || !state) return null

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !editor) return
    editor.chain().focus().setMedia({ file }).run()
    event.target.value = ''
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-surface px-2 py-1.5">
      <button
        className={clsx(buttonClass, state.bold && activeClass)}
        title="Bold"
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <TextB size={18} weight="bold" />
      </button>
      <button
        className={clsx(buttonClass, state.italic && activeClass)}
        title="Italic"
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <TextItalic size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.underline && activeClass)}
        title="Underline"
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <TextUnderline size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.strike && activeClass)}
        title="Strikethrough"
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <TextStrikethrough size={18} />
      </button>

      <div className={separatorClass} />

      <button
        className={clsx(buttonClass, state.h1 && activeClass)}
        title="Heading 1"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <TextHOne size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.h2 && activeClass)}
        title="Heading 2"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <TextHTwo size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.h3 && activeClass)}
        title="Heading 3"
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <TextHThree size={18} />
      </button>

      <div className={separatorClass} />

      <button
        className={clsx(buttonClass, state.bulletList && activeClass)}
        title="Bullet List"
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListBullets size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.orderedList && activeClass)}
        title="Ordered List"
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListNumbers size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.blockquote && activeClass)}
        title="Blockquote"
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quotes size={18} />
      </button>

      <div className={separatorClass} />

      <button
        className={clsx(buttonClass, state.alignLeft && activeClass)}
        title="Align Left"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <TextAlignLeft size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.alignCenter && activeClass)}
        title="Align Center"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <TextAlignCenter size={18} />
      </button>
      <button
        className={clsx(buttonClass, state.alignRight && activeClass)}
        title="Align Right"
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <TextAlignRight size={18} />
      </button>

      <div className={separatorClass} />

      <button
        className={buttonClass}
        disabled={!state.canUndo}
        title="Undo"
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <ArrowUDownLeft size={18} />
      </button>
      <button
        className={buttonClass}
        disabled={!state.canRedo}
        title="Redo"
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <ArrowUDownRight size={18} />
      </button>

      <div className={separatorClass} />

      <button className={buttonClass} title="Insert Image" type="button" onClick={() => fileInputRef.current?.click()}>
        <Image size={18} />
      </button>
      <input ref={fileInputRef} accept="image/*" className="hidden" type="file" onChange={handleFileChange} />
    </div>
  )
}
