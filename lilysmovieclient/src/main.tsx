import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MovieFun from './MovieFun/MovieFun.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MovieFun />
    </StrictMode>,
);