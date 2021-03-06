window.React = require('react');
import React from "react";
import "../App.css";
import SortableTable from 'react-sortable-table';
import { fetchMovies, fetchGenres } from "../models/fetchData";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import sortArray from "../utils/sortArray";
import Tooltip from '@material-ui/core/Tooltip';
import MenuItem from "@material-ui/core/MenuItem";
import moment from 'moment';

function getFamilyName(name) {
    return name;
}

const FamilyNameSorter = {
    desc: (data, key) => {
        var result = data.sort(function (_a, _b) {
            const a = getFamilyName(_a[key]);
            const b = getFamilyName(_b[key]);
            if (a <= b) {
                return 1;
            } else if (a > b) {
                return -1;
            }
        });
        return result;
    },

    asc: (data, key) => {
        return data.sort(function (_a, _b) {
            const a = getFamilyName(_a[key]);
            const b = getFamilyName(_b[key]);
            if (a >= b) {
                return 1;
            } else if (a < b) {
                return -1;
            }
        })
    }
};

export default class App22 extends React.Component {
    constructor() {
        super()
        this.state = {
            isLoading: true,
            items: [],
            title: "",
            genre: "",
            year: null,
            page: 1,
            genreList: [],
        };
    }

    componentDidMount() {
        const { genre, title, page } = this.state;
        const favoritesList = JSON.parse(localStorage.getItem("favorites"))

        this.getGenresList();
        this.generateDocument(genre, title, page);

        // create localStorage array for favorite movies (only if it's not created yet)
        !favoritesList && localStorage.setItem("favorites", JSON.stringify([]));
    }

    render() {
        const columns = [
            {
                header: '',
                key: 'poster'
            },
            {
                header: 'Title',
                key: 'title',
                headerStyle: { fontSize: '15px' },
                headerProps: { className: 'align-left' },
                descSortFunction: FamilyNameSorter.desc,
                ascSortFunction: FamilyNameSorter.asc
            },
            {
                header: 'release_date',
                key: 'release_date',
                headerStyle: { fontSize: '15px' },
                headerProps: { className: 'align-left' },
                descSortFunction: FamilyNameSorter.desc,
                ascSortFunction: FamilyNameSorter.asc
            },
            {
                header: 'genres',
                key: 'genres',
                headerStyle: { fontSize: '15px' },
                sortable: false
            },
            {
                header: '',
                key: 'favorites',
                headerStyle: { fontSize: '15px' },
                sortable: false
            },
        ];

        const style = {
            // backgroundColor: '#eee'
        };

        const iconStyle = {
            color: '#aaa',
            paddingLeft: '5px',
            paddingRight: '5px'
        };

        const { items } = this.state;

        return (
            <div className="container">
                <SortableTable
                    data={items}
                    columns={columns}
                    style={style}
                    iconStyle={iconStyle} />
            </div>

        );
    }

    componentDidUpdate(prevProps, prevState) {
        const { genre, title, page } = this.state;

        if (prevState.genre !== genre || prevState.title !== title) {
            this.generateDocument(genre, title, page);
        }
    }

    handleGenre = (event) => {
        this.setState({ genre: event.target.value });
    }

    handleTitle = (event) => {
        this.setState({ title: event.target.value });
    }

    // options fot the << title >> dropdown list used for filtering
    optionsGenres = () => {
        const { genreList } = this.state;

        return genreList.map((item, index) => {
            return <MenuItem key={index} value={item.id} onChange={(e) => this.handleGenre(e)}>{item.name}</MenuItem>;
        })
    }

    clearFilter = () => {
        this.setState({
            genre: "",
            title: ""
        })
    }

    // because a movie falls into several genres, we created a genre list per movie
    renderGenres = (genre_ids) => {
        const { genreList } = this.state;
        let newArr = "";

        // loop over movie genres
        genre_ids.map((genre_id, i) => {
            // compare movie genres with the all list of genres in order to get the name based on id
            genreList.map((item) => {
                if (item.id === genre_id) {

                    if (genre_ids.length === i + 1) {
                        newArr += item.name;
                    } else {
                        newArr += `${item.name}, `;
                    }

                }
            })
        })

        return newArr;
    }

    generateDocument = (genreFilter, titleFilter, currentPage) => {
        fetchMovies(currentPage)
            // filter by genre
            .then(res => {
                if (genreFilter && res) {
                    return res.results.filter(item => item.genre_ids.includes(genreFilter))
                } else {
                    return res.results
                }
            })
            // filter by title
            .then(result => {
                // return only those movies where the title is similar to the searched word
                if (titleFilter) {
                    return result.filter((movie) => {
                        let string = movie.title ? movie.title : movie.name;
                        string = string.toLowerCase();
                        let regex = new RegExp(titleFilter.toLowerCase(), "g");

                        if (string.match(regex)) {
                            /*Match found */
                            return movie;
                        }
                    });
                }
                // return all results if the << title >> filter is not used
                else {

                    return result;
                }
            })
            .then((filteredData) => {
                // get favorite movies from localStorage
                const favoritesList = JSON.parse(localStorage.getItem("favorites"))
                const newData = [];

                filteredData.map((movie) => {
                    const isFavorite = favoritesList.includes(movie.id);
                    const ReleaseDate = movie.release_date ? movie.release_date : movie.first_air_date;
                    const Title = movie.title ? movie.title : movie.name;
                    const Favorite =
                        <Tooltip title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                            <StarBorderIcon
                                onClick={() => this.manageFavorites(movie.id)}
                                sx={{ color: isFavorite ? "yellow" : null }} // color the icon if the movie is added to favorites
                                className="favorite-icon"
                            />
                        </Tooltip>;

                    newData.push({
                        id: movie.id,
                        title: Title,
                        release_date: moment(ReleaseDate).format('L'),
                        isFavorite,
                        genres: this.renderGenres(movie.genre_ids),
                        poster: <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} className="movie-poster" />,
                        favorites: Favorite
                    });
                })

                // sort movies ascending
                const sortedArray = sortArray(newData, "title", false);

                this.setState({
                    items: sortedArray,
                    isLoading: false
                });
            })
            .catch((err) => {
                console.log("An error occurred trying to fetch movies. " + err);
            });
    }

    // get the genre list exposed by the API
    getGenresList = () => {
        fetchGenres()
            .then(res => {
                this.setState({
                    genreList: res ? res.genres : [],
                });
            }).catch((err) => {
                console.log("An error occurred trying to fetch genres data. " + err);
            });
    }

    manageFavorites = (id) => {
        const { genre, title, page } = this.state;
        // retrive favorite movies from localStorage
        let favoritesArray = JSON.parse(localStorage.getItem("favorites"));
        // check if it"s already saved
        const isAlreadySaved = favoritesArray.includes(id);

        // onClick, if it"s already saved, remove the movie from favorites
        if (isAlreadySaved) {
            const index = favoritesArray.indexOf(id);
            if (index > -1) {
                favoritesArray.splice(index, 1);
            }
        }
        // if it"s not saved then add it to favorites
        else {
            favoritesArray.push(id);
        }

        // update data in localStorage
        localStorage.setItem("favorites", JSON.stringify(favoritesArray));

        // refresh table content
        this.generateDocument(genre, title, page);
    }
}
