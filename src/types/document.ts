export type DocumentType = 'ordonnance' | 'rapport_medical' | 'resultat_examens' | 'autre';

export interface IDocument {
  id: string;
  title: string;
  type: DocumentType;
  clientId: string;
  practitionerId: string;
  description?: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentDto {
  title: string;
  type: DocumentType;
  clientId: string;
  practitionerId: string;
  description?: string;
  tags?: string[];
  file: File;
}

export interface UpdateDocumentDto {
  title?: string;
  type?: DocumentType;
  description?: string;
  tags?: string[];
  file?: File;
}
