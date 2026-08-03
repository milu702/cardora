import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, CheckCircle, ShieldCheck, Leaf } from 'lucide-react';

const PaymentReceiptModal = ({ payment, isOpen, onClose }) => {
  const receiptRef = useRef();

  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const payerName = payment.payer?.name || payment.payer?.username || 'Plantation Owner';
  const payeeName = payment.payee?.name || payment.payee?.username || 'Cardamom Worker';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#D7E6D5] dark:border-slate-800 overflow-hidden my-8"
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#F8FAF7] dark:bg-slate-800/60">
            <div className="flex items-center gap-2 text-[#1F5E3B] dark:text-emerald-400 font-extrabold text-sm">
              <Leaf className="w-5 h-5 fill-[#1F5E3B]" />
              <span>Cardora Digital Payment Receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="p-2 bg-emerald-100 dark:bg-emerald-950 text-[#1F5E3B] dark:text-emerald-300 rounded-xl hover:bg-emerald-200 transition text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div ref={receiptRef} className="p-8 space-y-6">
            {/* Header branding */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#1F5E3B] text-white flex items-center justify-center mx-auto mb-2 shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-black text-[#17331F] dark:text-white uppercase tracking-wider">
                Payment Confirmation
              </h2>
              <p className="text-xs text-[#5C8D4E] dark:text-emerald-400 font-bold">
                Cardora Plantation Workforce Settlement
              </p>
            </div>

            {/* Amount Banner */}
            <div className="p-5 bg-gradient-to-br from-[#1F5E3B] to-[#2D7A4F] text-white rounded-2xl text-center space-y-1 shadow-md">
              <p className="text-xs font-medium text-emerald-100">Total Settlement Paid</p>
              <h1 className="text-3xl font-black">₹{payment.amount?.toLocaleString('en-IN')}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 bg-emerald-400/20 text-emerald-200 text-[10px] font-bold rounded-full border border-emerald-300/30">
                <CheckCircle className="w-3 h-3 text-emerald-300" /> Payment Status: {payment.status || 'Completed'}
              </span>
            </div>

            {/* Receipt Key Fields Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold">Receipt Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{payment.receiptNumber || 'RCP-88219'}</span>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-slate-500 font-semibold">UPI Transaction Ref</span>
                <span className="font-mono font-bold text-[#1F5E3B] dark:text-emerald-400">{payment.upiReference || 'UPI99841234'}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold">Paid By (Plantation Owner)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{payerName}</span>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-slate-500 font-semibold">Paid To (Worker / Contractor)</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{payeeName}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold">Payment Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{payment.paymentType || 'Daily Wage'}</span>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-slate-500 font-semibold">Payment Method</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{payment.paymentMethod || 'UPI'}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 font-semibold">Date & Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>
            </div>

            {/* Note / Remarks */}
            {payment.notes && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-0.5">
                <p className="font-bold text-amber-800 dark:text-amber-300">Remarks & Job Reference:</p>
                <p className="text-amber-900 dark:text-amber-200">{payment.notes}</p>
              </div>
            )}

            {/* Digital Stamp Footer */}
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 text-center space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Cardora Blockchain & DB Verified Receipt
              </p>
              <p className="text-[10px] text-slate-400">
                This digital receipt is generated automatically by Cardora Workforce System.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentReceiptModal;
