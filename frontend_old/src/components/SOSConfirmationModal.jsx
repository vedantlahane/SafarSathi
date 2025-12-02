import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SOSConfirmationModal = ({ onConfirm, onCancel, touristId }) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown === 0) {
            // Timer finished, automatically confirm the SOS
            onConfirm();
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        // Cleanup the interval on unmount or if countdown reaches 0
        return () => clearInterval(timer);
    }, [countdown, onConfirm]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-sm text-center transform transition-all duration-300 border-4 border-red-500"
            >
                <h2 className="text-3xl font-bold text-red-600 mb-4 flex items-center justify-center space-x-2">
                    <span className="animate-pulse">🚨</span>
                    <span>CONFIRM SOS</span>
                    <span className="animate-pulse">🚨</span>
                </h2>
                <p className="text-gray-700 text-lg mb-6">
                    Sending alert to Police Station and Emergency Contacts in...
                </p>
                
                <motion.div
                    key={countdown}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1.2 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                    className={`text-6xl font-extrabold mb-8 ${countdown > 0 ? 'text-red-600' : 'text-green-600'}`}
                >
                    {countdown > 0 ? countdown : 'SENDING...'}
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancel}
                    className="w-full bg-slate-500 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                    disabled={countdown === 0}
                >
                    {countdown > 0 ? '❌ CANCEL ALERT' : '✅ ALERT SENT'}
                </motion.button>

                <p className="text-xs text-gray-500 mt-4">
                    Alert will be sent automatically after the countdown ends.
                </p>
            </motion.div>
        </div>
    );
};

export default SOSConfirmationModal;