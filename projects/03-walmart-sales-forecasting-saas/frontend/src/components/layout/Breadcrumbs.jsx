import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show on dashboard (home)
    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
        return null; // Or show simple "Dashboard" if preferred
    }

    return (
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center text-sm text-text-tertiary mb-6">
            <Link
                to="/dashboard"
                className="flex items-center hover:text-brand-600 transition-colors"
            >
                <Home className="w-4 h-4 mr-1" />
                <span>Home</span>
            </Link>

            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                // Format name: "forecast-explorer" -> "Forecast Explorer"
                const displayName = name
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return (
                    <React.Fragment key={name}>
                        <ChevronRight className="w-4 h-4 mx-2 text-text-quaternary" />
                        {isLast ? (
                            <span className="font-medium text-text-primary" aria-current="page">
                                {displayName}
                            </span>
                        ) : (
                            <Link
                                to={routeTo}
                                className="hover:text-brand-600 transition-colors"
                            >
                                {displayName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
