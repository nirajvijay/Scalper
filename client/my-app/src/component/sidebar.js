import React, { Component } from "react";
import "./sidebar.css";
import {
  BiSolidDashboard,
  BiUser,
  BiBook,
  BiSolidBank,
  BiCog,
  BiLogOut,
} from "react-icons/bi";
import { FaBars } from "react-icons/fa";
import { NavLink } from "react-router-dom";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggle = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    const { isOpen } = this.state;
    const menuItem = [
      {
        path: "/home",
        name: "NIFTY50",
        icon: <BiSolidDashboard />,
      },
      {
        path: "/finifty",
        name: "F-NIFTY",
        icon: <BiSolidBank />,
      },
      {
        path: "/OrderBook",
        name: "Order",
        icon: <BiBook />,
      },
      {
        path: "/about",
        name: "User",
        icon: <BiUser />,
      },
      {
        path: "/product",
        name: "Settings",
        icon: <BiCog />,
      },
    ];

    return (
      <div className="container1">
        <div style={{ width: isOpen ? "200px" : "50px" }} className="sidebar">
          <div className="top_section">
            <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
              Scalper
            </h1>
            <div
              style={{ marginLeft: isOpen ? "40px" : "0px" }}
              className="bars"
            >
              <FaBars onClick={this.toggle} />
            </div>
          </div>
          {menuItem.map((item, index) => (
            <NavLink
              to={item.path}
              key={index}
              className="link"
              activeclassName="active"
            >
              <div className="icon">{item.icon}</div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                {item.name}
              </div>
            </NavLink>
          ))}

          <div
            className="profile_content"
            style={{ display: isOpen ? "block" : "none" }}
          >
            <div className="name">LOGOUT</div>
          </div>

          <BiLogOut className="ico" id="log_out" />
        </div>
        <main>{this.props.children}</main>
      </div>
    );
  }
}

export default Sidebar;
