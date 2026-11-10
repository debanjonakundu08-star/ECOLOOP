import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  PackageCheck,
  CreditCard,
  Truck,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Leaf,
  FileCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    if (!id) return;
    try {
      const res = await api.orders.getById(id);
      setOrder(res.order);
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateDeliveryStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.orders.updateDeliveryStatus(order.id, { deliveryStatus: status });
      await loadOrder();
      alert(`Order delivery status updated to ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update delivery status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center py-20 px-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading order invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg flex items-center justify-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Order Not Found</h2>
      </div>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const steps = ['PROCESSING', 'DISPATCHED', 'IN TRANSIT', 'DELIVERED'];
  const currentStepIdx = steps.indexOf(order.deliveryStatus);

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </button>

          <span className="text-xs text-slate-400 dark:text-slate-500">
            Recorded on {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Invoice & Status Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-10 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 space-y-8 transition-colors"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-emerald-950/60 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-ecoDark-card px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                  Commercial Purchase Order
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
                Order #{order.orderNumber}
              </h1>
            </div>

            {/* If pending buyer payment */}
            {isBuyer && order.paymentStatus === 'PENDING' && (
              <Link
                to={`/checkout/${order.id}`}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulated Escrow Checkout</span>
              </Link>
            )}
          </div>

          {/* Fulfillment Tracking Stepper */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Transit & Handover Timeline
            </h4>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {steps.map((st, i) => {
                const isPassed = currentStepIdx >= i;
                const isCurrent = currentStepIdx === i;

                return (
                  <div key={st} className="text-center space-y-2">
                    <div className={`h-2 rounded-full transition-all ${
                      isPassed ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-100 dark:bg-ecoDark-card'
                    }`} />
                    <span className={`text-[11px] font-bold block ${
                      isCurrent ? 'text-emerald-800 dark:text-emerald-300' : isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                    }`}>
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Seller controls to advance delivery status */}
            {isSeller && order.deliveryStatus !== 'DELIVERED' && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200/80 dark:border-emerald-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Advance Freight Milestone:</span>
                <div className="flex gap-2">
                  {order.deliveryStatus === 'PROCESSING' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus('DISPATCHED')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg font-bold bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 cursor-pointer"
                    >
                      Mark Dispatched
                    </button>
                  )}
                  {order.deliveryStatus === 'DISPATCHED' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus('IN TRANSIT')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg font-bold bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 cursor-pointer"
                    >
                      Mark In Transit
                    </button>
                  )}
                  {order.deliveryStatus === 'IN TRANSIT' && (
                    <button
                      onClick={() => handleUpdateDeliveryStatus('DELIVERED')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg font-bold bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 cursor-pointer"
                    >
                      Confirm Final Delivery
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trade Counterparty Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buyer Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950/60 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Purchasing Entity</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{order.buyer.businessName}</div>
              <p className="text-slate-500 dark:text-slate-400">{order.buyer.city} ({order.shippingAddress || 'Plant address'})</p>
              <p className="text-slate-400 dark:text-slate-500">Phone: {order.buyer.phone}</p>
            </div>

            {/* Seller Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card border border-slate-100 dark:border-emerald-950/60 space-y-1.5 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Supplying Entity</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">{order.seller.businessName}</div>
              <p className="text-slate-500 dark:text-slate-400">{order.seller.city} ({order.seller.address || 'Warehouse depot'})</p>
              <p className="text-slate-400 dark:text-slate-500">Phone: {order.seller.phone}</p>
            </div>
          </div>

          {/* Line Item Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Order Breakdown & Commercial Valuation
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-ecoDark-card text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Material</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3 text-right rounded-r-xl">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60">
                  <tr>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{order.material?.title}</td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">{order.material?.category}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                      {order.quantity} {order.material?.unit}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">₹{order.unitPrice}/{order.material?.unit}</td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{order.baseAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Breakdown & Settlement Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-slate-100 dark:border-emerald-950/60 gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div>Fulfillment Option: <strong className="text-slate-700 dark:text-slate-200">{order.pickupMethod}</strong></div>
              {order.payment && (
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Payment Reference: {order.payment.transactionRef} ({order.payment.paymentMethod})
                </div>
              )}
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Material Subtotal:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{order.baseAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>EcoLoop Platform Escrow (3%):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{order.platformFee.toLocaleString('en-IN')}</span>
              </div>
              {order.logisticsFee > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>EcoLoop Logistics Delivery:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">₹{order.logisticsFee}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-emerald-950/60 flex justify-between font-extrabold text-sm text-emerald-950 dark:text-white">
                <span>Total Settled Outlay:</span>
                <span className="text-base text-emerald-800 dark:text-emerald-400">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Environmental Savings Badge */}
          {order.impactRecord && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-900 dark:text-emerald-300">
                  Circular Impact Verified for Order #{order.orderNumber}
                </div>
                <p className="text-emerald-800 dark:text-emerald-200 mt-0.5">
                  Diverted <strong>{order.impactRecord.quantityKg} kg</strong> of industrial waste, preventing{' '}
                  <strong>{order.impactRecord.co2SavedKg} kg</strong> of CO₂ emissions and conserving{' '}
                  <strong>{order.impactRecord.waterSavedLiters} liters</strong> of water.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
