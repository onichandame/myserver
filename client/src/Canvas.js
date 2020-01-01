import React from 'react'
import Jumbotron from 'react-bootstrap/Jumbotron'

class Canvas extends React.Component{
  constructor(props){
    super(props)
    this.state={
      page:props.page
    }
  }

  render(){
    return (
      <Jumbotron>
        <h1>
          {this.props.page}
        </h1>
      </Jumbotron>
    )
  }
}
export default Canvas
