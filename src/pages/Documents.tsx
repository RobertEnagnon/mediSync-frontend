import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { documentService, IDocument, CreateDocumentDto } from '@/services/api/documentService';
import { clientService } from '@/services/api/clientService';
import { IClient } from '@/types/client';
import { FileText, Plus, Search, Filter, Download, Trash2, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const documentTypes = [
  { value: 'ordonnance', label: 'Ordonnance' },
  { value: 'rapport_medical', label: 'Rapport médical' },
  { value: 'resultat_examens', label: 'Résultat d\'examens' },
  { value: 'autre', label: 'Autre' }
];

const Documents = () => {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newDocument, setNewDocument] = useState<Partial<CreateDocumentDto>>({
    title: '',
    type: 'ordonnance',
    clientId: '',
    description: '',
    tags: []
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [documentsData, clientsData] = await Promise.all([
          documentService.getAll(),
          clientService.getAll()
        ]);
        setDocuments(documentsData);
        setClients(clientsData);
      } catch (err: any) {
        toast({
          title: 'Erreur',
          description: err.message,
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un fichier',
        variant: 'destructive'
      });
      return;
    }

    // Vérification des champs requis
    if (!newDocument.title || !newDocument.type || !newDocument.clientId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires (titre, type et client)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      const practitionerId = authData?.state?.user?.id;

      if (!practitionerId) {
        throw new Error('Utilisateur non connecté');
      }

      const documentData: CreateDocumentDto = {
        ...newDocument as CreateDocumentDto,
        file: selectedFile,
        practitionerId,
        type: newDocument.type as 'ordonnance' | 'rapport_medical' | 'resultat_examens' | 'autre'
      };

      await documentService.create(documentData);
      toast({
        title: 'Succès',
        description: 'Document ajouté avec succès'
      });
      setDialogOpen(false);
      setSelectedFile(null);
      setNewDocument({
        title: '',
        type: 'ordonnance',
        clientId: '',
        description: '',
        tags: []
      });
      
      // Rafraîchir la liste des documents
      const updatedDocuments = await documentService.getAll();
      setDocuments(updatedDocuments);
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du document:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Erreur lors de l\'ajout du document',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id: string, title: string) => {
    try {
      const blob = await documentService.download(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du téléchargement du document',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      await documentService.delete(id);
      toast({
        title: 'Succès',
        description: 'Document supprimé avec succès'
      });
      
      // Rafraîchir la liste des documents
      const updatedDocuments = await documentService.getAll();
      setDocuments(updatedDocuments);
    } catch (err: any) {
      toast({
        title: 'Erreur',
        description: err.message,
        variant: 'destructive'
      });
    }
  };

  // Filtrer les documents en fonction de la recherche
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.type.toLowerCase().includes(search.toLowerCase()) ||
    (doc.description && doc.description.toLowerCase().includes(search.toLowerCase())) ||
    clients.find(c => c._id === doc.clientId?._id)?.firstName.toLowerCase().includes(search.toLowerCase()) ||
    clients.find(c => c._id === doc.clientId?._id)?.lastName.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastDocument = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstDocument = indexOfLastDocument - ITEMS_PER_PAGE;
  const currentDocuments = filteredDocuments.slice(indexOfFirstDocument, indexOfLastDocument);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Documents</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDocument} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newDocument.type}
                  onValueChange={(value: any) => setNewDocument({ ...newDocument, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select
                  value={newDocument.clientId}
                  onValueChange={(value) => setNewDocument({ ...newDocument, clientId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.firstName} {client.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Fichier</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  Ajouter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Liste des documents */}
      <div className="grid gap-4">
        {currentDocuments.map((document) => (
          <Card key={document._id} className="p-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <h3 className="font-medium">{document.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {documentTypes.find(t => t.value === document.type)?.label}
                  </Badge>
                  {document.tags?.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                {document.description && (
                  <p className="text-sm text-gray-500">{document.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  Client: {clients.find(c => c._id === document.clientId?._id)?.firstName} {clients.find(c => c._id === document.clientId?._id)?.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Ajouté le {format(new Date(document.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(document.id, document.title)}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(document.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {filteredDocuments.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredDocuments.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default Documents;
