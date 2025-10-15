import { NextResponse } from 'next/server';

// This will be our "database" of valid codes
const validCodes = new Set<string>();
const SECRET_BASE = "EVENT-ATTENDANCE-CSE-2025";

// Function to generate a new code and update our list
const generateNewCode = () => {
    // Create a new unique code, e.g., using a timestamp
    const newCode = `${SECRET_BASE}-${Date.now()}`;
    validCodes.add(newCode);

    // To keep the list from growing forever, we'll make codes expire.
    // A code is valid for ~12 seconds.
    // This gives students a grace period to scan.
    if (validCodes.size > 3) {
        // --- FIX ---
        // Convert the Set to an array to reliably get the oldest (first) item.
        const oldestCode = Array.from(validCodes)[0];
        validCodes.delete(oldestCode);
    }
    
    return newCode;
};

// Generate the first code when the server starts
generateNewCode();

// Keep generating a new code every 4 seconds on the server
setInterval(generateNewCode, 4000);

// This function will be called by the admin page
export async function GET() {
    // Return the most recently generated code
    const currentCode = Array.from(validCodes).pop();
    return NextResponse.json({ qrValue: currentCode });
}

// We also need to export our set of valid codes so the other API can check it
export { validCodes };