import * as React from 'react';
import { styled } from '@mui/material/styles';
import { AppProvider, Navigation, Router } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { PageContainer } from '@toolpad/core/PageContainer';
import Users from "../../pages/Users";
import UserProfilePage from "../../pages/User";
import theme from "../../theme";
import {
    Event,
    EventBusyOutlined,
    EventBusyRounded,
    LocationCity,
    Rule,
    Schema,
    VerifiedUser
} from "@mui/icons-material";
import {Chip} from "@mui/material";
import UnificationRule from "../../pages/UnificationRule";
import SchemaRulesPage from "../../pages/ProfileEnrichment";
import EventSchema from "../../pages/EventSchema";
import EventSchemasPage from "../../pages/EventSchema";
import ProfileTraitsPage from "../../pages/ProfileEnrichment";
import EventExplorerPage from "../../pages/EventExplorer";

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
        segment: 'profile_building',
        title: 'Profile Enrichment',
        icon: <Schema />,
    },
    // {
    //     segment: 'event_schema',
    //     title: 'Event Schema',
    //     icon: <EventBusyOutlined />,
    // },
    {
        segment: 'event_explorer',
        title: 'Event Explorer',
        icon: <EventBusyRounded />,
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
                        alt="WSO2 Identity Server"
                        style={{ height: 130, marginRight: 8 }}
                    />
                ),
                title: "WSO2 Identity Server",
            }}
                >
                <PageContainer breadcrumbs={[]}>
                    {router.pathname === '/users' && <Users router={router} />}
                    {router.pathname.startsWith('/users/') && router.pathname !== '/users' && (
                        <UserProfilePage router={router} />
                    )}
                    {router.pathname === '/unification_rules' && <UnificationRule />}
                    {router.pathname === '/profile_building' && <ProfileTraitsPage />}
                    {router.pathname === '/event_schema' && <EventSchemasPage />}
                    {router.pathname === '/event_explorer' && <EventExplorerPage />}
                </PageContainer>
            </DashboardLayout>
        </AppProvider>
    );
}
