import React, { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";
import logo from "../../assets/logo.png"; //

const Header = () => {
  const location = useLocation(); //

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); //

  useEffect(() => {
    // Check authentication status and role from local storage
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    setIsLoggedIn(Boolean(token));
    setRole(storedRole);
  }, [location]); // Re-run effect on route changes to keep UI in sync

  // Logic to determine the correct dashboard base path based on user role
  const getDashboardPath = () => {
    if (role === "admin") return "/admin/approval";
    if (role === "supervisor") return "/supervisor/dashboard";
    return "/dashboard";
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/home">
          <img
            src={logo}
            alt="Logo"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          WANA
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/home">Home</Nav.Link>

            {isLoggedIn && (
              <>
                <Nav.Link as={Link} to={getDashboardPath()}>
                  Dashboard
                </Nav.Link>
                
                {/* Supervisor-specific navigation */}
                {role === "supervisor" && (
                  <>
                    <Nav.Link as={Link} to="/supervisor/ongoing-events">
                      Ongoing Events
                    </Nav.Link>
                    <Nav.Link as={Link} to="/supervisor/acceptors">
                      Acceptors
                    </Nav.Link>
                    <Nav.Link as={Link} to="/supervisor/history">
                      History
                    </Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav>
            {!isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Sign Up</Nav.Link>
              </>
            ) : (
              <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;