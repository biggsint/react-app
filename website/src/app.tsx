import './App.css'
import {useEffect} from 'react';
import {useAuth} from 'react-oidc-context';
import {BrowserRouter} from 'react-router-dom';
import type {NavigationItem} from './lib/navigation/site-map';
import {AppLayout} from "./views/AppLayout.tsx";
import { setAuthCookies, clearAuthCookies, getAuthCookies } from './lib/auth/cookieAuth';

// Sample navigation tree (replace with actual import or fetch)
const navigationTree: NavigationItem[] = [
    {
        name: 'Motor',
        description: 'Motor boards',
        liveboards: [
            {name: 'Ancil Explorer', description: 'Explore the ancilliary landscape by understanding how your competitors are including, and pricing add-ons', thoughtspotId: 'b173faa2-e861-4540-a232-853f7aeb2c37', imageUrl: '/assets/ancil-dash.jpg'},
            {name: 'Delta Analysis', description: 'Measures your copetitiveness by explore the position from the top of the search results based on your risk filters. ', thoughtspotId: 'lb2', imageUrl: '/assets/delta-dash.jpg'},
            {name: 'Clickouts', description: 'Measure, how, and when users click your quotes to view the details. Helps you understand if users are happy with the finer points of your products', thoughtspotId: 'lb3', imageUrl: '/assets/clickouts-dash.jpg'}

        ]
    },
    {
        name: 'Home',
        description: 'Home Boards',
        liveboards: [
            {name: 'Ancils', description: 'Ancil Performance', thoughtspotId: 'lb4', imageUrl: ''},
            {name: 'Delta', description: 'Delta Positions', thoughtspotId: 'lb5', imageUrl: ''},
            {name: 'Clickouts', description: 'Clickouts', thoughtspotId: 'lb6', imageUrl: ''}
        ]
    },
    {
        name: 'Van',
        description: 'Van Boards',
        liveboards: [
            {name: 'Ancils', description: 'Ancil Performance', thoughtspotId: 'lb7', imageUrl: ''},
            {name: 'Delta', description: 'Delta Positions', thoughtspotId: 'lb8', imageUrl: ''},
            {name: 'Clickouts', description: 'Clickouts', thoughtspotId: 'lb9', imageUrl: ''}
        ]
    }
];

function App() {
    const auth = useAuth();

    // Persist tokens to cookies on login
    useEffect(() => {
        if (auth.isAuthenticated && auth.user) {
            setAuthCookies({
                id_token: auth.user.id_token,
                access_token: auth.user.access_token,
                refresh_token: auth.user.refresh_token
            });
        }
    }, [auth.isAuthenticated, auth.user?.id_token]);

    // Restore auth from cookies if not authenticated
    useEffect(() => {
        if (!auth.isAuthenticated) {
            const tokens = getAuthCookies();
            if (tokens.id_token && auth.signinSilent) {
                auth.signinSilent();
            }
        }
    }, [auth.isAuthenticated]);

    // Clear cookies on logout
    useEffect(() => {
        if (!auth.isAuthenticated) {
            clearAuthCookies();
        }
    }, [auth.isAuthenticated]);

    useEffect(() => {
        if (auth.isAuthenticated) {
            console.log('User is authenticated');
        }
    }, [auth.isAuthenticated, auth.user?.id_token]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }
    if (auth.error) {
        return <div>Authentication Error: {auth.error.message}</div>;
    }
    return (
        !auth.isAuthenticated ? (
            <button onClick={() => auth.signinRedirect()}>
                Sign In
            </button>
        ) : (
            <BrowserRouter>
                <AppLayout navigationTree={navigationTree} />
            </BrowserRouter>
        )
    );
}

export default App
