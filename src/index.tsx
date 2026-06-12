import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Admin } from './pages/Admin/index.jsx';
import { AdminLivePreview } from './pages/Admin/admin-live-preview.jsx';
import { AdminStatus } from './pages/Admin/Status.jsx';
import { AdminStreams } from './pages/Admin/Streams.jsx';
import { AdminUsers } from './pages/Admin/Users.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';
import { Watch } from './pages/Watch/index.jsx';
import './style.css';

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
	navigator.serviceWorker.getRegistrations().then((registrations) => {
		for (const registration of registrations) {
			registration.unregister();
		}
	});

	if ('caches' in window) {
		caches.keys().then((keys) => {
			for (const key of keys) {
				caches.delete(key);
			}
		});
	}
}

export function App() {
	return (
		<LocationProvider>
			<main>
				<Router>
					<Route path="/" component={Home} />
					<Route path="/admin" component={Admin} />
					<Route path="/admin/users" component={AdminUsers} />
					<Route path="/admin/streams" component={AdminStreams} />
					<Route path="/admin/status" component={AdminStatus} />
					<Route path="/watch" component={Watch} />
					<Route default component={NotFound} />
				</Router>
			</main>
			<AdminLivePreview />
		</LocationProvider>
	);
}

const app = document.getElementById('app');

if (!app) {
	throw new Error('App root element was not found.');
}

render(<App />, app);
