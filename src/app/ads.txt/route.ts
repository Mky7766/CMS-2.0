
import { getSettings } from "@/lib/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const settings = await getSettings();
    const adsTxtContent = settings.adsTxt || '';

    return new NextResponse(adsTxtContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
