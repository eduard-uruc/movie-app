
export const fetchMovies = (page) => {
    return fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.REACT_APP_API_KEY}&page=${page}`)
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.error(err);
        });
}

export const fetchGenres = () => {
    return fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`)
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.error(err);
        });
}