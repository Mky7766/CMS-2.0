
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TopReferrersCardProps = {
  referrers: { name: string; value: number }[];
};

export default function TopReferrersCard({ referrers }: TopReferrersCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
        <CardDescription>
          Websites sending the most referral traffic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referrers.length > 0 ? (
          <div className="space-y-4">
            {referrers.map((referrer, index) => (
              <div
                key={index}
                className="flex items-center justify-between"
              >
                <a
                  href={`https://${referrer.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:underline text-sm truncate"
                >
                  {referrer.name}
                </a>
                <span className="font-bold text-sm text-muted-foreground">
                  {referrer.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No referrer data for this period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

    