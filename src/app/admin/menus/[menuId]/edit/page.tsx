
import MenuForm from "@/components/admin/menu-form";
import { notFound } from "next/navigation";
import fs from 'fs/promises';
import path from 'path';
import { Menu } from "@/lib/data";
import { getSettings } from "@/lib/settings";

async function getMenus(): Promise<Menu[]> {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'menus.json');
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data) as Menu[];
    } catch (error) {
        return [];
    }
}

export default async function EditMenuPage({ params }: { params: { menuId: string } }) {
    const menus = await getMenus();
    const menu = menus.find(m => m.id === params.menuId);
    const settings = await getSettings();

    if (!menu) {
        notFound();
    }

    return <MenuForm menu={menu} settings={settings} />;
}
