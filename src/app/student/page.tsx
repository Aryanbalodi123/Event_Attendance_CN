"use client";

import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// This is the value embedded in the admin's QR code
const EXPECTED_QR_VALUE = "EVENT-ATTENDANCE-CSE-2025";

// Static student details
const studentDetails = {
    name: "Aryan Balodi",
    rollNumber: "2410990061",
    email: "aryan0061.becse24@chitkara.edu.in",
    branch: "BE CSE CORE",
    group: "G1",
};

export default function StudentPage() {
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    useEffect(() => {
        if (!isScanning) return;

        const scanner = new Html5QrcodeScanner(
            'reader', // ID of the div element
            {
                qrbox: { width: 250, height: 250 },
                fps: 5,
            },
            false // verbose
        );

        const onScanSuccess = (decodedText: string) => {
            scanner.clear();
            setIsScanning(false);
            setScanResult(decodedText);
            handleScanResult(decodedText);
        };

        const onScanError = (error: any) => {
            // console.warn(error);
        };

        scanner.render(onScanSuccess, onScanError);

        // Cleanup function to stop the scanner
        return () => {
            if (document.getElementById('reader')?.innerHTML) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, [isScanning]);

  // ... (keep all the existing code at the top)

    const handleScanResult = async (result: string) => {
        setStatusMessage({ type: 'info', text: 'QR code scanned. Verifying...' });
        try {
            const response = await fetch('/api/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // --- SEND THE SCANNED QR CODE VALUE WITH THE DETAILS ---
                body: JSON.stringify({
                    ...studentDetails,
                    qrCodeValue: result, // 'result' is the value from the QR code
                }),
            });
            
            const data = await response.json();

            if (response.ok) {
                setStatusMessage({ type: 'success', text: 'Check-in successful! Thank you.' });
            } else {
                setStatusMessage({ type: 'error', text: data.message || 'An error occurred.' });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to connect to the server.' });
        }
    };

// ... (keep all the existing code at the bottom)
    
    const getStatusColor = () => {
        if (!statusMessage) return 'text-gray-800';
        switch (statusMessage.type) {
            case 'success': return 'text-green-600';
            case 'error': return 'text-red-600';
            case 'info': return 'text-blue-600';
        }
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
                <h1 className="text-2xl font-bold mb-2 text-gray-800">Student Check-In</h1>
                <p className="mb-6 text-gray-500">Scan the event QR code to mark your attendance.</p>
                
                {/* QR Code Reader Div */}
                <div id="reader" className={`${isScanning ? 'block' : 'hidden'} w-full`}></div>
                
                {!isScanning && (
                    <button
                        onClick={() => {
                          setIsScanning(true);
                          setStatusMessage(null);
                        }}
                        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Start QR Scan
                    </button>
                )}
                
                {statusMessage && (
                    <div className={`mt-6 p-4 rounded-md font-semibold text-lg ${getStatusColor()}`}>
                        {statusMessage.text}
                    </div>
                )}
            </div>
        </main>
    );
}