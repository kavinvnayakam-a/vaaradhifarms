'use client'

import { Order } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

// Common types and helper functions
const formatTime = (ts: any) => {
    if (!ts) return "";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};
  
const formatDate = (ts: any) => {
    if (!ts) return "";
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export interface PrintSettings {
  storeName: string;
  address: string;
  phone: string;
  gstin: string;
  fssai: string;
  footerMessage: string;
  paperWidth: '58mm' | '80mm';
  triggerCashDrawer: boolean;
  optimizedFor: string;
  templateId: 'template-1' | 'template-2' | 'template-3' | 'template-4' | 'template-5';
}

interface ReceiptProps {
  order: Order;
  settings: PrintSettings;
  tableNumber: string | null;
}

// Template 1: Classic
const Template1 = ({ order, settings, tableNumber }: ReceiptProps) => (
    <div className="bg-white text-black p-1 shadow-2xl font-mono text-[11px] w-[80mm]">
      <div className="text-center mb-2">
          <h2 className="text-lg font-black uppercase">{settings.storeName}</h2>
          <p className="text-[9px] uppercase font-bold leading-tight px-4">{settings.address}</p>
          <p className="text-[9px] font-bold">PH: {settings.phone}</p>
          <p className="text-[9px] font-bold">GSTIN: {settings.gstin}</p>
      </div>
      <div className="border-y border-dashed border-black py-1 my-2 text-[10px]">
          <div className="flex justify-between">
              <span>Date: {formatDate(order.timestamp)}</span>
              <span>Time: {formatTime(order.timestamp)}</span>
          </div>
          <div className="flex justify-between font-black">
              {tableNumber 
                  ? <span>Table No.: {tableNumber}</span>
                  : <span>Token No.: #{order.orderNumber}</span>
              }
              <span>{tableNumber ? 'Dine-In' : 'Takeaway'}</span>
          </div>
          <div className="flex justify-between mt-1 pt-1 border-t border-black/10">
              <span className="uppercase">Cust: {order.customerName}</span>
          </div>
      </div>
      <table className="w-full text-[10px]">
          <thead>
              <tr className="border-b border-dashed border-black">
                  <th className="text-left font-bold uppercase pb-1">Item</th>
                  <th className="text-center font-bold uppercase pb-1">Qty</th>
                  <th className="text-right font-bold uppercase pb-1">Price</th>
              </tr>
          </thead>
          <tbody>
              {order?.items.map((item, idx) => (
                  <tr key={idx} className="font-bold">
                      <td className="py-1 uppercase">{item.name}</td>
                      <td className="text-center py-1">{item.quantity}</td>
                      <td className="text-right py-1">{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
              ))}
          </tbody>
      </table>
      <div className="border-t border-dashed border-black pt-2 mt-2 space-y-1 text-right text-[10px] font-bold">
          <div className="flex justify-between"><span>Sub Total</span> <span>{(order?.subtotal || 0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>CGST @ 2.5%</span> <span>{(order?.cgst || 0).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>SGST @ 2.5%</span> <span>{(order?.sgst || 0).toFixed(2)}</span></div>
          {(order?.roundOff || 0) !== 0 && (
              <div className="flex justify-between"><span>Round off</span> <span>{order?.roundOff?.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between items-center text-base font-black border-t-2 border-black pt-1 mt-1">
              <span>TOTAL</span>
              <span>{formatCurrency(order?.totalPrice || 0)}</span>
          </div>
          {order?.paymentMethod === 'Cash' && order.cashReceived != null && (
              <div className="pt-2 mt-2 border-t border-dashed border-black/40 text-xs">
                <div className="flex justify-between"><span>CASH RECEIVED</span> <span>{formatCurrency(order.cashReceived)}</span></div>
                <div className="flex justify-between"><span>CHANGE DUE</span> <span>{formatCurrency(order.changeDue || 0)}</span></div>
              </div>
          )}
      </div>
      <div className="text-center mt-4 border-t border-dashed border-black pt-2">
          <p className="text-[9px] font-bold uppercase italic">{settings.footerMessage}</p>
      </div>
  </div>
);

// Template 2: Modern
const Template2 = ({ order, settings, tableNumber }: ReceiptProps) => (
    <div className="bg-white text-black p-4 font-sans w-[80mm] text-[12px]">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight uppercase">{settings.storeName}</h2>
            <p className="text-[9px] text-gray-600">{settings.address}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 text-[10px] mb-4 border-y border-gray-200 py-2">
            <div><span className="font-semibold">Order:</span> #{order.orderNumber}</div>
            <div className="text-right"><span className="font-semibold">Date:</span> {formatDate(order.timestamp)}</div>
            <div><span className="font-semibold">Type:</span> {tableNumber ? `Table ${tableNumber}` : 'Takeaway'}</div>
            <div className="text-right"><span className="font-semibold">Time:</span> {formatTime(order.timestamp)}</div>
            <div className="col-span-2"><span className="font-semibold">Customer:</span> {order.customerName}</div>
        </div>
        <div className="space-y-3">
            {order.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 text-[11px]">
                    <div className="col-span-1">{item.quantity}x</div>
                    <div className="col-span-7 font-semibold truncate">{item.name}</div>
                    <div className="col-span-4 text-right">{(item.price * item.quantity).toFixed(2)}</div>
                </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-gray-300 text-right space-y-2 text-[11px]">
            <div className="flex justify-between"><span>Subtotal</span><span>{(order.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>CGST @ 2.5%</span><span>{(order.cgst || 0).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>SGST @ 2.5%</span><span>{(order.sgst || 0).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200"><span>Total</span><span>{formatCurrency(order.totalPrice)}</span></div>
        </div>
        <div className="text-center mt-6 text-[10px] text-gray-500">{settings.footerMessage}</div>
    </div>
);


// Template 3: Compact
const Template3 = ({ order, settings, tableNumber }: ReceiptProps) => (
    <div className="bg-white text-black p-1 font-mono w-[80mm] text-[10px]">
        <div className="text-center">
            <h2 className="text-sm font-bold uppercase">{settings.storeName}</h2>
            <p className="text-[8px]">{settings.address}</p>
            <p className="text-[8px]">GSTIN: {settings.gstin}</p>
        </div>
        <div className="my-1 border-t border-dashed border-black" />
        <div className="text-[9px]">
            <p>Order: #{order.orderNumber} | {tableNumber ? `T${tableNumber}` : 'Takeaway'}</p>
            <p>Date: {formatDate(order.timestamp)} {formatTime(order.timestamp)}</p>
            <p>Cust: {order.customerName}</p>
        </div>
        <div className="my-1 border-t border-dashed border-black" />
        <table className="w-full text-[9px]">
            <thead><tr><th className="text-left">Item</th><th className="text-center">Q</th><th className="text-right">Price</th></tr></thead>
            <tbody>
                {order.items.map((item, idx) => (
                    <tr key={idx}><td>{item.quantity}x {item.name}</td><td className="text-center">{item.quantity}</td><td className="text-right">{(item.price * item.quantity).toFixed(2)}</td></tr>
                ))}
            </tbody>
        </table>
        <div className="my-1 border-t border-dashed border-black" />
        <div className="text-right text-[10px]">
            <p>Subtotal: {(order.subtotal || 0).toFixed(2)}</p>
            <p>GST: {((order.cgst || 0) + (order.sgst || 0)).toFixed(2)}</p>
            <p className="font-bold text-lg">Total: {formatCurrency(order.totalPrice)}</p>
        </div>
        <p className="text-center text-[8px] mt-2">{settings.footerMessage}</p>
    </div>
);

// Template 4: Premium
const Template4 = ({ order, settings, tableNumber }: ReceiptProps) => (
    <div className="bg-white text-black p-4 font-serif w-[80mm] border-2 border-black">
        <div className="text-center mb-4 pb-4 border-b-2 border-black">
            <p className="text-xs">--- EST 2025 ---</p>
            <h2 className="text-2xl font-bold tracking-widest uppercase">{settings.storeName}</h2>
            <p className="text-[9px] uppercase">{settings.address}</p>
        </div>
        <div className="text-center text-xs mb-4">
            <p>Order #{order.orderNumber} for {order.customerName}</p>
            <p>{tableNumber ? `Dine-in at Table ${tableNumber}` : 'Takeaway Order'}</p>
            <p>{formatDate(order.timestamp)} at {formatTime(order.timestamp)}</p>
        </div>
        <div className="space-y-3 my-4">
            {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p>{(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))}
        </div>
        <div className="mt-4 pt-4 border-t-2 border-black border-dashed text-right text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{(order.subtotal || 0).toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Taxes (GST)</span><span>{((order.cgst || 0) + (order.sgst || 0)).toFixed(2)}</span></div>
            <div className="flex justify-between font-extrabold text-xl mt-2"><span>Total Due</span><span>{formatCurrency(order.totalPrice)}</span></div>
        </div>
        <div className="text-center mt-6 text-xs italic">{settings.footerMessage}</div>
    </div>
);

// Template 5: Minimal
const Template5 = ({ order, settings, tableNumber }: ReceiptProps) => (
    <div className="bg-white text-black p-2 font-mono w-[80mm] text-[11px]">
        <div className="text-center mb-2">
            <p className="font-bold">{settings.storeName}</p>
        </div>
        <p>Order: #{order.orderNumber} ({order.customerName})</p>
        <p>Date: {formatDate(order.timestamp)} {formatTime(order.timestamp)}</p>
        <div className="my-2 border-t border-black" />
        {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>{(item.price * item.quantity).toFixed(2)}</span>
            </div>
        ))}
        <div className="my-2 border-t border-black" />
        <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(order.totalPrice)}</span>
        </div>
        <p className="text-center text-[9px] mt-2">{settings.footerMessage}</p>
    </div>
);


export const ReceiptRouter = (props: ReceiptProps) => {
    switch (props.settings.templateId) {
        case 'template-2': return <Template2 {...props} />;
        case 'template-3': return <Template3 {...props} />;
        case 'template-4': return <Template4 {...props} />;
        case 'template-5': return <Template5 {...props} />;
        case 'template-1':
        default:
            return <Template1 {...props} />;
    }
};

export const KOTComponent = ({ order, tableNumber }: { order: Order, tableNumber: string | null }) => (
    <div className="bg-white text-black p-4 font-mono w-[80mm]">
        <div className="text-center">
            <p className="text-lg font-black uppercase tracking-widest">KOT</p>
            <h1 className="text-6xl font-black italic leading-none my-2">
                {tableNumber ? `T${tableNumber}` : `#${order?.orderNumber}`}
            </h1>
            <p className="text-xl font-black mt-2">
                {tableNumber ? '(Dine-In)' : `(${order.customerName})`}
            </p>
        </div>
        <div className="border-y border-dashed border-black my-4 py-2 text-left">
            {order.items.map((item, idx) => (
                <p key={idx} className="text-lg font-black uppercase">
                    {item.quantity}x {item.name}
                </p>
            ))}
        </div>
        <p className="text-center text-xs">{formatTime(order.timestamp)}</p>
    </div>
);

export const CollectionTokenComponent = ({ order }: { order: Order }) => (
    <div className="bg-white text-black p-4 font-mono w-[80mm] text-center">
        <p className="text-lg font-black uppercase tracking-widest">Collection Token</p>
        <h1 className="text-8xl font-black italic leading-none my-4">#{order.orderNumber}</h1>
        <div className="border-y border-dashed border-black py-2 my-2 text-left">
            <p className="text-xl font-black uppercase mb-1">{order.customerName}</p>
            {order.items.map((item, idx) => (
                <p key={idx} className="text-base font-black uppercase">
                    {item.quantity}x {item.name}
                </p>
            ))}
        </div>
        <p className="text-center text-xs mt-4 font-bold">Please show this token at the pickup counter.</p>
        <p className="text-center text-xs font-bold">{formatDate(order.timestamp)} {formatTime(order.timestamp)}</p>
    </div>
);
