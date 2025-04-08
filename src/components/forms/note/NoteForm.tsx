import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface NoteFormProps {
  initialData?: {
    content: string;
  };
  onSubmit: (data: { content: string }) => void;
  onCancel: () => void;
}

export const NoteForm = ({ initialData, onSubmit, onCancel }: NoteFormProps) => {
  const [content, setContent] = useState(initialData?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ content });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">Contenu de la note</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez votre note ici..."
          className="h-32"
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {initialData ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
};
