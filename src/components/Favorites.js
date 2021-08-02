import React from 'react';
import { fetchMovies, fetchGenres } from "../models/fetchData";
import SortableTable from 'react-sortable-table';
import StarBorderIcon from "@material-ui/icons/StarBorder";
import sortArray from "../utils/sortArray";
import Tooltip from '@material-ui/core/Tooltip';
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


export default class Characters extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            genreList: [],
        };
    }

    componentDidMount() {
        this.generateDocument(1);
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

    generateDocument = (currentPage) => {
        const favorites = JSON.parse(localStorage.getItem("favorites"))

        fetchMovies(currentPage)
            // extract only favorite movies
            .then(res => {
                return res.results.filter(item => favorites.includes(item.id));
            })
            .then((filteredData) => {
                const newData = [];

                filteredData.map((movie) => {
                    const ReleaseDate = movie.release_date ? movie.release_date : movie.first_air_date;
                    const Title = movie.title ? movie.title : movie.name;
                    const Favorite =
                        <Tooltip title="Remove from Favorites">
                            <StarBorderIcon
                                onClick={() => this.manageFavorites(movie.id)}
                                sx={{ color: "yellow" }}
                                className="favorite-icon"
                            />
                        </Tooltip>;

                    newData.push({
                        id: movie.id,
                        title: Title,
                        release_date: moment(ReleaseDate).format('L'),
                        isFavorite: true,
                        genres: this.renderGenres(movie.genre_ids),
                        poster: <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} className="movie-poster" />,
                        favorites: Favorite
                    });
                });

                // sort movies ascending
                const sortedArray = sortArray(newData, "title", false);

                this.setState({ items: sortedArray });
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
        // retrive favorite movies from localStorage
        let favoritesArray = JSON.parse(localStorage.getItem("favorites"));

        //  remove the movie from favorites
        const index = favoritesArray.indexOf(id);
        if (index > -1) {
            favoritesArray.splice(index, 1);
        }

        // update data in localStorage
        localStorage.setItem("favorites", JSON.stringify(favoritesArray));

        // refresh table content
        this.generateDocument(1);
    }

}