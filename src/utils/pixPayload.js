/**
 * Gerador de Payload PIX Estático — Padrão BR Code (EMV)
 *
 * Monta a string "Pix Copia e Cola" seguindo a especificação do BACEN.
 * CRC16-CCITT calculado localmente, sem API externa.
 *
 * Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/forumspb/EMV-QR-Code-Pix.pdf
 */

// ── Dados do recebedor (substitua se necessário) ────────────────────────────
const PIX_KEY      = '+5571991614369';
const MERCHANT_NAME = 'LUIZA PASSOS DE MENEZES G';   // máx 25 caracteres (EMV)
const MERCHANT_CITY = 'SALVADOR';                     // máx 15 caracteres (EMV)
const TXID_DEFAULT  = '***';                          // identificador da transação

// ── Helpers TLV ─────────────────────────────────────────────────────────────
function tlv(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

// ── CRC16-CCITT (0xFFFF) — polinômio 0x1021 ─────────────────────────────────
function crc16(str) {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// ── Montagem do payload EMV ──────────────────────────────────────────────────
/**
 * Gera o payload "Pix Copia e Cola" para PIX estático.
 *
 * @param {number} amount  — Valor em reais (ex: 450.00). Se 0 ou omitido, gera PIX sem valor fixo.
 * @param {string} [txid]  — Identificador da transação (máx 25 chars). Padrão "***".
 * @returns {string} Payload EMV completo com CRC16.
 */
export function generatePixPayload(amount, txid) {
  // ID 00 – Payload Format Indicator
  const id00 = tlv('00', '01');

  // ID 26 – Merchant Account Information (PIX)
  const gui   = tlv('00', 'br.gov.bcb.pix');   // sub-campo GUI
  const key   = tlv('01', PIX_KEY);             // sub-campo Chave
  const desc  = tlv('02', 'Presente Casamento');// sub-campo Descrição (opcional)
  const id26  = tlv('26', gui + key + desc);

  // ID 52 – Merchant Category Code
  const id52 = tlv('52', '0000');

  // ID 53 – Transaction Currency (986 = BRL)
  const id53 = tlv('53', '986');

  // ID 54 – Transaction Amount (opcional)
  let id54 = '';
  if (amount && amount > 0) {
    const formatted = amount.toFixed(2);
    id54 = tlv('54', formatted);
  }

  // ID 58 – Country Code
  const id58 = tlv('58', 'BR');

  // ID 59 – Merchant Name (máx 25 chars)
  const id59 = tlv('59', MERCHANT_NAME.substring(0, 25));

  // ID 60 – Merchant City (máx 15 chars)
  const id60 = tlv('60', MERCHANT_CITY.substring(0, 15));

  // ID 62 – Additional Data Field Template
  const refLabel = tlv('05', (txid || TXID_DEFAULT).substring(0, 25));
  const id62 = tlv('62', refLabel);

  // Monta payload sem CRC
  const payloadSemCRC = id00 + id26 + id52 + id53 + id54 + id58 + id59 + id60 + id62;

  // ID 63 – CRC16 (calculado sobre payload + "6304")
  const payloadParaCRC = payloadSemCRC + '6304';
  const checksum = crc16(payloadParaCRC);
  const id63 = '6304' + checksum;

  return payloadSemCRC + id63;
}
