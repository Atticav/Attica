'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/Card';
import { FileSignature, Download, ExternalLink } from 'lucide-react';

export default function ContratoPage() {
  const [contractUrl, setContractUrl] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { fetchContract(); }, []);

  const fetchContract = async () => {
    const tripId = localStorage.getItem('attica_current_trip');
    if (!tripId) { setLoading(false); return; }
    const { data } = await supabase
      .from('trips')
      .select('contract_pdf_url, contract_form_id')
      .eq('id', tripId)
      .single();
    setContractUrl(data?.contract_pdf_url || null);
    setFormId(data?.contract_form_id || null);
    setLoading(false);
  };

  if (loading) return (
    <div className="p-6 space-y-4">
      <div className="h-16 bg-[#E5DDD5] rounded-xl skeleton" />
      <div className="h-96 bg-[#E5DDD5] rounded-xl skeleton" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-[#2D2D2D]">Contrato</h1>
          <p className="font-lora text-sm text-[#9C9C9C]">Seu contrato de serviços de viagem</p>
        </div>
        {contractUrl && (
          <a
            href={contractUrl}
            download
            className="flex items-center gap-2 bg-[#C4A97D] text-white px-4 py-2.5 rounded-lg font-inter text-sm hover:bg-[#8B7355] transition-colors"
          >
            <Download size={14} strokeWidth={1.5} />
            Baixar PDF
          </a>
        )}
      </div>

      {/* PDF Viewer */}
      {contractUrl ? (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-[#E5DDD5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSignature size={16} strokeWidth={1.5} className="text-[#C4A97D]" />
              <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Documento do Contrato</h3>
            </div>
            <a href={contractUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-inter text-xs text-[#8B7355] hover:underline">
              <ExternalLink size={12} strokeWidth={1.5} />Abrir em nova aba
            </a>
          </div>
          <iframe
            src={`${contractUrl}#toolbar=0`}
            className="w-full h-[600px]"
            title="Contrato"
          />
        </Card>
      ) : (
        <Card className="text-center py-12">
          <FileSignature size={48} strokeWidth={1} className="text-[#C4A97D] mx-auto mb-4" />
          <p className="font-cormorant text-xl text-[#9C9C9C]">Contrato ainda não disponível</p>
          <p className="font-lora text-sm text-[#9C9C9C] mt-2">Seu consultor irá disponibilizar o contrato em breve.</p>
        </Card>
      )}

      {/* Tally Form */}
      {formId && (
        <Card padding="none" className="overflow-hidden">
          <div className="p-4 border-b border-[#E5DDD5]">
            <h3 className="font-cormorant text-lg font-semibold text-[#2D2D2D]">Assinatura Digital</h3>
            <p className="font-lora text-sm text-[#9C9C9C] mt-0.5">Confirme sua leitura e assine digitalmente</p>
          </div>
          <iframe
            src={`https://tally.so/embed/${formId}?transparentBackground=1`}
            className="w-full h-[400px]"
            title="Formulário de contrato"
          />
        </Card>
      )}
    </div>
  );
}
