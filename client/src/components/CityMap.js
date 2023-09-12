import React, { useEffect, useState, useReducer } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import Skeleton from "@material-ui/lab/Skeleton";
import Box from "@material-ui/core/Box";
import reducer from "./ReducerFunction/ReducerFunction";

import ResultList from "./ResultList";
import GetActivity from "../services/GetActivity";
import GetDestination from "../services/GetDestination";
import LocationSearchBar from "./LocationSearchBar";

const CityMap = (props) => {
    const [state, dispatch] = useReducer(reducer, {
        chosenLocation: { lat: 42.361, lng: -71.057 },
        customActivities: [],
        searchResults: [],
        selectedMarker: null,
    });

    const [openInfoWindow, setOpenInfoWindow] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [error, setError] = useState("");

    const loader = new Loader({
        apiKey: "AIzaSyClukZ0HyAZru-8zwolHjvS8SnTCaK3V7c",
        libraries: ["places"],
    });

    const getLocation = (request) => {
        loader.load().then(() => {
            const service = new google.maps.places.PlacesService(map);
            const searchRequest = {
                query: request,
            };
            service.textSearch(searchRequest, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    dispatch({
                        type: "chosenLocation",
                        chosenLocation: results[0].geometry.location,
                    });
                } else {
                    setError(`No results found for "${props.mapSearchQuery}".`);
                    dispatch({
                        type: "searchResults",
                        searchResults: [],
                    });
                }
            });
        });
    };

    const centerMapOnMarker = (marker) => {
        dispatch({
            type: "selectedMarker",
            selectedMarker: marker === state.selectedMarker ? null : marker,
        });
    };

    useEffect(() => {
        setError("");
        dispatch({ type: "selectedMarker", selectedMarker: null });
        loader.load().then(() => {
            const map = new google.maps.Map(document.getElementById("map"), {
                center: state.chosenLocation,
                zoom: 17,
            });

            const userMarker = new google.maps.Marker({
                position: state.chosenLocation,
                map: map,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                },
                title: "Your Location",
            });

            const service = new google.maps.places.PlacesService(map);

            const addMarkersAndInfoWindows = (places) => {
                places.forEach((result) => {
                    let resultContent;
                    if (result.photos) {
                        resultContent =
                            `<p>${result.name}</p>` +
                            `<p>${result.formatted_address}</p>` +
                            `<img src="${result.photos && result.photos[0].getUrl()}" alt="${
                                result.name
                            }" style="max-width: 100px; max-height: 100px;">`;
                    } else {
                        resultContent =
                            `<p>${result.name}</p>` + `<p>${result.formatted_address}</p>`;
                    }

                    const marker = new google.maps.Marker({
                        position: new google.maps.LatLng(
                            result.geometry.location.lat(),
                            result.geometry.location.lng()
                        ),
                        map: map,
                    });

                    const infowindow = new google.maps.InfoWindow({
                        content: resultContent,
                        ariaLabel: result.name,
                    });

                    marker.addListener("click", () => {
                        if (openInfoWindow) {
                            openInfoWindow.close();
                        }

                        if (result.geometry.location === state.selectedMarker) {
                            dispatch({ type: "selectedMarker", selectedMarker: null });
                            setOpenInfoWindow(null);
                        } else {
                            dispatch({
                                type: "selectedMarker",
                                selectedMarker: result.geometry.location,
                            });
                            infowindow.open(map, marker);
                            setOpenInfoWindow(infowindow);
                            setSelectedActivity(result.activity);
                        }
                    });
                });
            };

            state.customActivities.forEach((activity) => {
                const request = {
                    query: activity.name,
                    location: state.chosenLocation,
                    radius: "100",
                };

                service.textSearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        results.forEach((result) => {
                            result.activity = activity.name;
                        });
                        dispatch({
                            type: "searchResults",
                            searchResults: (prevResults) => [...results, ...prevResults],
                        });
                        addMarkersAndInfoWindows(results);
                        map.setCenter(state.chosenLocation);
                    } else {
                        setError(`No ${activity.query} found.`);
                    }
                });
            });
        });
    }, [state.chosenLocation]);

    useEffect(() => {
        getLocation(props.mapSearchQuery);
    }, [props.mapSearchQuery]);

    useEffect(() => {
        GetActivity.getCustomActivities().then((activityData) => {
            dispatch({ type: "customActivities", customActivities: activityData });
        });
        getLocation(props.computedMatch.params.name);
    }, []);

    return (
        <div className="grid-x home-page-div">
            <div className="cell small-12 activity-title-1">
                <h1 className="page-title-1">
                    What you like{" "}
                    {props.mapSearchQuery
                        ? `in ${_.upperFirst(props.mapSearchQuery)}`
                        : `in ${props.computedMatch.params.name}`}
                </h1>

                <LocationSearchBar setMapSearchQuery={props.setMapSearchQuery} />
            </div>
            <div className="cell small-12 medium-6 container-of-containers">
                <div className="cell small-12"></div>
                {state.chosenLocation.lat === 42.361 ? (
                    <Box pt={0.5} align="center">
                        <Skeleton width="50%" height="100px" />
                        <Skeleton width="50%" height="100px" />
                        <Skeleton width="50%" height="100px" />
                        <Skeleton width="50%" height="100px" />
                    </Box>
                ) : (
                    <ResultList
                        dispatch={dispatch}
                        state={state}
                        centerMapOnMarker={centerMapOnMarker}
                        setSelectedActivity={setSelectedActivity}
                        selectedActivity={selectedActivity}
                    />
                )}
                {error ? (
                    <div className="location-error">
                        <h3>{error} </h3>
                        <p>Please search the location you'd like to see in the search bar above</p>
                    </div>
                ) : null}
            </div>
            <div className="cell small-12 medium-6 ">
                <div id="map" className="container-4-map"></div>
            </div>
        </div>
    );
};

export default CityMap;
