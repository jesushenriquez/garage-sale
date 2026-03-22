import { Banknote, MapPin, MessageCircle } from "lucide-react";
import type { StoreConfig } from "@/lib/types";
import { BANK_ACCOUNT_TYPES, DOCUMENT_TYPES } from "@/lib/constants";
import { buildWhatsAppUrl } from "@/lib/utils";
import { PickupScheduleDisplay } from "@/components/catalog/pickup-schedule-display";

interface FooterProps {
  config: StoreConfig;
}

export function Footer({ config }: FooterProps) {
  return (
    <footer className="bg-brand-800 text-brand-100 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Transfer info */}
          {(config.bank_name || config.document_type || config.contact_email) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-5 h-5 text-brand-300" />
                <h3 className="font-semibold text-white">Datos para transferencia</h3>
              </div>
              <div className="space-y-1 text-sm">
                {config.bank_name && (
                  <p><span className="text-brand-300">Banco:</span> {config.bank_name}</p>
                )}
                {config.bank_account_holder && (
                  <p><span className="text-brand-300">Titular:</span> {config.bank_account_holder}</p>
                )}
                {config.bank_account_number && (
                  <p><span className="text-brand-300">Cuenta:</span> {config.bank_account_number}</p>
                )}
                {config.bank_account_type && (
                  <p><span className="text-brand-300">Tipo:</span> {BANK_ACCOUNT_TYPES[config.bank_account_type]}</p>
                )}
                {config.document_type && config.document_number && (
                  <p><span className="text-brand-300">{DOCUMENT_TYPES[config.document_type]}:</span> {config.document_number}</p>
                )}
                {config.contact_email && (
                  <p><span className="text-brand-300">Correo:</span> {config.contact_email}</p>
                )}
              </div>
            </div>
          )}

          {/* Pickup location */}
          {config.pickup_address && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-brand-300" />
                <h3 className="font-semibold text-white">Lugar de recogida</h3>
              </div>
              <p className="text-sm mb-3">{config.pickup_address}</p>
              {config.pickup_schedule && config.pickup_schedule.length > 0 && (
                <PickupScheduleDisplay schedule={config.pickup_schedule} className="text-brand-200 mb-3" />
              )}
              {config.pickup_map_url && (
                <div className="rounded-lg overflow-hidden">
                  <iframe
                    src={config.pickup_map_url}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          )}

          {/* Contact info */}
          {(config.footer_contact_text || config.footer_show_whatsapp) && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-brand-300" />
                <h3 className="font-semibold text-white">Contacto</h3>
              </div>
              {config.footer_contact_text && (
                <p className="text-sm whitespace-pre-line">{config.footer_contact_text}</p>
              )}
              {config.footer_show_whatsapp && config.whatsapp_number && (
                <a
                  href={buildWhatsAppUrl(config.whatsapp_number, config.whatsapp_message_general || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escríbeme por WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-brand-700 mt-8 pt-6 text-center">
          <p className="text-sm text-brand-300">{config.store_name}</p>
        </div>
      </div>
    </footer>
  );
}
