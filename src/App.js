import "./App.css";
import Movies from "./components/Movies";
import Favorites from "./components/Favorites";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div>

        <nav>
          <ul className="menu">
            <li>
              <NavLink exact={true} activeClassName='is-active' to="/">Movies</NavLink>
            </li>
            <li>
              <NavLink activeClassName='is-active' to="/favorites">Favorites</NavLink>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/favorites">
            <Favorites />
          </Route>
          <Route path="/">
            <Movies />
          </Route>
        </Switch>

      </div>
    </Router>
  );
}

export default App;
