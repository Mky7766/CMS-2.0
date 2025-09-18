
import { getSettings } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ThemeForm from "@/components/admin/theme-form";

export default async function CustomizePage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customize</h1>
        <p className="text-muted-foreground">
          Change the look and feel of your site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>
            Select the primary colors for your website's theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
