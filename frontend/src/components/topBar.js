import React, { Fragment } from 'react';

const TopBar = () => {
  return (
    <Fragment>
      <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/#">Local Chat</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarCollapse">
          <button id="userListButton" className="btn btn-link">User List</button>
        </div>
      </nav>
    </Fragment>
  );
};

export default TopBar;
