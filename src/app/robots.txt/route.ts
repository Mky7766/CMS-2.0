
import { getSettings } from "@/lib/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const settings = await getSettings();
    const siteUrl = new URL(request.url).origin;
    
    // Provide a default robots.txt if not set by the user
    const defaultRobotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml`;
    const robotsTxtContent = settings.robotsTxt || defaultRobotsTxt;

    return new NextResponse(robotsTxtContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}
