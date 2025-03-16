import { useState } from 'react';
import { ReactSelectOption } from '../Index';
import AsyncSelect from 'react-select/async';

import './MovieFun.scss';
import actorImage from './assets/actor.jpg';
import movieImage from './assets/movie.jpg';

// Interface for the Suggestion object
interface Suggestion
{
    movie_id: number;
    title: string;
    popularity_rank: string;
}

// Interface for the Film object
interface Film
{
    id: number;
    name: string;
    image: string;
    releaseYear: string;
    cast: Actor[];
    hide?: boolean;
}

// Interface for the Actor object
interface Actor
{
    id: number;
    name: string;
    title: string;
    image: string;
    movies: Film[];
    hide?: boolean;
}

// Main component function
function MovieFun()
{
    // API endpoints
    const suggestionUrl = 'https://hl78jfo6al.execute-api.us-east-2.amazonaws.com/Lily/MovieFun/GetSuggestions?search=';
    const getMovieUrl = 'https://hl78jfo6al.execute-api.us-east-2.amazonaws.com/Lily/MovieFun/GetMovie';
    const getMovieByNameUrl = 'https://hl78jfo6al.execute-api.us-east-2.amazonaws.com/Lily/MovieFun/GetMovieByName?nameYear=';
    const getLinksUrl = 'https://hl78jfo6al.execute-api.us-east-2.amazonaws.com/Lily/MovieFun/GetLinksForActor';

    // State variables
    const [film, setFilm] = useState<Film>();
    const [actors, setActors] = useState<Actor[]>([]);
    const [selected, setSelected] = useState([]);

    const [isActor, setIsActor] = useState<boolean>();

    const [actor, setActor] = useState<Actor>();
    const [films, setFilms] = useState<Film[]>([]);

    // Maps API response to values and labels for the select component
    const mapResponseToValuesAndLabels = (data: Suggestion) => ({
        value: data.movie_id,
        label: data.title,
    });

    // Fetches movie suggestions based on user input
    const getSuggestions = async (value: string) =>
    {
        const res = await fetch(suggestionUrl + value);
        const data = await res.json();
        const results = data.suggestions.map(mapResponseToValuesAndLabels);

        // If no results found, return an empty array
        if (results === 'No result found.')
        {
            return [];
        }

        return results;
    };

    // Handles movie selection from the dropdown
    async function selectMovie(option: ReactSelectOption)
    {
        setSelected([]);
        const movieResponse = await fetch(getMovieByNameUrl + option.label);
        const film: Film = await movieResponse.json();
        changeMovie(film);
    }

    // Handles movie click event
    async function movieClickHandler(id: number)
    {
        const movieResponse = await fetch(getMovieUrl + "?movieId=" + id);
        const film: Film = await movieResponse.json();
        changeMovie(film);
    }

    // Updates the state with the selected movie and its cast
    async function changeMovie(film: Film)
    {
        setIsActor(false);
        setFilm(film);

        film.cast = film.cast.slice(0, 45);

        setActors([...film.cast]);

        // Fetches additional links for each actor in the cast
        const fetchLinks = async (url: string) =>
        {
            const actorResponse = await fetch(url);
            const actor: Actor = await actorResponse.json();
            const actorObj = film.cast.find(a => a.id == actor.id);

            if (actorObj != null)
            {
                if (actor.movies.length < 1)
                {
                    actorObj.hide = true;
                } else
                {
                    actorObj.movies = actor.movies;
                }
            }
            setActors([...film.cast]);
        };

        let delay = 0; const delayIncrement = 500;

        const promises = film.cast.map(async (actor) =>
        {
            delay += delayIncrement;
            return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
                fetchLinks(getLinksUrl + "?actorId=" + actor.id + '&movieId=' + film.id));
        });

        // Fetch links for all actors in the cast
        await Promise.all(promises);

        window.scrollTo(0, 0);
    }

    // Handles movie click event
    async function actorClickHandler(id: number)
    {
        const actorResponse = await fetch(getLinksUrl + "?actorId=" + id);
        const actor: Actor = await actorResponse.json();
        changeActor(actor);
    }

    // Updates the state with the selected movie and its cast
    async function changeActor(actor: Actor)
    {
        setIsActor(true);
        setActor(actor);

        actor.movies = actor.movies.slice(0, 45);

        setFilms([...actor.movies]);

        // Fetches additional links for each actor in the cast
        const fetchLinks = async (url: string) =>
        {
            const movieResponse = await fetch(url);
            const movie: Film = await movieResponse.json();
            const movieObj = actor.movies.find(a => a.id == movie.id);

            if (movieObj != null)
            {
                if (movie.cast.length < 1)
                {
                    movieObj.hide = true;
                } else
                {
                    movieObj.cast = movie.cast;
                }
            }
            setFilms([...actor.movies]);
        };

        let delay = 0; const delayIncrement = 500;

        const promises = actor.movies.map(async (movie) =>
        {
            delay += delayIncrement;
            return new Promise(resolve => setTimeout(resolve, delay)).then(() =>
                fetchLinks(getMovieUrl + "?movieId=" + movie.id + '&actorId=' + actor.id));
        });

        // Fetch links for all actors in the cast
        await Promise.all(promises);

        window.scrollTo(0, 0);
    }

    // JSX content for rendering the component
    const contents =
        <div className="_body">

            <div className="_titleRow">
                <div className="_actorCell">
                    {film != null &&
                        <img
                            src={isActor ? (actor?.image || actorImage) : (film?.image || movieImage)}
                            className="_poster _light"
                            style={{ cursor: "default" }}
                        />
                    }
                </div>
                <div className="_selectRow">
                    <div className="_select">
                        <AsyncSelect
                            cacheOptions
                            loadOptions={getSuggestions}
                            defaultOptions={false}
                            value={selected}
                            noOptionsMessage={() => null}
                            components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
                            openMenuOnFocus={false}
                            openMenuOnClick={false}
                            onChange={(selectedOption: ReactSelectOption | null) => ((selectedOption != null) && selectMovie(selectedOption))}

                            theme={(theme) => ({
                                ...theme,

                                //borderRadius: 0,
                                colors: {
                                    ...theme.colors,
                                    neutral80: 'ffd6f1',
                                    primary25: '#4d3147',
                                    primary: '#ffd6f1',
                                    neutral0: '#121212'
                                },
                            })}
                        />
                    </div>

                    <div className="_headerTitle">
                        {(isActor ? actor?.name : film?.name) || "Select a movie to get started..."}
                    </div>
                    <div className="_headerSubTitle">
                        {(isActor ? "" : film?.releaseYear) || "\u2028"}
                    </div>
                </div>
            </div>
            {!isActor &&
                <div>
                    {actors.map((actor) =>
                    {
                        return !actor.hide &&
                            <div className="_actorRow">
                                <div className="_actorCell">
                                    <img
                                        src={actor?.image || actorImage}
                                        className="_poster _light"
                                        onClick={() => actorClickHandler(actor.id)}
                                    />
                                    <div className="_movieTitle">
                                        {actor.name}
                                    </div>
                                    <div className="_movieSubTitle">
                                        {actor.title}
                                    </div>
                                </div>
                                <div className="_borderRow">
                                    <div className="_scrollRow">
                                        <div className="_movieRow">
                                            {actor?.movies?.map((movie) =>
                                            {
                                                return <div className="_movieCell">
                                                    <img
                                                        src={movie?.image || movieImage}
                                                        className="_poster"
                                                        onClick={() => movieClickHandler(movie.id)}
                                                    />
                                                    <div className="_movieTitle">
                                                        {movie.name}
                                                    </div>
                                                    <div className="_movieSubTitle">
                                                        {movie.releaseYear}
                                                    </div>
                                                </div>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>;
                    })}
                </div>
            }

            {isActor &&
                <div>
                    {films.map((film) =>
                    {
                        return !film.hide &&
                            <div className="_actorRow">
                                <div className="_actorCell">
                                    <img
                                        src={film?.image || movieImage}
                                        className="_poster _light"
                                        onClick={() => movieClickHandler(film.id)}
                                    />
                                    <div className="_movieTitle">
                                        {film.name}
                                    </div>
                                    <div className="_movieSubTitle">
                                        {film.releaseYear}
                                    </div>
                                </div>
                                <div className="_borderRow">
                                    <div className="_scrollRow">
                                        <div className="_movieRow">
                                            {film?.cast?.map((actor) =>
                                            {
                                                return <div className="_movieCell">
                                                    <img
                                                        src={actor?.image || actorImage}
                                                        className="_poster"
                                                        onClick={() => actorClickHandler(actor.id)}
                                                    />
                                                    <div className="_movieTitle">
                                                        {actor.name}
                                                    </div>
                                                    <div className="_movieSubTitle">
                                                        {actor.title}
                                                    </div>
                                                </div>;
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>;
                    })}
                </div>
            }
        </div>;

    // Render the component
    return (
        <div className="_container">
            <link href='https://fonts.googleapis.com/css?family=Oswald' rel='stylesheet' />
            {contents}
        </div>
    );
}

export default MovieFun;