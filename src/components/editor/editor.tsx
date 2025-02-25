"use client";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { cn } from "@/lib/utils";

type Props = {
    onChange?: any;
    initialContent?: string;
    editable?: boolean;
};

export default function Editor({
    onChange,
    initialContent,
    editable = true,
}: Props) {
    const editor = useCreateBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });

    return (
        <BlockNoteView
            className={
                editable
                    ? "w-full rounded-md border border-input bg-transparent py-2 shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400!"
                    : "*:p-2!"
            }
            editor={editor}
            editable={editable}
            onChange={() => {
                if (onChange) onChange(JSON.stringify(editor.document));
            }}
        />
    );
}
