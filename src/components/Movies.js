import React from "react";
import "../App.css";
import { fetchMovies, fetchGenres } from "../models/fetchData";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import "../App.css";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import RefreshIcon from '@material-ui/icons/Refresh';
import { yellow } from "@material-ui/core/colors";
import sortArray from "../utils/sortArray";
import Tooltip from '@material-ui/core/Tooltip';



export default class Movies extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            items: [],
            title: "",
            genre: "",
            year: null,
            page: 1,
            genreList: []
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


    render() {
        const { isLoading, items, genre, title } = this.state;

        if (isLoading) { return <div>Loading...</div> }

        return (
            <div>
                {/* CommandBar */}
                <div className="commandBar">
                    <FormControl style={{ width: "200px" }} >
                        <InputLabel id="demo-simple-select-label">Genre</InputLabel>

                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={genre}
                            onChange={(e) => this.handleGenre(e)}
                        >
                            {
                                this.optionsGenres()
                            }
                        </Select>
                    </FormControl>

                    <TextField
                        style={{ marginLeft: "35px" }}
                        id="standard-basic"
                        label="Search by title"
                        onChange={this.handleTitle}
                        value={title}
                    />

                    <Tooltip title="Reset filters">
                        <RefreshIcon
                            style={{ fontSize: '30px', margin: '12px 0 0 15px', cursor: 'pointer' }}
                            onClick={this.clearFilter}
                        />
                    </Tooltip>
                </div>

                {/* DataTable */}
                <TableContainer component={Paper} className="table-style">
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Genre</TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableHead>


                        <TableBody>
                            {items.map((item, i) => (
                                <TableRow key={i} >
                                    <TableCell component="th" scope="row">
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                                            alt={item.title}
                                            className="movie-poster"
                                        />

                                    </TableCell>

                                    <TableCell component="th" scope="row" className="movie-title">
                                        {item.title}
                                    </TableCell>

                                    <TableCell align="right">
                                        {item.release_date ? item.release_date : item.first_air_date}
                                    </TableCell>

                                    <TableCell align="right" className="genre-style">
                                        {
                                            this.renderGenres(item.genre_ids) // display the list of genres for each movie
                                        }
                                    </TableCell>

                                    <TableCell align="right">
                                        <Tooltip title={item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}>
                                            <StarBorderIcon
                                                onClick={() => this.manageFavorites(item.id)}
                                                sx={{ color: item.isFavorite ? yellow[500] : null }} // color the icon if the movie is added to favorites
                                                className="favorite-icon"
                                            />
                                        </Tooltip>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div >
        );
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
                    newData.push({
                        id: movie.id,
                        poster_path: movie.poster_path,
                        title: movie.title ? movie.title : movie.name,
                        release_date: movie.release_date ? movie.release_date : movie.first_air_date,
                        genre_ids: movie.genre_ids,
                        isFavorite
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
}