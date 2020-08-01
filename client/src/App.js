import React from "react";
import { Router, Switch, Route, Redirect } from "react-router-dom";
import socketIOClient from "socket.io-client";
import dotenv from "dotenv";
import { createBrowserHistory } from "history";
import { Helmet } from "react-helmet";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Header from "./components/Header";
import Footer from "./components/Footer";
import MainPage from "./components/MainPage";
import AdminPage from "./components/AdminPage";
import LocationsContext from "./util/LocationsContext";

dotenv.config();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: {},
      title: "",
      loading: true,
    };

    this.history = createBrowserHistory();
  }

  componentDidMount() {
    // handle the socket events
    const socket = socketIOClient(
      process.env.REACT_APP_DEV ? "http://localhost:8080" : ""
    );

    socket.on("title", (data) => {
      this.setState({
        title: data,
      });
    });

    socket.on("locations", (data) => {
      this.setState({
        locations: data,
        loading: false,
      });
    });

    socket.on("update", (data) => {
      for (let locationID in data) {
        if (!(locationID in this.state.locations)) {
          console.error(
            "Server updating " + locationID + ", unknown to client."
          );
          continue;
        }

        // update the data

        this.setState((s) => ({
          locations: {
            ...s.locations,
            [locationID]: {
              ...s.locations[locationID],
              ...data[locationID],
            },
          },
        }));
      }
    });
  }

  render() {
    return (
      <div className='App'>
        <Helmet>
          <title>{this.state.title}</title>
        </Helmet>
        {this.state.loading && (
          <h3 style={{ textAlign: "center", marginTop: "50px" }}>Loading...</h3>
        )}
        {!this.state.loading && (
          <>
            <LocationsContext.Provider value={this.state.locations}>
              <Router history={this.history}>
                <Header title={this.state.title} />
                <div className='content'>
                  <Switch>
                    <Route path='/admin'>
                      <AdminPage />
                    </Route>
                    <Route path='/:e'>
                      <Redirect to='/' />
                    </Route>
                    <Route path='/'>
                      <MainPage />
                    </Route>
                  </Switch>
                </div>
                <Footer />
              </Router>
            </LocationsContext.Provider>
          </>
        )}
      </div>
    );
  }
}

export default App;
