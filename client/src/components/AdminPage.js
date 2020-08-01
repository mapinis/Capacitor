import React from "react";
import Login from "./Login";
import callAPI from "../util/callAPI";
import LocationsContext from "../util/LocationsContext";
import LocationCard from "./LocationCard";
import { Button, ButtonGroup, InputGroup, FormControl } from "react-bootstrap";

import "./AdminPage.css";

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      locationID: null,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleEdit = this.handleEdit.bind(this);

    this.setPopulationRef = React.createRef();
  }

  static contextType = LocationsContext;

  componentDidMount() {
    // if already logged in, just get the location ID, no need for login screen

    this.setState({ checked: false });

    callAPI("getLocationID").then((res) => {
      this.setState({ checked: true });
      if (res.status === 200) {
        return res.json().then((data) => {
          this.setState({ locationID: data.locationID });
        });
      }
    });
  }

  handleLogin(locationID) {
    this.setState({
      locationID: locationID,
    });
  }

  handleLogout() {
    callAPI("logout", { method: "POST" }).then((res) => {
      if (res.status !== 200) {
        return res.json().then((json) => {
          if (json.error) {
            alert(json.error.message);
          }
        });
      }

      this.setState({
        locationID: null,
      });
    });
  }

  handleEdit(endpoint) {
    const options = { method: "POST" };

    if (endpoint === "setPopulation") {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify({
        newPop: this.setPopulationRef.current.value,
      });
    }

    callAPI(endpoint, options).then((res) => {
      if (res.status !== 200) {
        return res.json().then((json) => {
          if (json.error) {
            alert(json.error.message);
          }
        });
      }
    });
  }

  render() {
    const locationID = this.state.locationID;
    const locationData = locationID ? this.context[locationID] : {};

    if (!this.state.checked) {
      return null;
    }

    return (
      <div className='AdminPage'>
        <div className='AdminTitle'>
          {!locationID && "Admin Login"}
          {locationID && (
            <>
              <div>{locationData.name} Admin Panel</div>
              <Button variant='outline-dark' onClick={this.handleLogout}>
                Sign Out
              </Button>
            </>
          )}
        </div>
        {!locationID && <Login onSuccess={this.handleLogin} />}
        {locationID && (
          <div className='AdminBody'>
            <LocationCard locationID={locationID} />
            <div className='AdminEdit'>
              <ButtonGroup className='OpenCloseEdit AdminEditItem'>
                <Button
                  variant='success'
                  onClick={() => this.handleEdit("toggleOpen")}
                  disabled={locationData.open}
                >
                  Open
                </Button>
                <Button
                  variant='danger'
                  onClick={() => this.handleEdit("toggleOpen")}
                  disabled={!locationData.open}
                >
                  Close
                </Button>
              </ButtonGroup>
              <div
                className='PopulationEdit AdminEditItem'
                style={{ opacity: locationData.open ? 1 : 0.25 }}
              >
                <div>
                  <b>Population: </b>
                  <Button
                    variant='secondary'
                    onClick={() => this.handleEdit("addOne")}
                    disabled={
                      !locationData.open ||
                      locationData.population === locationData.capacity
                    }
                  >
                    +1
                  </Button>{" "}
                  <Button
                    variant='secondary'
                    onClick={() => this.handleEdit("subOne")}
                    disabled={
                      !locationData.open || locationData.population === 0
                    }
                  >
                    -1
                  </Button>
                </div>
                <InputGroup className='CustomPopulation'>
                  <InputGroup.Prepend>
                    <InputGroup.Text>Custom:</InputGroup.Text>
                  </InputGroup.Prepend>
                  <FormControl
                    ref={this.setPopulationRef}
                    defaultValue={0}
                    type='number'
                    min={0}
                    max={locationData.capacity}
                  />
                  <InputGroup.Append>
                    <Button
                      variant='secondary'
                      onClick={() => this.handleEdit("setPopulation")}
                      disabled={!locationData.open}
                    >
                      Set
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default AdminPage;
