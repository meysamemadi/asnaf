import { Link } from '@inertiajs/react';
import {BookOpen, FolderGit2, LayoutGrid, MapPinned, SquareStack , AlignVerticalDistributeStart , Store , MapPin} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'داشبورد',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'دسته‌بندی‌ها',
        href: '/admin/categories',
        icon: SquareStack,
    },
    {
        title: 'نمایندگی ها',
        href: '/admin/brands',
        icon: AlignVerticalDistributeStart,
    },

    {
        title: 'تعمیرگاه',
        href: '/admin/repair-shops',
        icon: Store,
    },
    {
        title: 'استان‌ها',
        href: '/admin/provinces',
        icon: MapPinned,
    },
    {
        title: 'شهرها',
        href: '/admin/cities',
        icon: MapPin,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar side={"right"} collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
