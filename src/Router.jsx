// src/Router.jsx
import { useState, useEffect, createContext, useContext } from "react";

const RouterContext = createContext();

export function Router({ routes, children }) {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
  };

  const route = routes.find((r) => r.url === path) || routes[0];

  return (
    <RouterContext.Provider value={{ path, component: route.component, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function usePage() {
  return useContext(RouterContext);
}

export function Link({ href, children, ...props }) {
  const { navigate } = usePage();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
