import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'

import Canvas from './Canvas'
import './overbar.css'

class Main extends React.Component{
  constructor(props){
    super(props)
    this.state={
      page:'home'
    }
  }

  render(){
    return (
      <div>
        <Navbar collapseOnSelect fixed="top" expand="lg">
          <Navbar.Brand onClick={this.displayHome.bind(this)}>Xiao's</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
              <NavDropdown title="App" id="app" onClick={this.displayApps.bind(this)}>
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link onClick={this.displayAbout.bind(this)}>About</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="#deets">User</Nav.Link>
              <Nav.Link eventKey={2} href="#memes">
                Dank memes
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Canvas page={this.state.page}/>
      </div>
    )
  }

  displayHome(e){
    this.setState({page:'home'})
  }
  displayApps(e){
    this.setState({page:'app'})
  }
  displayAbout(e){
    this.setState({page:'about'})
  }
}
export default Main
