import React from "react";

export default function Transactions({ transactions }) {
    return (
        <section className="w-full max-w-5xl bg-gradient-to-br from-blue-500/80 to-blue-900/80 rounded-2xl shadow-2xl p-10 border border-blue-100">
            <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#2563eb" />
                    <path d="M10 16h12M16 10v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Transactions
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-white">
                    <thead>
                        <tr>
                            <th className="text-left py-2 px-2">User</th>
                            <th className="text-left py-2 px-2">Item Type</th>
                            <th className="text-left py-2 px-2">Amount</th>
                            <th className="text-left py-2 px-2">Status</th>
                            <th className="text-left py-2 px-2">Gateway</th>
                            <th className="text-left py-2 px-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-blue-200">No transactions yet.</td>
                            </tr>
                        ) : (
                            transactions.map((tx, idx) => (
                                <tr key={idx} className="border-t border-blue-300">
                                    <td className="py-2 px-2">{tx.userName || tx.userId}</td>
                                    <td className="py-2 px-2">{tx.itemType}</td>
                                    <td className="py-2 px-2">{tx.amount} {tx.currency}</td>
                                    <td className="py-2 px-2">{tx.status}</td>
                                    <td className="py-2 px-2">{tx.gateway}</td>
                                    <td className="py-2 px-2">{new Date(tx.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}