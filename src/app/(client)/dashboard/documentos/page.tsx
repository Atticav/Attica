'use client';
import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileText, Upload, Download, Eye, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';

type Document = {
  id: string;
  name: string;
  type: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  is_required: boolean;
  status: 'uploaded' | 'pending' | 'expired';
  expiry_date: string | null;
  notes: string | null;
};

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase.from('documents').select('*').eq('trip_id', tripId).order('is_required', { ascending: false });
    setDocuments(data || []);
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const tripId = localStorage.getItem('attica_current_trip');
    const { data: { user } } = await supabase.auth.getUser();
    if (!tripId || !user) { setUploading(false); return; }

    const filePath = `${user.id}/${tripId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('trip-files').upload(filePath, file);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('trip-files').getPublicUrl(filePath);
      await supabase.from('documents').insert({
        trip_id: tripId,
        name: file.name,
        type: file.type.startsWith('image/') ? 'Imagem' : 'Documento',
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        is_required: false,
        status: 'uploaded',
      });
      fetchDocuments();
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm('Excluir este documento?')) return;
    await supabase.from('documents').delete().eq('id', doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '–';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const required = documents.filter((d) => d.is_required);
  const uploaded = documents.filter((d) => d.status === 'uploaded');

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-[#E5DDD5] rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Documentos</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">{uploaded.length} de {documents.length} documentos enviados</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
          <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Upload size={14} strokeWidth={1.5} />
            Enviar documento
          </Button>
        </div>
      </div>

      {/* Requirements Checklist */}
      {required.length > 0 && (
        <Card>
          <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D] mb-4">Documentos Obrigatórios</h3>
          <div className="space-y-2">
            {required.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#FAF6F3]">
                {doc.status === 'uploaded'
                  ? <CheckCircle size={16} strokeWidth={1.5} className="text-[#7B9E6B] flex-shrink-0" />
                  : <AlertCircle size={16} strokeWidth={1.5} className="text-[#D4A853] flex-shrink-0" />
                }
                <span className="font-inter text-sm text-[#2D2D2D] flex-1">{doc.name}</span>
                {doc.status === 'uploaded'
                  ? <Badge variant="success">Enviado</Badge>
                  : <Badge variant="warning">Pendente</Badge>
                }
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Documents */}
      <Card padding="none">
        <div className="p-4 border-b border-[#E5DDD5]">
          <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Todos os Documentos</h3>
        </div>
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-3" />
            <p className="font-lora text-[#9C9C9C]">Nenhum documento enviado ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5DDD5]">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-[#FAF6F3] transition-colors">
                <div className="bg-[#F5EDE8] p-2.5 rounded-lg flex-shrink-0">
                  <FileText size={18} strokeWidth={1.5} className="text-[#C4A97D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-sm font-medium text-[#2D2D2D] truncate">{doc.name}</p>
                  <p className="font-lora text-xs text-[#9C9C9C]">
                    {doc.type} · {formatSize(doc.file_size)}
                    {doc.expiry_date && ` · Vence: ${new Date(doc.expiry_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {doc.status === 'uploaded' && <Badge variant="success">Enviado</Badge>}
                  {doc.status === 'pending' && <Badge variant="warning">Pendente</Badge>}
                  {doc.status === 'expired' && <Badge variant="error">Expirado</Badge>}
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9C9C9C] hover:text-[#4A4A4A] transition-colors">
                    <Eye size={14} strokeWidth={1.5} />
                  </a>
                  <a href={doc.file_url} download
                    className="p-1.5 rounded-lg hover:bg-[#E8DDD5] text-[#9C9C9C] hover:text-[#4A4A4A] transition-colors">
                    <Download size={14} strokeWidth={1.5} />
                  </a>
                  <button onClick={() => handleDelete(doc)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#9C9C9C] hover:text-[#C17B6E] transition-colors">
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
