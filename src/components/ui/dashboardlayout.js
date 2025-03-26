import * as React from 'react';
import { styled } from '@mui/material/styles';
import { AppProvider, Navigation, Router } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Users from "../../pages/Users";
import UserProfilePage from "../../pages/User";
import theme from "../../theme";
import {LocationCity, Rule, Schema, VerifiedUser} from "@mui/icons-material";
import {Chip} from "@mui/material";
import UnificationRule from "../../pages/UnificationRule";

const NAVIGATION: Navigation = [
    {
        segment: 'users',
        title: 'User Profiles',
        icon: <VerifiedUser />,
    },
    {
        segment: 'unification_rules',
        title: 'Unification Rules',
        icon: <Rule />,
    },
    {
        segment: '#upcoming-datamodel',
        title: 'Data Model',
        icon: <Schema sx={{ opacity: 0.4 }}/>,
        action: <Chip label="Upcoming" size="small" color="info" />,
    },
    {
        segment: '#upcoming-residency',
        title: 'Data Residency',
        icon: <LocationCity sx={{ opacity: 0.4 }} />,
        action: <Chip label="Upcoming" size="small" color="info" />,

    },
];


function useRouter(initialPath: string): Router {
    const [pathname, setPathname] = React.useState(initialPath);

    const router = React.useMemo(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path: string | URL) => setPathname(String(path)),
        };
    }, [pathname]);

    return router;
}

const Skeleton = styled('div')(({ theme, height }: { theme: any; height: number }) => ({
    backgroundColor: theme.palette.action.hover,
    borderRadius: theme.shape.borderRadius,
    height,
}));

export default function DashboardLayoutBasic(props: any) {

    const router = useRouter('/users');

    return (
        <AppProvider
            navigation={NAVIGATION}
            router={router}
            theme={theme}
            // window={demoWindow}
        >
            <DashboardLayout
                branding={{
                logo: (
                    <img
                        src="/logo.png"
                        alt="Custodian Console"
                        style={{ height: 130, marginRight: 8 }}
                    />
                ),
                title: "Custodian Console",
            }}
                >
                <PageContainer>
                    {router.pathname === '/users' && <Users router={router} />}
                    {router.pathname.startsWith('/users/') && router.pathname !== '/users' && (
                        <UserProfilePage router={router} />
                    )}
                    {router.pathname === '/unification_rules' && <UnificationRule />}
                    {router.pathname === '#upcoming-residency' && null}
                    {router.pathname === '#upcoming-datamodel' && null}
                </PageContainer>
            </DashboardLayout>
        </AppProvider>
    );
}
