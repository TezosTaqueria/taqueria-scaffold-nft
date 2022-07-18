import { useState, useRef, useEffect } from "react";

export const useHistory = () => {
    const [location, setLocation] = useState({ href: window.location.href });
    const lastHref = useRef(window.location.href);

    useEffect(() => {
        const handler = (ev: PopStateEvent) => {
            setTimeout(() => {
                const href = window.location.href;
                console.log(`useLocation - popstate handler`, { href, lastHref: lastHref.current })
                lastHref.current = href;
                setLocation({ href });
            });
        };

        // handler();
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);

    return {
        location,
        history: {
            pushState: (_: null, ignore: '', url: string) => {
                window.history.pushState(_, '', url);
                setLocation({ href: url });
            }
        }
    };
};