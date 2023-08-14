import React from "react";
import PopularDestinationList from "./PopularDestinationList";

const HomePage = (props) => {

    return(
        <div className="grid-x home-page-div">
            <div className="cell small-12 medium-12 large-6">
                <div className="container">
                    <h1>Hello from user home page</h1>
                    <p>Button that shows up when you're signed in</p>
                    <p>Otherwise a message that says sign-in/ sign-up and a link to do that</p>
                </div>
            </div>
            <div className="cell small-12 medium-12 large-6">
                <PopularDestinationList />
            </div>
            <div className="cell large-12">
            <div className="container-2">
                <h2>Pictures scrolling of fun activities within a mile of me</h2>
                <p>rendered component</p>
            </div>
            </div>
        </div>
    )
}

export default HomePage